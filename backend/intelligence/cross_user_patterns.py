# cross_user_patterns.py
"""
Tammy — Cross-user anonymized success pattern aggregation.
Finds which resolution styles and trigger themes most commonly lead to
resolved emotional threads across all users (fully anonymized — no user_ids stored).
"""

import time
from collections import defaultdict, Counter
from typing import List, Dict

from backend.db.mongodb_client import _mongodb_client
from backend.logger import get_logger

logger = get_logger(__name__)


def aggregate_cross_user_patterns() -> Dict:
    """
    Weekly aggregation across all users.
    Stores results in global_patterns collection (no user_id attached).
    """
    db = _mongodb_client._db
    if db is None:
        return {}

    try:
        threads = list(db["emotional_threads"].find(
            {},
            {"user_id": 0, "_id": 0,  # strip identity
             "status": 1, "pattern_tags": 1, "initial_state": 1,
             "evolution": 1, "resolution_status": 1}
        ))

        if not threads:
            return {}

        # Count which patterns lead to resolution
        resolved = [t for t in threads if t.get("status") == "RESOLVED"]
        unresolved = [t for t in threads if t.get("status") == "ACTIVE"]

        tag_resolution_rate = {}
        all_tags = set()
        for t in threads:
            for tag in t.get("pattern_tags", []):
                all_tags.add(tag)

        for tag in all_tags:
            tagged_threads = [t for t in threads if tag in t.get("pattern_tags", [])]
            if len(tagged_threads) < 3:
                continue
            resolved_tagged = sum(1 for t in tagged_threads if t.get("status") == "RESOLVED")
            rate = round(resolved_tagged / len(tagged_threads), 2)
            tag_resolution_rate[tag] = {"resolution_rate": rate, "sample_size": len(tagged_threads)}

        # Most common initial emotions in resolved vs unresolved
        resolved_emotions = Counter(t.get("initial_state", {}).get("emotion", "") for t in resolved)
        unresolved_emotions = Counter(t.get("initial_state", {}).get("emotion", "") for t in unresolved)

        # Average steps to resolution
        steps_data = []
        for t in resolved:
            steps = len(t.get("evolution", []))
            if steps > 0:
                steps_data.append(steps)
        avg_steps = round(sum(steps_data) / len(steps_data), 1) if steps_data else 0

        result = {
            "generated_at": time.time(),
            "total_threads_analyzed": len(threads),
            "resolution_rate_by_tag": tag_resolution_rate,
            "most_common_resolved_emotions": dict(resolved_emotions.most_common(5)),
            "most_common_unresolved_emotions": dict(unresolved_emotions.most_common(5)),
            "avg_steps_to_resolution": avg_steps,
        }

        db["global_patterns"].replace_one(
            {"type": "weekly_aggregation"},
            {"type": "weekly_aggregation", **result},
            upsert=True
        )
        logger.info(f"Cross-user patterns saved: {len(threads)} threads analyzed.")
        return result

    except Exception as e:
        logger.error(f"Cross-user pattern aggregation failed: {e}")
        return {}


def get_cross_user_insights(pattern_tags: List[str]) -> str:
    """
    Given a user's current pattern tags, return a relevant cross-user insight
    for Tammy to optionally use in context. Returns empty string if no data.
    """
    db = _mongodb_client._db
    if db is None:
        return ""
    try:
        doc = db["global_patterns"].find_one({"type": "weekly_aggregation"})
        if not doc:
            return ""
        rate_map = doc.get("resolution_rate_by_tag", {})
        insights = []
        for tag in pattern_tags:
            if tag in rate_map:
                rate = rate_map[tag]["resolution_rate"]
                sample = rate_map[tag]["sample_size"]
                if rate >= 0.7 and sample >= 5:
                    insights.append(
                        f"For people with '{tag.replace('_', ' ')}' patterns, {int(rate*100)}% resolved it."
                    )
        return " | ".join(insights[:2]) if insights else ""
    except Exception as e:
        logger.error(f"get_cross_user_insights failed: {e}")
        return ""


__all__ = ["aggregate_cross_user_patterns", "get_cross_user_insights"]
