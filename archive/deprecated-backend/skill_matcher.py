# skill_matcher.py
"""
Tammy Network — Skill-need detection and matching.
During chat, if the user expresses needing someone with a skill,
Tammy searches the network and creates a notification with the match.
"""

import time
import uuid
import json
from typing import Optional, Dict

from mongodb_client import _mongodb_client
from logger import get_logger

logger = get_logger(__name__)

# Phrases that signal the user is looking for someone with a skill
_NEED_SIGNALS = [
    "i need someone who", "looking for a", "need a", "do you know anyone",
    "who can help me with", "i need help with", "need an expert in",
    "need a person who", "know anyone who", "find someone who",
    "need someone to", "need to find a", "is there anyone",
]


def detect_and_match_skill_need(user_id: str, message: str) -> Optional[Dict]:
    """
    Check if the message signals a skill need, extract it, and try to
    match against the network. Creates a notification if a match is found.
    """
    msg_lower = message.lower()
    if not any(sig in msg_lower for sig in _NEED_SIGNALS):
        return None

    from llm_client import get_response

    system = (
        "Does this message express that the user is looking for a person with a specific skill or expertise? "
        "If yes, extract the skill. Return ONLY JSON: "
        "{\"needs_skill\": true, \"skill\": \"description of skill needed\"} or "
        "{\"needs_skill\": false}. No markdown."
    )
    try:
        raw = get_response(system, "", message[:300], [])
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1 or end <= 0:
            return None
        data = json.loads(raw[start:end])
        if not data.get("needs_skill"):
            return None
        skill = data.get("skill", "").strip()
        if not skill:
            return None

        match = _find_network_match(user_id, skill)
        if match:
            _create_skill_notification(user_id, skill, match)
            return match

    except Exception as e:
        logger.error(f"Skill need detection failed: {e}")
    return None


def _find_network_match(user_id: str, skill: str) -> Optional[Dict]:
    """Search the user's network intros for someone with the matching skill."""
    db = _mongodb_client._db
    if db is None:
        return None
    try:
        skill_lower = skill.lower()
        skill_words = set(w for w in skill_lower.split() if len(w) > 3)

        # Check existing network intros
        network_col = db.get_collection("network") if hasattr(db, "get_collection") else db["network"]
        intros = list(network_col.find(
            {"user_id": user_id},
            {"_id": 0, "name": 1, "role": 1, "skills": 1, "reason": 1}
        ))

        best_match = None
        best_score = 0
        for intro in intros:
            skills_text = " ".join(intro.get("skills", [])).lower() + " " + intro.get("role", "").lower()
            score = sum(1 for w in skill_words if w in skills_text)
            if score > best_score:
                best_score = score
                best_match = intro

        if best_score >= 1 and best_match:
            return best_match
    except Exception as e:
        logger.error(f"Network match search failed: {e}")
    return None


def _create_skill_notification(user_id: str, skill: str, match: Dict):
    db = _mongodb_client._db
    if db is None:
        return
    try:
        db["notifications"].insert_one({
            "notification_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "skill_match",
            "message": f"Tammy found someone in your network for '{skill[:50]}': {match.get('name', 'a connection')} — {match.get('role', '')}",
            "match": match,
            "skill_requested": skill,
            "timestamp": time.time(),
            "read": False,
        })
        logger.info(f"Skill match notification created for {user_id}: {skill}")
    except Exception as e:
        logger.error(f"Skill notification creation failed: {e}")


__all__ = ["detect_and_match_skill_need"]
