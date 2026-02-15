# redis_memory_store.py
"""
Redis-based short-term memory store for Tammy.
Handles conversation history with TTL.
"""

import json
import time
from typing import List, Dict, Any

from redis_client import get_redis
from config import config
from logger import get_logger
from constants import ROLE_USER, SUCCESS_MESSAGE_PUSHED

logger = get_logger(__name__)


def _user_key(user_id: str) -> str:
    """Generate Redis key for user's conversation history."""
    return f"{config.REDIS_KEY_PREFIX}:{user_id}"


def push_message(user_id: str, role: str, text: str) -> bool:
    """
    Append a message to the user's short-term memory in Redis.
    
    Args:
        user_id: User identifier
        role: Message role (user, tammy, etc.)
        text: Message text
    
    Returns:
        True if successful, False otherwise
    """
    try:
        r = get_redis()
        key = _user_key(user_id)
        payload = {
            "role": role,
            "text": text,
            "ts": time.time(),
        }
        r.rpush(key, json.dumps(payload))
        r.expire(key, config.REDIS_TTL)
        logger.debug(f"Pushed message for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to push message for user {user_id}: {e}")
        return False


def get_recent_messages(user_id: str, limit: int = None) -> List[Dict[str, Any]]:
    """
    Get the last N messages from Redis for this user.
    
    Args:
        user_id: User identifier
        limit: Maximum number of messages to retrieve (defaults to config)
    
    Returns:
        List of message dictionaries
    """
    if limit is None:
        limit = config.SHORT_TERM_MESSAGE_LIMIT
    
    try:
        r = get_redis()
        key = _user_key(user_id)
        raw_items = r.lrange(key, -limit, -1)
        messages: List[Dict[str, Any]] = []
        for raw in raw_items:
            try:
                messages.append(json.loads(raw))
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse message: {raw}")
                continue
        logger.debug(f"Retrieved {len(messages)} messages for user {user_id}")
        return messages
    except Exception as e:
        logger.error(f"Failed to get messages for user {user_id}: {e}")
        return []


def clear_user_memory(user_id: str) -> bool:
    """
    Clear Redis short-term memory for this user.
    
    Args:
        user_id: User identifier
    
    Returns:
        True if successful, False otherwise
    """
    try:
        r = get_redis()
        r.delete(_user_key(user_id))
        logger.info(f"✅ Cleared memory for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to clear memory for user {user_id}: {e}")
        return False
