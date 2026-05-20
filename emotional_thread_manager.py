import time
import json
import re
from datetime import datetime
from collections import Counter
from bson import ObjectId
from typing import List, Dict, Any, Optional

from mongodb_client import emotional_threads_col, _mongodb_client
from logger import get_logger
from llm_client import get_response

logger = get_logger(__name__)

STATUS_ACTIVE = "ACTIVE"
STATUS_RESOLVED = "RESOLVED"
STATUS_DORMANT = "DORMANT"

SIGNIFICANT_EMOTIONS = {
    "grief", "fear", "anger", "anxiety", "overwhelm",
    "nervousness", "sadness", "remorse", "disappointment", "disgust"
}

# Trigger keyword buckets for pattern tagging
_DEADLINE_WORDS   = {"deadline", "due", "ship", "launch", "release", "sprint", "end of", "by friday", "by monday"}
_EVENT_WORDS      = {"presentation", "meeting", "pitch", "interview", "demo", "conference", "board", "review"}
_PEOPLE_WORDS     = {"co-founder", "cofounder", "cto", "ceo", "investor", "team", "partner", "employee", "hire"}

def _get_time():
    return time.time()

def get_active_threads(user_id: str) -> List[Dict]:
    if not user_id:
        raise ValueError("user_id is required")
    if emotional_threads_col is None:
        return []
    
    threads = list(emotional_threads_col.find(
        {"user_id": user_id, "status": STATUS_ACTIVE}
    ))
    
    # Sort: needs_followup first, then last_updated desc
    threads.sort(key=lambda x: (not x.get("needs_followup", False), -x.get("last_updated", 0)))
    
    # Convert ObjectIds to string for JSON serialization
    for t in threads:
        t["_id"] = str(t["_id"])
    return threads

def get_threads_needing_followup(user_id: str) -> List[Dict]:
    if not user_id:
        raise ValueError("user_id is required")
    
    threads = get_active_threads(user_id)
    followup_threads = []
    
    for thread in threads:
        if should_check_in(thread):
            thread["needs_followup"] = True
            followup_threads.append(thread)
            # update in db
            if emotional_threads_col is not None:
                emotional_threads_col.update_one(
                    {"_id": ObjectId(thread["_id"])},
                    {"$set": {"needs_followup": True}}
                )
            
    return followup_threads

def should_check_in(thread: Dict) -> bool:
    intensity = thread.get("current_intensity", 0)
    last_updated = thread.get("last_updated", 0)
    
    elapsed_days = (_get_time() - last_updated) / 86400.0
    
    if intensity > 7 and elapsed_days >= 1:
        return True
    elif 4 <= intensity <= 7 and elapsed_days >= 3:
        return True
    elif intensity < 4 and elapsed_days >= 7:
        return True
    return False

# ── Pattern Detection ─────────────────────────────────────────────────────────

def _all_user_threads(user_id: str) -> List[Dict]:
    """Fetch ALL threads (any status) for a user."""
    if emotional_threads_col is None:
        return []
    return list(emotional_threads_col.find({"user_id": user_id}))


def _tag_single_thread(thread: Dict, all_threads: List[Dict]) -> List[str]:
    """
    Derive pattern_tags for one thread by comparing it against the user's history.
    Fast — no LLM call.
    """
    tags = set(thread.get("pattern_tags", []))
    emotion = (thread.get("current_emotion") or thread.get("initial_state", {}).get("emotion", "")).lower()
    trigger = (thread.get("initial_state", {}).get("trigger") or "").lower()
    intensity = thread.get("current_intensity", 0) or thread.get("initial_state", {}).get("intensity", 0)
    created_at = thread.get("created_at", 0)
    thread_id = thread.get("thread_id")

    # Count same emotion in other threads
    same_emotion_count = sum(
        1 for t in all_threads
        if t.get("thread_id") != thread_id
        and (t.get("current_emotion") or t.get("initial_state", {}).get("emotion", "")).lower() == emotion
    )
    if same_emotion_count >= 2:
        tags.add("recurring_emotion")

    # Count same trigger keywords in other threads
    trigger_words = set(re.sub(r"[^a-z0-9 ]", "", trigger).split())
    recurring_trigger_count = 0
    for t in all_threads:
        if t.get("thread_id") == thread_id:
            continue
        other_trigger = (t.get("initial_state", {}).get("trigger") or "").lower()
        other_words = set(re.sub(r"[^a-z0-9 ]", "", other_trigger).split())
        if trigger_words & other_words:
            recurring_trigger_count += 1
    if recurring_trigger_count >= 2:
        tags.add("recurring_trigger")

    # Keyword-based trigger tags
    if any(w in trigger for w in _DEADLINE_WORDS):
        tags.add("deadline_stress")
    if any(w in trigger for w in _EVENT_WORDS):
        tags.add("pre_event_spiral")
    if any(w in trigger for w in _PEOPLE_WORDS):
        tags.add("people_pattern")

    # Intensity tags
    if intensity >= 8:
        tags.add("high_intensity")
    elif intensity <= 3 and emotion in SIGNIFICANT_EMOTIONS:
        tags.add("suppressed")

    # Resolution speed (only if resolved)
    if thread.get("status") == STATUS_RESOLVED:
        resolved_entries = [e for e in thread.get("evolution", []) if e.get("update_type") == "resolution"]
        if resolved_entries:
            elapsed_days = (resolved_entries[-1]["timestamp"] - created_at) / 86400.0
            if elapsed_days <= 1:
                tags.add("rapid_resolution")
            elif elapsed_days >= 7:
                tags.add("slow_burn")

    # Cyclical: check if same emotion appears every N days with consistent gap
    same_emotion_threads = sorted(
        [t for t in all_threads if (t.get("current_emotion") or t.get("initial_state", {}).get("emotion", "")).lower() == emotion],
        key=lambda t: t.get("created_at", 0)
    )
    if len(same_emotion_threads) >= 3:
        gaps = [
            same_emotion_threads[i + 1]["created_at"] - same_emotion_threads[i]["created_at"]
            for i in range(len(same_emotion_threads) - 1)
        ]
        avg_gap = sum(gaps) / len(gaps)
        if avg_gap > 0:
            deviation = (sum((g - avg_gap) ** 2 for g in gaps) / len(gaps)) ** 0.5
            coefficient_of_variation = deviation / avg_gap
            if coefficient_of_variation < 0.4:  # consistent gap = cyclical
                tags.add("cyclical")

    return list(tags)


def tag_thread_and_save(user_id: str, thread_id: str) -> List[str]:
    """Re-derive pattern_tags for a thread and persist to DB."""
    if emotional_threads_col is None:
        return []
    all_threads = _all_user_threads(user_id)
    thread = next((t for t in all_threads if t.get("thread_id") == thread_id), None)
    if not thread:
        return []
    tags = _tag_single_thread(thread, all_threads)
    emotional_threads_col.update_one(
        {"thread_id": thread_id},
        {"$set": {"pattern_tags": tags}}
    )
    return tags


def detect_cyclical_patterns(user_id: str) -> List[Dict]:
    """
    Identify emotions that recur on a consistent schedule.
    Returns a list of pattern dicts: {emotion, avg_gap_days, occurrences, tag}.
    """
    all_threads = _all_user_threads(user_id)
    by_emotion: Dict[str, List[float]] = {}
    for t in all_threads:
        em = (t.get("current_emotion") or t.get("initial_state", {}).get("emotion", "")).lower()
        if em and em != "neutral":
            by_emotion.setdefault(em, []).append(t.get("created_at", 0))

    results = []
    for emotion, timestamps in by_emotion.items():
        if len(timestamps) < 3:
            continue
        timestamps.sort()
        gaps = [(timestamps[i + 1] - timestamps[i]) / 86400.0 for i in range(len(timestamps) - 1)]
        avg_gap = sum(gaps) / len(gaps)
        if avg_gap < 0.5:
            continue
        deviation = (sum((g - avg_gap) ** 2 for g in gaps) / len(gaps)) ** 0.5
        cv = deviation / avg_gap
        if cv < 0.4:
            results.append({
                "emotion": emotion,
                "avg_gap_days": round(avg_gap, 1),
                "occurrences": len(timestamps),
                "tag": "cyclical",
                "consistency": round(1 - cv, 2),
            })
    return sorted(results, key=lambda x: -x["occurrences"])


def detect_trigger_patterns(user_id: str) -> List[Dict]:
    """
    Find triggers that appear repeatedly across threads.
    Returns list of {trigger_theme, count, emotion_mix, threads}.
    """
    all_threads = _all_user_threads(user_id)
    trigger_words: Counter = Counter()
    word_to_threads: Dict[str, List[str]] = {}

    for t in all_threads:
        trigger = (t.get("initial_state", {}).get("trigger") or "").lower()
        words = [w for w in re.sub(r"[^a-z0-9 ]", "", trigger).split() if len(w) > 3]
        for w in words:
            trigger_words[w] += 1
            word_to_threads.setdefault(w, []).append(t.get("thread_id", ""))

    results = []
    seen_threads = set()
    for word, count in trigger_words.most_common(10):
        if count < 2:
            break
        thread_ids = word_to_threads[word]
        if all(tid in seen_threads for tid in thread_ids):
            continue
        emotions = []
        for t in all_threads:
            if t.get("thread_id") in thread_ids:
                em = (t.get("current_emotion") or t.get("initial_state", {}).get("emotion", "")).lower()
                if em:
                    emotions.append(em)
                seen_threads.add(t.get("thread_id", ""))
        results.append({
            "trigger_theme": word,
            "count": count,
            "emotion_mix": list(set(emotions)),
            "thread_ids": thread_ids,
        })

    return results


def detect_resolution_patterns(user_id: str) -> Dict:
    """
    Analyze how this user typically resolves emotional threads.
    Returns a summary dict with style, avg_days, total_resolved.
    """
    all_threads = _all_user_threads(user_id)
    resolved = [t for t in all_threads if t.get("status") == STATUS_RESOLVED]
    if not resolved:
        return {"style": "unknown", "avg_days": None, "total_resolved": 0}

    durations = []
    evolution_lengths = []
    resolution_texts = []

    for t in resolved:
        created = t.get("created_at", 0)
        evol = t.get("evolution", [])
        res_entries = [e for e in evol if e.get("update_type") == "resolution"]
        if res_entries:
            days = (res_entries[-1]["timestamp"] - created) / 86400.0
            durations.append(days)
            resolution_texts.append(res_entries[-1].get("context", "").lower())
        evolution_lengths.append(len(evol))

    avg_days = round(sum(durations) / len(durations), 1) if durations else None
    avg_steps = round(sum(evolution_lengths) / len(evolution_lengths), 1) if evolution_lengths else 0

    # Infer style from resolution texts and speed
    decision_keywords = {"decided", "chose", "committed", "picked", "went with"}
    action_keywords = {"shipped", "done", "finished", "completed", "launched"}
    talk_keywords = {"talked", "discussed", "conversation", "opened up", "shared"}

    decision_count = sum(1 for rt in resolution_texts if any(k in rt for k in decision_keywords))
    action_count = sum(1 for rt in resolution_texts if any(k in rt for k in action_keywords))
    talk_count = sum(1 for rt in resolution_texts if any(k in rt for k in talk_keywords))

    if decision_count >= max(action_count, talk_count):
        style = "decision-driven"
    elif action_count >= max(decision_count, talk_count):
        style = "action-driven"
    elif talk_count >= max(decision_count, action_count):
        style = "talk-driven"
    elif avg_days and avg_days <= 1:
        style = "rapid-processor"
    elif avg_steps >= 4:
        style = "slow-processor"
    else:
        style = "mixed"

    return {
        "style": style,
        "avg_days": avg_days,
        "avg_steps": avg_steps,
        "total_resolved": len(resolved),
    }


def analyze_user_patterns(user_id: str) -> Dict:
    """
    Master function. Runs all pattern detections, re-tags all active threads,
    and stores a pattern_summary on the user doc in MongoDB.
    """
    from mongodb_client import _mongodb_client
    db = _mongodb_client._db

    cyclical = detect_cyclical_patterns(user_id)
    triggers = detect_trigger_patterns(user_id)
    resolution = detect_resolution_patterns(user_id)

    # Re-tag all active threads
    all_threads = _all_user_threads(user_id)
    retagged = 0
    for t in all_threads:
        tid = t.get("thread_id")
        if tid:
            tag_thread_and_save(user_id, tid)
            retagged += 1

    summary = {
        "cyclical_patterns": cyclical,
        "trigger_patterns": triggers,
        "resolution_style": resolution,
        "last_analyzed": time.time(),
        "threads_analyzed": retagged,
    }

    if db is not None:
        try:
            from bson import ObjectId
            db["users"].update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"pattern_summary": summary}},
                upsert=False,
            )
        except Exception:
            try:
                db["users"].update_one(
                    {"user_id": user_id},
                    {"$set": {"pattern_summary": summary}},
                )
            except Exception as e:
                logger.error(f"Pattern summary save failed: {e}")

    logger.info(f"[Patterns] user={user_id} | cyclical={len(cyclical)} | triggers={len(triggers)} | style={resolution['style']} | retagged={retagged}")
    return summary


def get_pattern_summary(user_id: str) -> Optional[Dict]:
    """Return the cached pattern summary for a user from MongoDB."""
    from mongodb_client import _mongodb_client
    db = _mongodb_client._db
    if db is None:
        return None
    try:
        from bson import ObjectId
        doc = db["users"].find_one({"_id": ObjectId(user_id)}, {"pattern_summary": 1})
        return doc.get("pattern_summary") if doc else None
    except Exception:
        return None


def create_thread(user_id: str, emotion: str, intensity: int, trigger: str, context: str, session_id: str) -> Dict:
    if not user_id:
        raise ValueError("user_id is required")
        
    now = _get_time()
    thread_id = f"TH_{int(now)}_{hash(trigger) % 10000}"
    
    doc = {
        "thread_id": thread_id,
        "user_id": user_id,
        "created_at": now,
        "last_updated": now,
        "status": STATUS_ACTIVE,
        "needs_followup": False,
        "initial_state": {
            "emotion": emotion,
            "intensity": intensity,
            "trigger": trigger,
            "context": context
        },
        "evolution": [],
        "current_emotion": emotion,
        "current_intensity": intensity,
        "resolution_status": None,
        "pattern_tags": [],
        "session_ids": [session_id] if session_id else []
    }
    
    if emotional_threads_col is not None:
        result = emotional_threads_col.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        # Auto-tag immediately after insert
        try:
            tags = tag_thread_and_save(user_id, thread_id)
            doc["pattern_tags"] = tags
        except Exception as e:
            logger.error(f"Auto-tagging failed: {e}")

    return doc

def update_thread(thread_id: str, user_id: str, new_emotion: str, intensity: int, context: str, update_type: str) -> Dict:
    if not user_id:
        raise ValueError("user_id is required")
        
    if emotional_threads_col is None:
        return {}
        
    thread = emotional_threads_col.find_one({"thread_id": thread_id})
    if not thread:
        raise ValueError(f"Thread {thread_id} not found")
        
    if thread.get("user_id") != user_id:
        raise ValueError("user_id does not match thread owner")
        
    now = _get_time()
    evolution_entry = {
        "timestamp": now,
        "emotion": new_emotion,
        "intensity": intensity,
        "context": context,
        "update_type": update_type
    }
    
    update_data = {
        "current_emotion": new_emotion,
        "current_intensity": intensity,
        "last_updated": now
    }
    
    if update_type == "resolution":
        update_data["status"] = STATUS_RESOLVED
        update_data["needs_followup"] = False
        update_data["resolution_status"] = context
        
    emotional_threads_col.update_one(
        {"thread_id": thread_id},
        {
            "$push": {"evolution": evolution_entry},
            "$set": update_data
        }
    )

    thread.update(update_data)
    thread.setdefault("evolution", []).append(evolution_entry)
    thread["_id"] = str(thread["_id"])

    # Re-tag after each evolution update (2+ entries makes patterns meaningful)
    if len(thread.get("evolution", [])) >= 2:
        try:
            tag_thread_and_save(user_id, thread_id)
        except Exception as e:
            logger.error(f"Re-tagging after update failed: {e}")

    return thread

def resolve_thread(thread_id: str, user_id: str, resolution_status: str) -> Dict:
    if not user_id:
        raise ValueError("user_id is required")
    if emotional_threads_col is None:
        return {}
    thread = emotional_threads_col.find_one({"thread_id": thread_id})
    if not thread:
        raise ValueError("Thread not found")
    
    return update_thread(
        thread_id=thread_id,
        user_id=user_id,
        new_emotion=thread.get("current_emotion", ""),
        intensity=0,
        context=resolution_status,
        update_type="resolution"
    )

def detect_thread_reference(message: str, active_threads: List[Dict]) -> List[str]:
    if not active_threads:
        return []
    
    system_prompt = "You are a reference detector. Given a user message and a list of active emotional threads, identify which threads the user is referring to. Return ONLY a valid JSON list of thread_ids. Example: [\"TH_123\"]. If none, return []. Do not include markdown formatting or backticks."
    
    threads_context = "Active Threads:\n"
    for t in active_threads:
        init = t.get('initial_state', {})
        threads_context += f"- ID: {t.get('thread_id')} | Trigger: {init.get('trigger')} | Emotion: {t.get('current_emotion')}\n"
        
    prompt = f"User message: {message}\n\n{threads_context}"
    
    try:
        response = get_response(system_prompt, "", prompt)
        start = response.find('[')
        end = response.rfind(']') + 1
        if start != -1 and end != 0 and start < end:
            referenced = json.loads(response[start:end])
            if isinstance(referenced, list):
                return [t for t in referenced if isinstance(t, str)]
    except Exception as e:
        logger.error(f"Failed to detect thread reference: {e}")
        
    return []

def detect_new_significant_emotion(message: str, emotion: str, intensity: int) -> bool:
    """
    Both conditions must be true to create a new emotional thread.
    Requiring AND instead of OR eliminates false thread creation from
    marginal signals (high intensity but generic emotion, or named emotion
    at low intensity from a casual message).
    Threshold raised from 6 to 7 to further reduce false positives.
    """
    if intensity >= 7 and emotion.lower() in SIGNIFICANT_EMOTIONS:
        return True
    return False

def analyze_message_emotion(message: str) -> Dict:
    system_prompt = """Analyze the user's message for emotional content.

CRITICAL RULES:
- If the message is primarily a factual statement, casual remark, short acknowledgment, strategic/planning question, or task request → return intensity: 0, emotion: "neutral".
- Conceptual or abstract language ("value", "effort", "time", "thinking about X") is NOT emotional. Treat as cognitive/functional unless explicit emotional language is present.
- Do NOT infer hidden emotions. Only classify what is explicitly and unambiguously present in the message.
- Only extract a non-neutral emotion if the user explicitly expresses distress, frustration, sadness, fear, joy, or similar — not if you think they might feel it.

Return ONLY valid JSON matching exactly this structure, with NO markdown formatting or backticks:
{
  "emotion": "string (GoEmotions category, or 'neutral')",
  "intensity": 0,
  "trigger": "string (the cause of the emotion, or empty string if neutral)",
  "context": "string (background details, or empty string if neutral)",
  "is_resolution": false
}"""
    try:
        response = get_response(system_prompt, "", message)
        start = response.find('{')
        end = response.rfind('}') + 1
        if start != -1 and end != 0 and start < end:
            return json.loads(response[start:end])
    except Exception as e:
        logger.error(f"Emotion analysis failed: {e}")
    
    return {"emotion": "neutral", "intensity": 0, "trigger": "", "context": "", "is_resolution": False}


# ── Predictive Emotional Modeling ─────────────────────────────────────────────

def predict_next_emotional_state(user_id: str) -> dict:
    """
    Use stored cyclical_patterns to forecast which emotion is statistically
    due based on avg_gap_days from its last occurrence.
    Returns: {predicted_emotion, days_until, confidence, pattern_tag}
    """
    try:
        summary = get_pattern_summary(user_id)
        if not summary:
            return {}
        cyclical = summary.get("cyclical_patterns", [])
        if not cyclical:
            return {}

        now = _get_time()
        best = None
        for pattern in cyclical:
            emotion = pattern.get("emotion")
            avg_gap = pattern.get("avg_gap_days", 0)
            if avg_gap <= 0:
                continue
            # Find last occurrence of this emotion in threads
            threads = list(emotional_threads_col.find(
                {"user_id": user_id, "initial_state.emotion": emotion},
                {"created_at": 1}
            ).sort("created_at", -1).limit(1))
            if not threads:
                continue
            last_ts = threads[0].get("created_at", now)
            days_since = (now - last_ts) / 86400
            days_until = avg_gap - days_since  # negative = overdue
            consistency = pattern.get("consistency", 1.0)  # lower CV = more consistent

            if best is None or days_until < best["days_until"]:
                confidence = "high" if consistency < 0.3 else ("medium" if consistency < 0.5 else "low")
                best = {
                    "predicted_emotion": emotion,
                    "days_until": round(days_until, 1),
                    "confidence": confidence,
                    "occurrences": pattern.get("occurrences", 0),
                }

        return best or {}
    except Exception as e:
        logger.error(f"Predictive modeling failed: {e}")
        return {}


def mark_dormant_threads(user_id: str) -> int:
    """
    Move threads with no update in 14+ days to STATUS_DORMANT.
    Window shortened from 30 to 14 days to prevent stale threads
    (especially false-positive threads from marginal signals) from
    persisting in active context indefinitely.
    Returns count of threads transitioned.
    """
    if emotional_threads_col is None:
        return 0
    fourteen_days_ago = _get_time() - 14 * 86400
    try:
        result = emotional_threads_col.update_many(
            {
                "user_id": user_id,
                "status": STATUS_ACTIVE,
                "last_updated": {"$lt": fourteen_days_ago},
            },
            {"$set": {"status": STATUS_DORMANT, "last_updated": _get_time()}}
        )
        count = result.modified_count
        if count:
            logger.info(f"Marked {count} threads as dormant for user {user_id}")
        return count
    except Exception as e:
        logger.error(f"Dormant transition failed: {e}")
        return 0


# ── Effectiveness Scoring ─────────────────────────────────────────────────────

def compute_effectiveness_score(user_id: str) -> float:
    """
    Score per rolling 30-day window: what % of emotional threads moved toward
    lower intensity or resolution after a session?
    Saves as users.effectiveness_score.
    """
    if emotional_threads_col is None:
        return 0.0
    db = _mongodb_client._db if hasattr(_mongodb_client, '_db') else None
    if db is None:
        return 0.0

    thirty_days_ago = _get_time() - 30 * 86400
    try:
        threads = list(emotional_threads_col.find({
            "user_id": user_id,
            "last_updated": {"$gt": thirty_days_ago},
        }))
        if not threads:
            return 0.0

        positive_movements = 0
        for t in threads:
            evolution = t.get("evolution", [])
            if len(evolution) < 2:
                if t.get("status") == STATUS_RESOLVED:
                    positive_movements += 1
                continue
            first_intensity = evolution[0].get("intensity", 10)
            last_intensity = evolution[-1].get("intensity", first_intensity)
            if last_intensity < first_intensity or t.get("status") == STATUS_RESOLVED:
                positive_movements += 1

        score = round((positive_movements / len(threads)) * 100, 1)

        db["users"].update_one(
            {"_id": user_id},
            {"$set": {"effectiveness_score": score, "effectiveness_updated_at": _get_time()}},
            upsert=False
        )
        logger.info(f"Effectiveness score for {user_id}: {score}%")
        return score
    except Exception as e:
        logger.error(f"Effectiveness scoring failed: {e}")
        return 0.0
