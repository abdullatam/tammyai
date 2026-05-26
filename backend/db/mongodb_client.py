# mongodb_client.py
"""
Tammy V2 — Resilient MongoDB client with graceful fallback.
Collections: users, session_summaries, conversations
"""

from typing import Optional
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.collection import Collection
from pymongo.database import Database

from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)


class MongoDBClient:
    _instance: Optional["MongoDBClient"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        logger.info("Initializing MongoDB client...")
        self._client = None
        self._db = None

        try:
            self._client = MongoClient(
                config.MONGO_URI,
                server_api=ServerApi("1"),
                connectTimeoutMS=4000,
                serverSelectionTimeoutMS=4000,
            )
            self._client.admin.command("ping")
            self._db = self._client[config.MONGO_DB_NAME]
            logger.info("✅ MongoDB connected")
        except Exception as e:
            logger.warning(f"⚠️ MongoDB unavailable: {e}. Long-term memory disabled.")
            self._client = None
            self._db = None

        self._initialized = True

    @property
    def available(self) -> bool:
        return self._db is not None

    def get_collection(self, name: str) -> Optional[Collection]:
        if self._db is None:
            return None
        return self._db[name]

    def health_check(self) -> bool:
        try:
            return bool(self._client and self._client.admin.command("ping"))
        except Exception:
            return False

    def close(self):
        if self._client:
            self._client.close()


_mongodb_client = MongoDBClient()

# V2 Collections
users_col = _mongodb_client.get_collection("users")
session_summaries_col = _mongodb_client.get_collection("session_summaries")
conversations_col = _mongodb_client.get_collection("conversations")
emotional_threads_col = _mongodb_client.get_collection("emotional_threads")
prompt_versions_col = _mongodb_client.get_collection("prompt_versions")
notifications_col = _mongodb_client.get_collection("notifications")

# Legacy compatibility
user_profile_col = _mongodb_client.get_collection("user_profile")
user_sessions_col = _mongodb_client.get_collection("user_sessions")

db = _mongodb_client._db

__all__ = [
    "users_col", "session_summaries_col", "conversations_col",
    "emotional_threads_col", "prompt_versions_col", "notifications_col",
    "user_profile_col", "user_sessions_col",
    "db", "_mongodb_client", "MongoDBClient"
]
