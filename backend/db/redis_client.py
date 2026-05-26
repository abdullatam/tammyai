# redis_client.py
"""
Tammy V2 — Resilient Redis client with connection pooling and graceful fallback.
"""

import redis as _redis
from typing import Optional

from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)


class RedisClient:
    _instance: Optional["RedisClient"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        logger.info("Initializing Redis client...")
        self._pool = None
        self._client = None

        try:
            self._pool = _redis.ConnectionPool(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                username=config.REDIS_USERNAME,
                password=config.REDIS_PASSWORD,
                db=config.REDIS_DB,
                decode_responses=True,
                max_connections=10,
                socket_timeout=3,
                socket_connect_timeout=3,
            )
            self._client = _redis.Redis(connection_pool=self._pool)
            self._client.ping()
            logger.info(f"✅ Redis connected: {config.REDIS_HOST}:{config.REDIS_PORT}")
        except Exception as e:
            logger.warning(f"⚠️ Redis unavailable: {e}. Short-term memory disabled.")
            self._pool = None
            self._client = None

        self._initialized = True

    @property
    def client(self) -> Optional[_redis.Redis]:
        return self._client

    @property
    def available(self) -> bool:
        return self._client is not None

    def health_check(self) -> bool:
        try:
            return bool(self._client and self._client.ping())
        except Exception:
            return False

    def close(self):
        if self._pool:
            self._pool.disconnect()


_redis_client = RedisClient()


def get_redis() -> Optional[_redis.Redis]:
    return _redis_client.client


def is_redis_available() -> bool:
    return _redis_client.available


__all__ = ["get_redis", "is_redis_available", "RedisClient"]
