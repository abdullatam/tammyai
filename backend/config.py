# config.py
"""
Tammy V2 — Centralized configuration.
Optimized for speed, low token usage, and memory consistency.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class Config:
    # ── OpenAI ──────────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    TAMMY_CHAT_MODEL: str = os.getenv("TAMMY_CHAT_MODEL", "gpt-4o-mini")
    TAMMY_EMB_MODEL: str = os.getenv("TAMMY_EMB_MODEL", "text-embedding-3-small")
    TAMMY_TEMPERATURE: float = float(os.getenv("TAMMY_TEMPERATURE", "0.7"))
    MAX_RESPONSE_TOKENS: int = int(os.getenv("MAX_RESPONSE_TOKENS", "2000"))

    # ── Anthropic ────────────────────────────────────────
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    TAMMY_ANTHROPIC_MODEL: str = os.getenv("TAMMY_ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

    # ── Gemini ───────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    TAMMY_GEMINI_MODEL: str = os.getenv("TAMMY_GEMINI_MODEL", "gemini-2.5-flash")

    # ── Pinecone ─────────────────────────────────────────
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    TAMMY_INDEX_NAME: str = os.getenv("TAMMY_INDEX_NAME", "tammy-books")
    TAMMY_NAMESPACE: str = os.getenv("TAMMY_NAMESPACE", "tammy-v1")
    TAMMY_MEMORY_INDEX: str = os.getenv("TAMMY_MEMORY_INDEX", "tammy-memories")

    # ── MongoDB ──────────────────────────────────────────
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "tammy")

    # ── Redis ────────────────────────────────────────────
    REDIS_HOST: str = os.getenv("REDIS_HOST", "")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_USERNAME: str = os.getenv("REDIS_USERNAME", "default")
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_TTL: int = int(os.getenv("REDIS_TTL", str(60 * 60 * 2)))
    REDIS_KEY_PREFIX: str = os.getenv("REDIS_KEY_PREFIX", "tammy:chat")

    # ── Memory limits (V2 optimized for ≤7000 tokens) ───
    SHORT_TERM_MESSAGE_LIMIT: int = int(os.getenv("SHORT_TERM_MESSAGE_LIMIT", "6"))
    LONG_TERM_SESSION_LIMIT: int = int(os.getenv("LONG_TERM_SESSION_LIMIT", "6"))
    SEMANTIC_MEMORY_K: int = int(os.getenv("SEMANTIC_MEMORY_K", "4"))
    RAG_TOP_K: int = int(os.getenv("RAG_TOP_K", "2"))
    RAG_FETCH_K: int = int(os.getenv("RAG_FETCH_K", "3"))
    SUMMARY_MAX_CHARS: int = int(os.getenv("SUMMARY_MAX_CHARS", "400"))

    # ── App ──────────────────────────────────────────────
    DEFAULT_USER_ID: str = os.getenv("DEFAULT_USER_ID", "123")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    GRADIO_SHARE: bool = os.getenv("GRADIO_SHARE", "false").lower() == "true"
    GRADIO_SERVER_PORT: int = int(os.getenv("GRADIO_SERVER_PORT", "7861"))
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")

    # ── Voice ────────────────────────────────────────────
    SPEECHMATICS_API_KEY: str = os.getenv("SPEECHMATICS_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    AZURE_SPEECH_KEY: str = os.getenv("AZURE_SPEECH_KEY", "")
    AZURE_SPEECH_REGION: str = os.getenv("AZURE_SPEECH_REGION", "eastus")
    TTS_MODEL: str = os.getenv("TTS_MODEL", "tts-1")
    TTS_VOICE: str = os.getenv("TTS_VOICE", "nova")
    VOICE_SAMPLE_RATE: int = 16000    # STT recording rate (hz)
    VOICE_MAX_DURATION: float = 30.0  # Max recording length (seconds)

    # ── Attachments ──────────────────────────────────────
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "static/uploads")
    MAX_ATTACHMENT_BYTES: int = int(os.getenv("MAX_ATTACHMENT_BYTES", str(20 * 1024 * 1024)))  # 20 MB
    ATTACHMENT_TTL_HOURS: int = int(os.getenv("ATTACHMENT_TTL_HOURS", "24"))
    MAX_IMAGES_PER_MESSAGE: int = 5
    MAX_DOCS_PER_MESSAGE: int = 3


config = Config()

__all__ = ["config", "Config"]
