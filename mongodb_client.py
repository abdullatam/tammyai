# mongodb_client.py
"""
MongoDB client with connection management and error handling.
"""

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.collection import Collection
from pymongo.database import Database
from typing import Optional

from config import config
from logger import get_logger

logger = get_logger(__name__)


class MongoDBClient:
    """
    Singleton MongoDB client.
    """
    
    _instance: Optional['MongoDBClient'] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize MongoDB connection (only once)."""
        if self._initialized:
            return
        
        logger.info("Initializing MongoDB client...")
        
        try:
            # Create MongoDB client
            self._client = MongoClient(
                config.MONGO_URI,
                server_api=ServerApi('1'),
                connectTimeoutMS=5000,
                serverSelectionTimeoutMS=5000
            )
            
            # Test connection
            self._client.admin.command('ping')
            logger.info("✅ Connected to MongoDB")
            
            # Get database
            self._db = self._client[config.MONGO_DB_NAME]
            
            self._initialized = True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    @property
    def client(self) -> MongoClient:
        """Get MongoDB client instance."""
        if self._client is None:
            raise RuntimeError("MongoDB client not initialized")
        return self._client
    
    @property
    def db(self) -> Database:
        """Get database instance."""
        if self._db is None:
            raise RuntimeError("MongoDB database not initialized")
        return self._db
    
    def get_collection(self, name: str) -> Collection:
        """
        Get a collection from the database.
        
        Args:
            name: Collection name
        
        Returns:
            MongoDB collection
        """
        return self.db[name]
    
    def health_check(self) -> bool:
        """
        Check if MongoDB connection is healthy.
        
        Returns:
            True if connection is healthy, False otherwise
        """
        try:
            self._client.admin.command('ping')
            return True
        except Exception as e:
            logger.error(f"MongoDB health check failed: {e}")
            return False
    
    def close(self):
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed")


# Singleton instance
_mongodb_client = MongoDBClient()

# Database and collections
db = _mongodb_client.db
user_profile_col = _mongodb_client.get_collection("user_profile")
user_sessions_col = _mongodb_client.get_collection("user_sessions")

# Export them
__all__ = ["user_profile_col", "user_sessions_col", "db", "_mongodb_client", "MongoDBClient"]
