# prompt_cache.py
"""
In-memory cache for the active system prompt.
Falls back to the static SYSTEM_PROMPT in tammy_rag.py if MongoDB is unavailable.
"""
import time
from backend.logger import get_logger

logger = get_logger(__name__)

_cache: dict = {"prompt": None, "version_num": None, "expires_at": 0}


def get_active_system_prompt() -> tuple:
    """
    Returns (prompt_text: str, version_number: int).
    Caches for 30 s; invalidated immediately on publish via invalidate_prompt_cache().
    """
    if _cache["prompt"] and _cache["expires_at"] > time.time():
        return _cache["prompt"], _cache["version_num"]

    try:
        from backend.db.mongodb_client import _mongodb_client
        db = _mongodb_client._db
        if db is None:
            raise RuntimeError("MongoDB unavailable")

        active = db["prompt_active"].find_one({"_id": "current"})
        if not active:
            raise RuntimeError("No active prompt record")

        version_doc = db["prompt_versions_v2"].find_one({"_id": active["version_id"]})
        if not version_doc:
            raise RuntimeError(f"Version doc missing: {active.get('version_id')}")

        _cache["prompt"]      = version_doc["content"]
        _cache["version_num"] = version_doc["version"]
        _cache["expires_at"]  = time.time() + 30
        return _cache["prompt"], _cache["version_num"]

    except Exception as e:
        logger.warning(f"prompt_cache fallback to static SYSTEM_PROMPT ({e})")
        try:
            from ai.rag.tammy_rag import SYSTEM_PROMPT
            return SYSTEM_PROMPT, 0
        except Exception:
            return "You are Tammy.", 0


def invalidate_prompt_cache() -> None:
    """Force the next call to reload from MongoDB (≤1 s effect)."""
    _cache["expires_at"] = 0
    logger.info("Prompt cache invalidated")


def seed_prompt_if_needed() -> None:
    """
    On first startup: if prompt_versions_v2 is empty, seed v1 from the
    static SYSTEM_PROMPT constant and create the prompt_active record.
    """
    try:
        from backend.db.mongodb_client import _mongodb_client
        from bson import ObjectId
        import datetime

        db = _mongodb_client._db
        if db is None:
            logger.warning("seed_prompt_if_needed: MongoDB unavailable, skipping")
            return

        col = db["prompt_versions_v2"]
        if col.count_documents({}) > 0:
            logger.info("seed_prompt_if_needed: versions already exist, skipping")
            return

        from ai.rag.tammy_rag import SYSTEM_PROMPT as _sp
        oid = ObjectId()
        now = datetime.datetime.utcnow()

        col.insert_one({
            "_id": oid,
            "version":      1,
            "content":      _sp.strip(),
            "note":         "Initial version (seeded from tammy_rag.py)",
            "status":       "published",
            "created_by":   "system",
            "created_at":   now,
            "published_at": now,
            "published_by": "system",
            "parent_version": None,
        })

        db["prompt_active"].replace_one(
            {"_id": "current"},
            {
                "_id":           "current",
                "version_id":    oid,
                "version_number": 1,
                "activated_at":  now,
                "activated_by":  "system",
            },
            upsert=True,
        )
        logger.info("✅ System prompt seeded as version 1 (published)")

    except Exception as e:
        logger.error(f"seed_prompt_if_needed failed: {e}")
