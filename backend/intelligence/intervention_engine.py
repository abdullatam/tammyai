import time
import uuid
from datetime import datetime
from typing import List, Dict

from backend.db.mongodb_client import (
    users_col,
    conversations_col,
    user_sessions_col,
    emotional_threads_col,
    notifications_col,
    _mongodb_client
)
from backend.logger import get_logger

logger = get_logger(__name__)

INTERVENTION_TRIGGERS = {
    "analysis_paralysis": {
        "condition": "same decision unresolved for 3+ days with 3+ sessions",
        "message": "You've been circling this for 3 days. That's not thinking — that's avoiding. What's the actual blocker?"
    },
    "dangerous_quiet": {
        "condition": "low arousal negative emotional state for 3+ consecutive sessions",
        "message": "I want to check on you. You've been quiet in a way that doesn't feel fine."
    },
    "pending_decision_overdue": {
        "condition": "decision status pending for 7+ days",
        "message": "That decision from last week is still open. What happened?"
    },
    "pattern_break_opportunity": {
        "condition": "user breaks a tracked avoidance pattern",
        "message": "You just did the thing you've avoided six times. Sit with that."
    },
    "absence": {
        "condition": "user hasn't opened Tammy in 5+ days",
        "message": "It's been a while. What's been happening?"
    }
}

def check_triggers(user_id: str):
    """Evaluate all intervention triggers for a specific user."""
    # Rate limit check: max 1 per 24 hours
    one_day_ago = time.time() - 86400
    if notifications_col is not None:
        recent_notif = notifications_col.find_one({
            "user_id": user_id,
            "type": "intervention",
            "timestamp": {"$gt": one_day_ago}
        })
        
        if recent_notif:
            logger.debug(f"User {user_id} recently received an intervention. Skipping.")
            return

    triggered = False
    
    # 1. Absence Trigger
    if user_sessions_col is not None:
        last_session = user_sessions_col.find_one(
            {"user_id": user_id},
            sort=[("timestamp", -1)]
        )
        if last_session:
            last_ts = last_session.get("timestamp", 0)
            if time.time() - last_ts > (86400 * 5):
                _create_notification(user_id, "absence", INTERVENTION_TRIGGERS["absence"]["message"])
                triggered = True
                
    if triggered: return

    # 2. Dangerous Quiet — require all 3 most-recent threads to be low-arousal negative
    if emotional_threads_col is not None:
        recent_threads = list(emotional_threads_col.find(
            {"user_id": user_id}
        ).sort("last_updated", -1).limit(3))

        negative_emotions = {"sadness", "disappointment", "fear", "remorse", "neutral", "emptiness"}
        if len(recent_threads) >= 3:
            quiet_count = sum(
                1 for t in recent_threads
                if t.get("current_intensity", 10) <= 4
                and t.get("current_emotion", "").lower() in negative_emotions
            )
            if quiet_count >= 3:
                _create_notification(user_id, "dangerous_quiet", INTERVENTION_TRIGGERS["dangerous_quiet"]["message"])
                triggered = True

    if triggered: return
    
    # 3. Analysis Paralysis / Pending Decision Overdue
    decisions_col = _mongodb_client.get_collection("decisions")
    if decisions_col is not None:
        overdue_decisions = list(decisions_col.find({
            "user_id": user_id,
            "status": "pending",
            "created_at": {"$lt": time.time() - (86400 * 7)}
        }))
        if overdue_decisions:
            _create_notification(user_id, "pending_decision_overdue", INTERVENTION_TRIGGERS["pending_decision_overdue"]["message"])
            triggered = True
            
        if triggered: return
        
        paralysis = list(decisions_col.find({
            "user_id": user_id,
            "status": "pending",
            "created_at": {"$lt": time.time() - (86400 * 3)},
            "session_mentions": {"$gte": 3}
        }))
        if paralysis:
            _create_notification(user_id, "analysis_paralysis", INTERVENTION_TRIGGERS["analysis_paralysis"]["message"])
            triggered = True

    if triggered: return

    # 5. Pattern Break Opportunity — user resolved a thread tagged as avoidance in the last 24 hours
    if emotional_threads_col is not None:
        avoidance_tags = ["avoidance", "procrastination", "avoidance_pattern"]
        recent_break = emotional_threads_col.find_one({
            "user_id": user_id,
            "status": "RESOLVED",
            "pattern_tags": {"$in": avoidance_tags},
            "last_updated": {"$gt": time.time() - 86400},
        })
        if recent_break:
            _create_notification(
                user_id,
                "pattern_break_opportunity",
                INTERVENTION_TRIGGERS["pattern_break_opportunity"]["message"],
            )

    # 6. Opportunity Alerts — goal stall detection (goal mentioned > 14 days without update)
    try:
        db = _mongodb_client._db
        if db is not None:
            fourteen_days_ago = time.time() - 14 * 86400
            user_doc = db["users"].find_one({"_id": user_id}, {"goals": 1, "goals_updated_at": 1})
            if user_doc:
                goals = user_doc.get("goals", [])
                last_goal_update = user_doc.get("goals_updated_at", 0)
                if goals and last_goal_update and last_goal_update < fourteen_days_ago:
                    recent_opportunity = notifications_col.find_one({
                        "user_id": user_id,
                        "type": "opportunity",
                        "timestamp": {"$gt": time.time() - 7 * 86400}
                    }) if notifications_col else None
                    if not recent_opportunity:
                        goal_text = goals[0] if isinstance(goals[0], str) else goals[0].get("text", "your goal")
                        _create_notification(
                            user_id,
                            "goal_stall",
                            f"You mentioned '{str(goal_text)[:60]}' 2 weeks ago. Where did that go?",
                            notif_type="opportunity"
                        )
    except Exception as e:
        logger.error(f"Opportunity alert check failed: {e}")


def _create_notification(user_id: str, trigger_id: str, message: str, notif_type: str = "intervention"):
    """Insert into MongoDB and mock push delivery."""
    col = notifications_col
    if col is None:
        # Fall back to direct DB access
        db = _mongodb_client._db
        if db is None:
            logger.error("Cannot create notification: collection unavailable.")
            return
        col = db["notifications"]

    doc = {
        "notification_id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notif_type,
        "trigger": trigger_id,
        "message": message,
        "timestamp": time.time(),
        "read": False,
        "delivered_push": True,
        "delivered_email": True
    }
    col.insert_one(doc)
    
    # Also create via the new notification system so it shows in bell/dropdown
    try:
        from backend.core_services.notification_manager import create_notification
        create_notification(user_id, {
            "type": "intervention",
            "title": "Tammy wants to check in",
            "body": message[:120],
            "action_url": "/chat",
            "action_label": "Talk to Tammy",
            "priority": "medium",
            "metadata": {"trigger": trigger_id},
        })
    except Exception:
        pass
    
    # Mock delivery
    logger.info(f"🔔 PROACTIVE INTERVENTION [{trigger_id}] for user {user_id}: {message}")
    logger.info("-> Delivered via Push Notification (Firebase payload generated)")
    logger.info("-> Delivered via Email (SendGrid template queued)")

__all__ = ["check_triggers", "INTERVENTION_TRIGGERS"]
