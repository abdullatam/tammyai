import time
from backend.intelligence.intervention_engine import check_triggers
from backend.db.mongodb_client import users_col, _mongodb_client
from backend.logger import get_logger

logger = get_logger(__name__)

_14_DAYS = 14 * 86400


def _get_all_user_ids() -> list:
    """Return all known user IDs from the users collection."""
    if users_col is None:
        from backend.config import config
        return [config.DEFAULT_USER_ID]
    try:
        users = list(users_col.find({}, {"_id": 1, "user_id": 1}))
        ids = []
        for u in users:
            uid = u.get("user_id") or str(u.get("_id", ""))
            if uid:
                ids.append(uid)
        return ids or [__import__("config").config.DEFAULT_USER_ID]
    except Exception as e:
        logger.error(f"Could not fetch user IDs: {e}")
        from backend.config import config
        return [config.DEFAULT_USER_ID]


def run_interventions():
    """Run proactive interventions for all active users."""
    logger.info("Running proactive interventions job...")
    try:
        for user_id in _get_all_user_ids():
            try:
                check_triggers(user_id)
            except Exception as e:
                logger.error(f"Intervention error for {user_id}: {e}")
        logger.info("Finished proactive interventions job.")
    except Exception as e:
        logger.error(f"Error in proactive interventions: {e}")


def run_pattern_analysis():
    """
    Nightly job: re-tag all emotional threads and rebuild pattern summaries
    for every user. Runs after interventions so it has fresh thread data.
    """
    logger.info("Running emotional pattern analysis job...")
    try:
        from backend.intelligence.emotional_thread_manager import analyze_user_patterns
        for user_id in _get_all_user_ids():
            try:
                summary = analyze_user_patterns(user_id)
                logger.info(
                    f"[Patterns] {user_id} → cyclical={len(summary.get('cyclical_patterns', []))} "
                    f"triggers={len(summary.get('trigger_patterns', []))} "
                    f"style={summary.get('resolution_style', {}).get('style', '?')}"
                )
            except Exception as e:
                logger.error(f"Pattern analysis error for {user_id}: {e}")
        logger.info("Finished emotional pattern analysis job.")
    except Exception as e:
        logger.error(f"Error in pattern analysis: {e}")


def run_dna_refresh():
    """
    Biweekly job: invalidate each user's DNA cache if it's older than 14 days
    so the next frontend request triggers a fresh LLM-generated DNA analysis.
    """
    logger.info("Running DNA biweekly refresh check...")
    db = _mongodb_client._db
    if db is None:
        return
    now = time.time()
    try:
        users = list(db["users"].find({}, {"_id": 1, "dna_last_generated": 1}))
        refreshed = 0
        for u in users:
            last_gen = u.get("dna_last_generated", 0)
            if now - last_gen >= _14_DAYS:
                db["users"].update_one(
                    {"_id": u["_id"]},
                    {"$unset": {"dna_cache": "", "dna_sessions_at_cache": ""}}
                )
                refreshed += 1
        logger.info(f"DNA refresh: invalidated cache for {refreshed} users.")
    except Exception as e:
        logger.error(f"DNA refresh error: {e}")


def run_goal_checkins():
    """
    Every 48h: create check-in notifications for users with open goals
    that haven't been updated in 2+ days.
    """
    logger.info("Running goal check-in job...")
    db = _mongodb_client._db
    if db is None:
        return
    two_days_ago = time.time() - 2 * 86400
    import uuid as _uuid
    try:
        users_with_goals = list(db["users"].find(
            {"goals": {"$exists": True, "$not": {"$size": 0}}},
            {"_id": 1, "goals": 1}
        ))
        notifications_col = db["notifications"]
        for u in users_with_goals:
            uid = str(u["_id"])
            goals = u.get("goals", [])
            if not goals:
                continue
            # Check if we already sent a goal check-in in the last 48h
            recent = notifications_col.find_one({
                "user_id": uid,
                "type": "goal_checkin",
                "timestamp": {"$gt": two_days_ago}
            })
            if recent:
                continue
            # Pick the oldest-untouched goal
            goal_text = goals[0] if isinstance(goals[0], str) else goals[0].get("text", "your goal")
            notifications_col.insert_one({
                "notification_id": str(_uuid.uuid4()),
                "user_id": uid,
                "type": "goal_checkin",
                "message": f"Quick check-in: how's '{goal_text[:60]}' going?",
                "timestamp": time.time(),
                "read": False,
            })
        logger.info(f"Goal check-ins sent for {len(users_with_goals)} users.")
    except Exception as e:
        logger.error(f"Goal check-in error: {e}")


def run_advice_followups():
    """
    Scheduled job: check pending_advice items and create follow-up notifications
    when their follow_up_in_days deadline has passed.
    """
    logger.info("Running advice follow-up job...")
    db = _mongodb_client._db
    if db is None:
        return
    import uuid as _uuid
    now = time.time()
    try:
        users_with_advice = list(db["users"].find(
            {"pending_advice": {"$exists": True, "$not": {"$size": 0}}},
            {"_id": 1, "pending_advice": 1}
        ))
        notifications_col = db["notifications"]
        for u in users_with_advice:
            uid = str(u["_id"])
            pending = u.get("pending_advice", [])
            remaining = []
            for adv in pending:
                due_at = adv.get("due_at", 0)
                if now >= due_at:
                    text = adv.get("advice_text", "something we talked about")[:80]
                    notifications_col.insert_one({
                        "notification_id": str(_uuid.uuid4()),
                        "user_id": uid,
                        "type": "advice_followup",
                        "message": f"Last time we talked about: \"{text}\" — where did that land?",
                        "timestamp": now,
                        "read": False,
                    })
                else:
                    remaining.append(adv)
            if len(remaining) != len(pending):
                db["users"].update_one({"_id": u["_id"]}, {"$set": {"pending_advice": remaining}})
        logger.info("Advice follow-up job complete.")
    except Exception as e:
        logger.error(f"Advice follow-up error: {e}")


def run_effectiveness_scoring():
    """Weekly job: compute per-user effectiveness score from emotional thread evolution."""
    logger.info("Running effectiveness scoring job...")
    try:
        from backend.intelligence.emotional_thread_manager import compute_effectiveness_score
        for user_id in _get_all_user_ids():
            try:
                compute_effectiveness_score(user_id)
            except Exception as e:
                logger.error(f"Effectiveness score error for {user_id}: {e}")
        logger.info("Effectiveness scoring complete.")
    except Exception as e:
        logger.error(f"Effectiveness scoring job error: {e}")


def run_cross_user_patterns():
    """Weekly job: aggregate anonymized success patterns across all users."""
    logger.info("Running cross-user pattern aggregation...")
    try:
        from backend.intelligence.cross_user_patterns import aggregate_cross_user_patterns
        aggregate_cross_user_patterns()
        logger.info("Cross-user pattern aggregation complete.")
    except Exception as e:
        logger.error(f"Cross-user pattern error: {e}")


def run_decision_overdue_check():
    """Check for decisions pending 7+ days and notify users."""
    logger.info("Running decision overdue check...")
    db = _mongodb_client._db
    if db is None:
        return
    seven_days_ago = time.time() - 7 * 86400
    try:
        from backend.core_services.notification_manager import create_notification
        overdue = list(db["decisions"].find({
            "status": "pending",
            "created_at": {"$lt": seven_days_ago},
        }))
        for dec in overdue:
            uid = dec.get("user_id")
            if not uid:
                continue
            text = dec.get("text", "")[:60]
            days = int((time.time() - dec["created_at"]) / 86400)
            create_notification(uid, {
                "type": "decision_overdue",
                "title": "Decision still open",
                "body": f"'{text}' has been pending for {days} days",
                "action_url": "/decisions",
                "action_label": "Revisit it",
                "priority": "high",
                "metadata": {"ref_id": str(dec["_id"])},
            })
        logger.info(f"Decision overdue check: {len(overdue)} found.")
    except Exception as e:
        logger.error(f"Decision overdue check error: {e}")


def run_project_stalled_check():
    """Check for projects not mentioned in 7+ days and notify users."""
    logger.info("Running project stalled check...")
    db = _mongodb_client._db
    if db is None:
        return
    seven_days_ago = time.time() - 7 * 86400
    try:
        from backend.core_services.notification_manager import create_notification
        stalled = list(db["projects"].find({
            "last_mentioned": {"$lt": seven_days_ago},
        }))
        for proj in stalled:
            uid = proj.get("user_id")
            if not uid:
                continue
            name = proj.get("name", "Unknown")
            create_notification(uid, {
                "type": "project_stalled",
                "title": f"{name} has gone quiet",
                "body": "You haven't mentioned it in a week. Still active?",
                "action_url": "/projects",
                "action_label": "Check in",
                "metadata": {"ref_id": str(proj["_id"])},
            })
        logger.info(f"Project stalled check: {len(stalled)} found.")
    except Exception as e:
        logger.error(f"Project stalled check error: {e}")


def run_calendar_reminders():
    """Check for events starting in 30 min and notify users."""
    logger.info("Running calendar reminder check...")
    db = _mongodb_client._db
    if db is None:
        return
    now = time.time()
    window_start = now + 25 * 60  # 25 min from now
    window_end = now + 35 * 60    # 35 min from now
    try:
        from backend.core_services.notification_manager import create_notification
        upcoming = list(db["calendar_events"].find({
            "start_ts": {"$gte": window_start, "$lte": window_end},
        }))
        for ev in upcoming:
            uid = ev.get("user_id")
            if not uid:
                continue
            title = ev.get("title", "Event")
            create_notification(uid, {
                "type": "calendar_reminder",
                "title": "Coming up in 30 minutes",
                "body": title,
                "action_url": "/calendar",
                "action_label": "View",
                "priority": "high",
                "metadata": {"ref_id": str(ev["_id"])},
            })
        logger.info(f"Calendar reminders: {len(upcoming)} sent.")
    except Exception as e:
        logger.error(f"Calendar reminder error: {e}")


if __name__ == "__main__":
    logger.info("Starting Proactive OS Scheduler")

    run_count = 0
    while True:
        run_interventions()

        run_count += 1

        # Hourly: calendar reminders
        run_calendar_reminders()

        # Daily jobs (every 4th 6-hour cycle = 24h)
        if run_count % 4 == 0:
            run_pattern_analysis()
            run_dna_refresh()
            run_goal_checkins()
            run_advice_followups()
            run_decision_overdue_check()
            run_project_stalled_check()

        # Weekly jobs (every 28th cycle = 7 days)
        if run_count % 28 == 0:
            run_effectiveness_scoring()
            run_cross_user_patterns()

        time.sleep(6 * 3600)
