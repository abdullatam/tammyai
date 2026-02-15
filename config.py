# config.py
"""
Centralized configuration management with validation.
Validates all required environment variables on import.
"""

import os
import logging
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


class ConfigError(Exception):
    """Raised when required configuration is missing or invalid."""
    pass


class Config:
    """Centralized configuration with validation."""
    
    # ============================================
    # OPENAI CONFIGURATION
    # ============================================
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    TAMMY_EMB_MODEL: str = os.getenv("TAMMY_EMB_MODEL", "text-embedding-3-small")
    TAMMY_CHAT_MODEL: str = os.getenv("TAMMY_CHAT_MODEL", "gpt-4o-mini")
    TAMMY_TEMPERATURE: float = float(os.getenv("TAMMY_TEMPERATURE", "0.2"))
    
    # ============================================
    # PINECONE CONFIGURATION
    # ============================================
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    
    # RAG Index (for books/documents)
    TAMMY_INDEX_NAME: str = os.getenv("TAMMY_INDEX_NAME", "tammy-books")
    TAMMY_NAMESPACE: str = os.getenv("TAMMY_NAMESPACE", "tammy-v1")
    
    # Memory Index (for semantic memories)
    TAMMY_MEMORY_INDEX: str = os.getenv("TAMMY_MEMORY_INDEX", "tammy-memories")
    
    # Retrieval parameters (optimized for speed)
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "2"))
    RAG_FETCH_K: int = int(os.getenv("RAG_FETCH_K", "3"))  # Reduced from 4
    SEMANTIC_MEMORY_K: int = int(os.getenv("SEMANTIC_MEMORY_K", "1"))
    
    # ============================================
    # MONGODB CONFIGURATION
    # ============================================
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "tammy")
    
    # ============================================
    # REDIS CONFIGURATION
    # ============================================
    REDIS_HOST: str = os.getenv("REDIS_HOST", "")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_USERNAME: str = os.getenv("REDIS_USERNAME", "default")
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    
    # Redis TTL and keys
    REDIS_TTL: int = int(os.getenv("REDIS_TTL", str(60 * 60 * 2)))  # 2 hours default
    REDIS_KEY_PREFIX: str = os.getenv("REDIS_KEY_PREFIX", "tammy:chat")
    
    # ============================================
    # MEMORY CONFIGURATION
    # ============================================
    SHORT_TERM_MESSAGE_LIMIT: int = int(os.getenv("SHORT_TERM_MESSAGE_LIMIT", "10"))  # Optimized for speed
    LONG_TERM_SESSION_LIMIT: int = int(os.getenv("LONG_TERM_SESSION_LIMIT", "3"))  # Reduced for speed
    
    # ============================================
    # APP CONFIGURATION
    # ============================================
    DEFAULT_USER_ID: str = os.getenv("DEFAULT_USER_ID", "1234")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    GRADIO_SHARE: bool = os.getenv("GRADIO_SHARE", "false").lower() == "true"  # Disabled for speed
    GRADIO_SERVER_PORT: int = int(os.getenv("GRADIO_SERVER_PORT", "7861"))  # Changed to avoid conflict
    
    @classmethod
    def validate(cls) -> None:
        """
        Validate that all required configuration is present.
        Raises ConfigError if any required config is missing.
        """
        errors = []
        
        # Required API keys
        if not cls.OPENAI_API_KEY:
            errors.append("OPENAI_API_KEY is required")
        
        if not cls.PINECONE_API_KEY:
            errors.append("PINECONE_API_KEY is required")
        
        if not cls.MONGO_URI:
            errors.append("MONGO_URI is required")
        
        if not cls.REDIS_HOST:
            errors.append("REDIS_HOST is required")
        
        if not cls.REDIS_PASSWORD:
            errors.append("REDIS_PASSWORD is required")
        
        # Validate ranges
        if cls.TAMMY_TEMPERATURE < 0 or cls.TAMMY_TEMPERATURE > 2:
            errors.append("TAMMY_TEMPERATURE must be between 0 and 2")
        
        if cls.REDIS_PORT < 1 or cls.REDIS_PORT > 65535:
            errors.append("REDIS_PORT must be between 1 and 65535")
        
        if errors:
            error_msg = "Configuration validation failed:\n" + "\n".join(f"  ❌ {err}" for err in errors)
            logger.error(error_msg)
            raise ConfigError(error_msg)
        
        logger.info("✅ Configuration validation passed")
    
    @classmethod
    def display_config(cls) -> None:
        """Display non-sensitive configuration for debugging."""
        logger.info("=== Tammy Configuration ===")
        logger.info(f"  OpenAI Model: {cls.TAMMY_CHAT_MODEL}")
        logger.info(f"  Embedding Model: {cls.TAMMY_EMB_MODEL}")
        logger.info(f"  RAG Index: {cls.TAMMY_INDEX_NAME}")
        logger.info(f"  Memory Index: {cls.TAMMY_MEMORY_INDEX}")
        logger.info(f"  MongoDB Database: {cls.MONGO_DB_NAME}")
        logger.info(f"  Redis Host: {cls.REDIS_HOST}:{cls.REDIS_PORT}")
        logger.info(f"  Log Level: {cls.LOG_LEVEL}")
        logger.info("===========================")


# Validate configuration on import
try:
    Config.validate()
except ConfigError as e:
    logger.critical(f"Failed to initialize Tammy due to configuration errors:\n{e}")
    raise


# Export singleton instance
config = Config()

__all__ = ["config", "Config", "ConfigError"]
