# redis_memory_store.py
import json
import os
import time
from typing import List, Dict, Any

from redis_client import get_redis

# TTL for short-term memory (e.g., 2 hours)
REDIS_TAMMY_TTL_SECONDS = int(os.getenv("REDIS_TAMMY_TTL", str(60 * 60 * 2)))
KEY_PREFIX = os.getenv("REDIS_TAMMY_KEY_PREFIX", "tammy:chat")


def _user_key(user_id: str) -> str:
    return f"{KEY_PREFIX}:{user_id}"


def push_message(user_id: str, role: str, text: str) -> None:
    """
    Append a message to the user's short-term memory in Redis.
    """
    r = get_redis()
    key = _user_key(user_id)
    payload = {
        "role": role,
        "text": text,
        "ts": time.time(),
    }
    r.rpush(key, json.dumps(payload))
    r.expire(key, REDIS_TAMMY_TTL_SECONDS)


def get_recent_messages(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Get the last N messages from Redis for this user.
    """
    r = get_redis()
    key = _user_key(user_id)
    raw_items = r.lrange(key, -limit, -1)
    messages: List[Dict[str, Any]] = []
    for raw in raw_items:
        try:
            messages.append(json.loads(raw))
        except Exception:
            continue
    return messages


def clear_user_memory(user_id: str) -> None:
    """
    Clear Redis short-term memory for this user.
    """
    r = get_redis()
    r.delete(_user_key(user_id))
