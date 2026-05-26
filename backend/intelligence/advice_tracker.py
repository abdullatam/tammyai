# advice_tracker.py
"""
Tammy — Advice follow-up system.
Extracts specific advice or action items from Tammy's responses,
stores them as pending_advice on the user doc, and lets the scheduler
create follow-up notifications when the deadline passes.
"""

import time
import json
from typing import Dict, Optional

from backend.db.mongodb_client import _mongodb_client
from backend.logger import get_logger

logger = get_logger(__name__)


def extract_and_store_advice(user_id: str, user_message: str, tammy_response: str) -> Optional[Dict]:
    """
    Check if Tammy's response contains a specific actionable suggestion.
    If yes, store it in users.pending_advice[] with a follow-up deadline.
    Uses a lightweight LLM call.
    """
    from ai.core.llm_client import get_response

    system = (
        "Does this AI response contain a specific actionable advice or action item for the user? "
        "If yes, extract it. If no, return null. "
        "Return ONLY JSON: {\"has_advice\": true/false, \"advice_text\": \"...\", \"follow_up_days\": 3} "
        "or {\"has_advice\": false}. "
        "follow_up_days: how many days to wait before following up (1-7 based on urgency). "
        "No explanation, no markdown."
    )
    prompt = f"User said: {user_message[:200]}\n\nTammy responded: {tammy_response[:400]}"

    try:
        raw = get_response(system, "", prompt, [])
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1 or end <= 0:
            return None
        data = json.loads(raw[start:end])
        if not data.get("has_advice"):
            return None

        advice_text = data.get("advice_text", "")
        follow_up_days = int(data.get("follow_up_days", 3))
        if not advice_text or len(advice_text) < 10:
            return None

        due_at = time.time() + follow_up_days * 86400
        advice_item = {
            "advice_text": advice_text[:200],
            "follow_up_days": follow_up_days,
            "due_at": due_at,
            "created_at": time.time(),
        }

        db = _mongodb_client._db
        if db is None:
            return None

        db["users"].update_one(
            {"_id": user_id},
            {"$push": {"pending_advice": {"$each": [advice_item], "$slice": -10}}},
            upsert=False
        )
        logger.info(f"Stored advice follow-up for user {user_id}: {advice_text[:60]}")
        return advice_item

    except Exception as e:
        logger.error(f"Advice extraction failed: {e}")
        return None


__all__ = ["extract_and_store_advice"]
