# calendar_manager.py
"""
Tammy — Internal calendar (no OAuth required).
Users add events manually or via chat. Tammy reads, creates, and edits events.
"""

import re
import time
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from backend.db.mongodb_client import _mongodb_client
from backend.logger import get_logger

logger = get_logger(__name__)


def _col():
    db = _mongodb_client._db
    return db["calendar_events"] if db is not None else None


def _today_bounds():
    now = datetime.now()
    start = datetime(now.year, now.month, now.day).timestamp()
    return start, start + 86400


def _parse_date(date_str: str) -> str:
    """Convert natural language or YYYY-MM-DD to YYYY-MM-DD."""
    now = datetime.now()
    s = date_str.lower().strip()
    if s in ("today", ""):
        return now.strftime("%Y-%m-%d")
    if s == "tomorrow":
        return (now + timedelta(days=1)).strftime("%Y-%m-%d")
    if s == "yesterday":
        return (now - timedelta(days=1)).strftime("%Y-%m-%d")

    # "next monday" / "this friday" etc.
    days_map = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
                "friday": 4, "saturday": 5, "sunday": 6}
    for day_name, target_wd in days_map.items():
        if day_name in s:
            delta = (target_wd - now.weekday() + 7) % 7
            if delta == 0:
                delta = 7  # "next" semantics
            return (now + timedelta(days=delta)).strftime("%Y-%m-%d")

    # "May 5", "5th May", "5 May 2026" etc.
    months_map = {"jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
                  "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12}
    for abbr, mnum in months_map.items():
        if abbr in s:
            day_m = re.search(r'\b(\d{1,2})\b', s)
            day = int(day_m.group(1)) if day_m else 1
            year_m = re.search(r'\b(202[4-9]|203\d)\b', s)
            year = int(year_m.group(1)) if year_m else now.year
            return f"{year}-{mnum:02d}-{day:02d}"

    # Already YYYY-MM-DD
    if re.match(r'\d{4}-\d{2}-\d{2}', date_str):
        return date_str[:10]

    return now.strftime("%Y-%m-%d")


def _parse_time(time_str: str) -> str:
    """Convert '3pm', '15:00', '3:30 PM' → 'HH:MM'."""
    if not time_str:
        return ""
    s = time_str.lower().strip()
    # 12h with am/pm
    m = re.match(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', s)
    if m:
        h, mn, ampm = int(m.group(1)), int(m.group(2) or 0), m.group(3)
        if ampm == "pm" and h != 12:
            h += 12
        if ampm == "am" and h == 12:
            h = 0
        return f"{h:02d}:{mn:02d}"
    # 24h
    m = re.match(r'(\d{1,2}):(\d{2})', s)
    if m:
        return f"{int(m.group(1)):02d}:{int(m.group(2)):02d}"
    # bare hour
    m = re.match(r'^(\d{1,2})$', s)
    if m:
        h = int(m.group(1))
        return f"{h:02d}:00"
    return ""


def add_event(user_id: str, title: str, date_str: str = "today",
              time_str: str = "", duration_minutes: int = 60, event_type: str = "general",
              notes: str = "", attendees: str = "", session_id: str = "") -> Dict:
    col = _col()
    if col is None:
        return {}

    date_clean = _parse_date(date_str)
    time_clean = _parse_time(time_str) if time_str else ""

    try:
        y, mo, d = map(int, date_clean.split("-"))
        h, mi = (map(int, time_clean.split(":"))) if time_clean else (0, 0)
        event_ts = datetime(y, mo, d, h, mi).timestamp()
    except Exception:
        event_ts = time.time()

    doc = {
        "event_id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": title.strip()[:140],
        "date": date_clean,
        "time": time_clean or "09:00",
        "duration_minutes": duration_minutes,
        "type": event_type,
        "notes": notes[:400],
        "participants": [p.strip() for p in attendees.split(",") if p.strip()] if attendees else [],
        "created_from_session": session_id,
        "timestamp": event_ts,
        "created_at": time.time(),
    }
    col.insert_one(doc)
    
    # Fire notification
    try:
        from backend.core_services.notification_manager import create_notification
        create_notification(user_id, {
            "type": "calendar_new",
            "title": f"Calendar Event: {doc['title']}",
            "body": f"Scheduled for {doc['date']} at {doc['time']}",
            "action_url": "/calendar"
        })
    except Exception as e:
        logger.error(f"Failed to create calendar notification: {e}")
    doc.pop("_id", None)
    logger.info(f"Calendar event added for {user_id}: {title} on {date_clean}")
    return doc


def update_event(user_id: str, event_id: str, updates: Dict) -> bool:
    col = _col()
    if col is None:
        return False
    allowed = {"title", "date", "time", "type", "notes", "attendees"}
    clean = {k: v for k, v in updates.items() if k in allowed}
    if "date" in clean:
        clean["date"] = _parse_date(clean["date"])
    if "time" in clean:
        clean["time"] = _parse_time(clean["time"])
    if not clean:
        return False
    # Recompute timestamp if date/time changed
    if "date" in clean or "time" in clean:
        try:
            ev = col.find_one({"user_id": user_id, "event_id": event_id}, {"_id": 0})
            if ev:
                date_s = clean.get("date", ev.get("date", ""))
                time_s = clean.get("time", ev.get("time", ""))
                y, mo, d = map(int, date_s.split("-"))
                h, mi = (map(int, time_s.split(":"))) if time_s else (0, 0)
                clean["timestamp"] = datetime(y, mo, d, h, mi).timestamp()
        except Exception:
            pass
    try:
        result = col.update_one({"user_id": user_id, "event_id": event_id}, {"$set": clean})
        return result.matched_count > 0
    except Exception as e:
        logger.error(f"update_event failed: {e}")
        return False


def get_today_events(user_id: str) -> List[Dict]:
    col = _col()
    if col is None:
        return []
    start, end = _today_bounds()
    try:
        docs = list(col.find(
            {"user_id": user_id, "timestamp": {"$gte": start, "$lt": end}},
            {"_id": 0}
        ).sort("timestamp", 1))
        return docs
    except Exception as e:
        logger.error(f"get_today_events failed: {e}")
        return []


def get_upcoming_events(user_id: str, days: int = 7) -> List[Dict]:
    col = _col()
    if col is None:
        return []
    now_ts = time.time()
    end_ts = now_ts + days * 86400
    try:
        docs = list(col.find(
            {"user_id": user_id, "timestamp": {"$gte": now_ts, "$lt": end_ts}},
            {"_id": 0}
        ).sort("timestamp", 1).limit(30))
        return docs
    except Exception as e:
        logger.error(f"get_upcoming_events failed: {e}")
        return []


def get_month_events(user_id: str, year: int, month: int) -> List[Dict]:
    col = _col()
    if col is None:
        return []
    start = datetime(year, month, 1).timestamp()
    if month == 12:
        end = datetime(year + 1, 1, 1).timestamp()
    else:
        end = datetime(year, month + 1, 1).timestamp()
    try:
        docs = list(col.find(
            {"user_id": user_id, "timestamp": {"$gte": start, "$lt": end}},
            {"_id": 0}
        ).sort("timestamp", 1))
        return docs
    except Exception as e:
        logger.error(f"get_month_events failed: {e}")
        return []


def delete_event(user_id: str, event_id: str) -> bool:
    col = _col()
    if col is None:
        return False
    try:
        result = col.delete_one({"user_id": user_id, "event_id": event_id})
        return result.deleted_count > 0
    except Exception as e:
        logger.error(f"delete_event failed: {e}")
        return False


# ── Natural language intent detection ─────────────────────────────────────────

_INTENT_KEYWORDS = re.compile(
    r'\b(schedule|add|book|set up|create|remind|block|put|log|plan)\b.*'
    r'\b(meeting|call|session|event|lunch|dinner|coffee|standup|review|check.?in|appointment|demo|sync)\b'
    r'|'
    r'\b(meeting|call|session|event|lunch|dinner|coffee|standup|review|check.?in|appointment|demo|sync)\b.*'
    r'\b(on|at|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next|this)\b',
    re.IGNORECASE,
)


def detect_calendar_intent(text: str) -> bool:
    """Quick heuristic — does this message ask to add/schedule a calendar event?"""
    return bool(_INTENT_KEYWORDS.search(text))


def parse_event_from_message(text: str, user_id: str) -> Optional[Dict]:
    """
    LLM-based extraction of event details from a natural language message.
    Returns a dict {title, date, time, attendees, notes} or None.
    """
    try:
        from ai.core.llm_client import get_response
        today = datetime.now().strftime("%Y-%m-%d (%A)")
        system = (
            "You extract calendar event details from a message. "
            f"Today is {today}. "
            "Return ONLY a JSON object with keys: title (infer from context if not explicit), date (YYYY-MM-DD format. Resolve relative dates precisely: 'tomorrow'->current+1, 'next monday'->next monday from today), time (HH:MM 24h format, default to '09:00' if not specified), duration_minutes (integer, default to 60 if not specified), "
            "attendees (comma-sep names or empty), notes (any extra context or empty). "
            "If you can't extract a clear event scheduling request, return: null"
        )
        result = get_response(system, "", text)
        result = result.strip()
        if result.lower() == "null":
            return None
        import json
        # Strip markdown code fences if present
        result = re.sub(r'^```(?:json)?\s*', '', result, flags=re.MULTILINE)
        result = re.sub(r'\s*```$', '', result, flags=re.MULTILINE)
        data = json.loads(result)
        if not data or not data.get("title"):
            return None
        return data
    except Exception as e:
        logger.error(f"parse_event_from_message failed: {e}")
        return None


__all__ = [
    "add_event", "update_event", "delete_event",
    "get_today_events", "get_upcoming_events", "get_month_events",
    "detect_calendar_intent", "parse_event_from_message",
    "_parse_date", "_parse_time",
]
