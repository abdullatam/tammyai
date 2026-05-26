# notification_manager.py
"""
Tammy V2 — Centralized Notification Manager.
All platform features call create_notification() to emit notifications.
Handles dedup, rate limiting, icon mapping, and MongoDB persistence.
"""

import time
from typing import Optional, Dict, List, Any
from bson import ObjectId
from backend.logger import get_logger

logger = get_logger(__name__)

# ── Icon mapping ──────────────────────────────────────────────────────────────

NOTIFICATION_ICONS = {
    "calendar_new": "📅",
    "calendar_reminder": "⏰",
    "decision_new": "⚖️",
    "decision_overdue": "⏳",
    "decision_followed_up": "✅",
    "mirror_moment_ready": "🪞",
    "blind_spot_new": "👁️",
    "blind_spot_confirmed": "🔍",
    "tammy_connect_request": "🤝",
    "tammy_connect_accepted": "🎉",
    "tammy_connect_message": "💬",
    "project_created": "🗂️",
    "project_updated": "📝",
    "project_stalled": "⚠️",
    "founder_dna_ready": "🧬",
    "arc_ready": "📈",
    "calibration_update": "🎯",
    "intervention": "💡",
    "goal_checkin": "🏁",
    "advice_followup": "🔄",
    "dangerous_quiet": "🤫",
    "pattern_break": "💥",
}

# Default priorities per type (can be overridden)
DEFAULT_PRIORITIES = {
    "calendar_new": "medium",
    "calendar_reminder": "high",
    "decision_new": "medium",
    "decision_overdue": "high",
    "decision_followed_up": "low",
    "mirror_moment_ready": "high",
    "blind_spot_new": "medium",
    "blind_spot_confirmed": "high",
    "tammy_connect_request": "high",
    "tammy_connect_accepted": "high",
    "tammy_connect_message": "high",
    "project_created": "low",
    "project_updated": "low",
    "project_stalled": "medium",
    "founder_dna_ready": "high",
    "arc_ready": "high",
    "calibration_update": "medium",
    "intervention": "medium",
    "goal_checkin": "medium",
    "advice_followup": "medium",
    "dangerous_quiet": "high",
    "pattern_break": "high",
}

# Action URL defaults
DEFAULT_ACTION_URLS = {
    "calendar_new": "/calendar",
    "calendar_reminder": "/calendar",
    "decision_new": "/decisions",
    "decision_overdue": "/decisions",
    "decision_followed_up": "/decisions",
    "mirror_moment_ready": "/mirror",
    "blind_spot_new": "/blindspots",
    "blind_spot_confirmed": "/blindspots",
    "tammy_connect_request": "/network",
    "tammy_connect_accepted": "/network",
    "tammy_connect_message": "/network",
    "project_created": "/projects",
    "project_updated": "/projects",
    "project_stalled": "/projects",
    "founder_dna_ready": "/dna",
    "arc_ready": "/arc",
    "calibration_update": "/calibration",
    "intervention": "/chat",
    "goal_checkin": "/chat",
    "advice_followup": "/chat",
    "dangerous_quiet": "/dna",
    "pattern_break": "/dna",
}


def _get_db():
    """Get MongoDB database handle."""
    from backend.db.mongodb_client import _mongodb_client
    db = _mongodb_client._db
    if db is None:
        raise RuntimeError("MongoDB not connected")
    return db


def create_notification(user_id: str, data: dict) -> Optional[dict]:
    """
    Create a notification for a user.

    Args:
        user_id: The target user's ID. Must be non-empty.
        data: Dict with keys:
            type (str, required): Notification type from the type list.
            title (str, required): Short headline.
            body (str, required): One sentence description.
            action_url (str, optional): Where to navigate on click.
            action_label (str, optional): Button text.
            priority (str, optional): "high" | "medium" | "low".
            metadata (dict, optional): Type-specific extra data.

    Returns:
        The created notification document, or None if deduped/failed.

    Raises:
        ValueError: If user_id is empty or type/title/body are missing.
    """
    if not user_id or not user_id.strip():
        raise ValueError("create_notification requires a non-empty user_id")

    ntype = data.get("type", "")
    title = data.get("title", "")
    body = data.get("body", "")

    if not ntype:
        raise ValueError("Notification type is required")
    if not title:
        raise ValueError("Notification title is required")

    try:
        db = _get_db()
        col = db["notifications"]

        # ── Rate limiting / dedup ─────────────────────────────────
        # Same (user_id, type, ref_id) cannot fire twice within 1 hour.
        one_hour_ago = time.time() - 3600
        metadata = data.get("metadata") or {}
        ref_id = metadata.get("ref_id")

        dedup_filter = {
            "user_id": user_id,
            "type": ntype,
            "created_at": {"$gt": one_hour_ago},
        }
        if ref_id:
            dedup_filter["metadata.ref_id"] = ref_id

        existing = col.find_one(dedup_filter)
        if existing:
            logger.debug(f"Notification deduped: {ntype} for {user_id}")
            return None

        # ── Build document ────────────────────────────────────────
        now = time.time()
        doc = {
            "user_id": user_id,
            "type": ntype,
            "title": title,
            "body": body or "",
            "action_url": data.get("action_url") or DEFAULT_ACTION_URLS.get(ntype, "/chat"),
            "action_label": data.get("action_label") or "View",
            "icon": NOTIFICATION_ICONS.get(ntype, "🔔"),
            "priority": data.get("priority") or DEFAULT_PRIORITIES.get(ntype, "medium"),
            "read": False,
            "created_at": now,
            "metadata": metadata,
        }

        result = col.insert_one(doc)
        doc["_id"] = result.inserted_id
        logger.info(f"🔔 Notification created: [{ntype}] '{title}' for user {user_id}")
        return doc

    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        return None


def get_unread_count(user_id: str) -> int:
    """Count unread notifications for a user."""
    try:
        db = _get_db()
        return db["notifications"].count_documents({"user_id": user_id, "read": False})
    except Exception:
        return 0


def get_notifications(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    priority: Optional[str] = None,
) -> List[dict]:
    """Fetch paginated notifications for a user."""
    try:
        db = _get_db()
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        if priority:
            query["priority"] = priority

        docs = list(
            db["notifications"]
            .find(query)
            .sort("created_at", -1)
            .skip(offset)
            .limit(limit)
        )
        # Serialize ObjectId
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception as e:
        logger.error(f"Failed to fetch notifications: {e}")
        return []


def mark_read(notification_id: str, user_id: str) -> bool:
    """Mark a single notification as read. Verifies ownership."""
    try:
        db = _get_db()
        result = db["notifications"].update_one(
            {"_id": ObjectId(notification_id), "user_id": user_id},
            {"$set": {"read": True}},
        )
        return result.modified_count > 0
    except Exception as e:
        logger.error(f"Failed to mark notification read: {e}")
        return False


def mark_all_read(user_id: str) -> int:
    """Mark all notifications as read for a user. Returns count marked."""
    try:
        db = _get_db()
        result = db["notifications"].update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}},
        )
        return result.modified_count
    except Exception as e:
        logger.error(f"Failed to mark all notifications read: {e}")
        return 0
