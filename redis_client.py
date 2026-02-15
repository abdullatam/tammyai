# redis_client.py
"""
Redis client with connection pooling and error handling.
"""

import redis
from typing import Optional

from config import config
from logger import get_logger

logger = get_logger(__name__)


class RedisClient:
    """
    Singleton Redis client with connection pooling.
    """
    
    _instance: Optional['RedisClient'] = None
    _pool: Optional[redis.ConnectionPool] = None
    _client: Optional[redis.Redis] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize Redis connection pool (only once)."""
        if self._initialized:
            return
        
        logger.info("Initializing Redis client...")
        
        try:
            # Create connection pool
            self._pool = redis.ConnectionPool(
                host=config.REDIS_HOST,
                port=config.REDIS_PORT,
                username=config.REDIS_USERNAME,
                password=config.REDIS_PASSWORD,
                db=config.REDIS_DB,
                decode_responses=True,
                max_connections=10,
                socket_timeout=5,
                socket_connect_timeout=5,
            )
            
            # Create Redis client
            self._client = redis.Redis(connection_pool=self._pool)
            
            # Test connection
            self._client.ping()
            
            logger.info(f"✅ Connected to Redis at {config.REDIS_HOST}:{config.REDIS_PORT}")
            self._initialized = True
            
        except redis.ConnectionError as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error initializing Redis: {e}")
            raise
    
    @property
    def client(self) -> redis.Redis:
        """Get Redis client instance."""
        if not self._client:
            raise RuntimeError("Redis client not initialized")
        return self._client
    
    def health_check(self) -> bool:
        """
        Check if Redis connection is healthy.
        
        Returns:
            True if connection is healthy, False otherwise
        """
        try:
            return self._client.ping()
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False
    
    def close(self):
        """Close Redis connection pool."""
        if self._pool:
            self._pool.disconnect()
            logger.info("Redis connection pool closed")


# Singleton instance
_redis_client = RedisClient()


def get_redis() -> redis.Redis:
    """
    Get Redis client instance.
    
    Returns:
        Redis client with connection pooling
    """
    return _redis_client.client


__all__ = ["get_redis", "RedisClient"]
