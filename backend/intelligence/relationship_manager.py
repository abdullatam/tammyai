# relationship_manager.py
"""
Tammy — Relationship mapping.
Extracts named people from conversations, tracks emotional weight and role,
and injects the top active relationships into Tammy's context.
"""

import time
import json
from typing import List, Dict, Optional

from backend.db.mongodb_client import _mongodb_client
from backend.logger import get_logger

logger = get_logger(__name__)

_30_DAYS = 30 * 86400


def _col():
    db = _mongodb_client._db
    return db["relationships"] if db is not None else None


def extract_relationships(user_id: str, conversation_text: str) -> List[Dict]:
    """
    Use LLM to extract named people from a conversation.
    Returns list of {name, role, emotional_weight, context}.
    """
    from ai.core.llm_client import get_response
    system = (
        "Extract named people (not the user, not Tammy) mentioned in this conversation. "
        "For each person return JSON: [{\"name\": str, \"role\": str, \"emotional_weight\": -1..1, \"context\": str}]. "
        "emotional_weight: positive=supportive/positive relationship, negative=source of stress/conflict. "
        "Return [] if no named people found. Return ONLY the JSON array, no explanation."
    )
    try:
        raw = get_response(system, "", conversation_text[:800], [])
        start = raw.find('[')
        end = raw.rfind(']') + 1
        if start != -1 and end > 0:
            people = json.loads(raw[start:end])
            return people[:6]  # cap per-conversation
    except Exception as e:
        logger.error(f"Relationship extraction failed: {e}")
    return []


def upsert_relationships(user_id: str, people: List[Dict]) -> None:
    """
    Merge extracted people into the user's relationship graph in MongoDB.
    Updates emotional_weight as rolling average, increments mention_count.
    """
    col = _col()
    if col is None or not people:
        return
    now = time.time()
    for person in people:
        name = (person.get("name") or "").strip()
        if not name:
            continue
        existing = col.find_one({"user_id": user_id, "name": name})
        if existing:
            old_weight = existing.get("emotional_weight", 0)
            new_weight = person.get("emotional_weight", 0)
            # Rolling average (80% old, 20% new) to prevent single-mention swings
            blended = round(old_weight * 0.8 + new_weight * 0.2, 3)
            col.update_one(
                {"user_id": user_id, "name": name},
                {"$set": {
                    "emotional_weight": blended,
                    "last_mentioned": now,
                    "role": person.get("role") or existing.get("role", ""),
                    "context": person.get("context") or existing.get("context", ""),
                }, "$inc": {"mention_count": 1}}
            )
        else:
            col.insert_one({
                "user_id": user_id,
                "name": name,
                "role": person.get("role", ""),
                "emotional_weight": person.get("emotional_weight", 0),
                "context": person.get("context", ""),
                "mention_count": 1,
                "first_mentioned": now,
                "last_mentioned": now,
            })


def get_top_relationships(user_id: str, limit: int = 4) -> List[Dict]:
    """
    Get the most recently mentioned relationships for context injection.
    Sorted by recency, filtered to last 30 days.
    """
    col = _col()
    if col is None:
        return []
    cutoff = time.time() - _30_DAYS
    try:
        docs = list(col.find(
            {"user_id": user_id, "last_mentioned": {"$gt": cutoff}},
            {"_id": 0, "name": 1, "role": 1, "emotional_weight": 1, "context": 1, "mention_count": 1}
        ).sort("last_mentioned", -1).limit(limit))
        return docs
    except Exception as e:
        logger.error(f"get_top_relationships failed: {e}")
        return []


def get_all_relationships(user_id: str) -> List[Dict]:
    """Full relationship graph for API endpoint."""
    col = _col()
    if col is None:
        return []
    try:
        docs = list(col.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("last_mentioned", -1))
        return docs
    except Exception as e:
        logger.error(f"get_all_relationships failed: {e}")
        return []


__all__ = [
    "extract_relationships",
    "upsert_relationships",
    "get_top_relationships",
    "get_all_relationships",
]
