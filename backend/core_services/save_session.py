# save_session.py
"""
Session persistence to MongoDB and Pinecone.
"""

from datetime import datetime
import time
from typing import List, Dict, Any, Optional

from backend.db.mongodb_client import user_sessions_col
from backend.db.pinecone_manager import pinecone_manager
from backend.logger import get_logger
from backend.constants import (
    ROLE_USER, ROLE_TAMMY, ROLE_ASSISTANT,
    ERROR_NO_CONVERSATION, ERROR_NO_KEY_POINTS,
    SENTIMENT_UNKNOWN, SESSION_TYPE_CHAT,
    MAX_KEY_POINT_LENGTH, SUCCESS_SESSION_SAVED,
    SUCCESS_MEMORY_SAVED, ERROR_EMPTY_MEMORY
)

logger = get_logger(__name__)


# -----------------------------------------------------------
# SAFE AUTO-SUMMARY (always returns valid strings)
# -----------------------------------------------------------
def generate_auto_summary(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Fallback summary generator that NEVER returns None.
    
    Args:
        messages: List of message dictionaries
    
    Returns:
        Summary dictionary with text, key_points, sentiment, and tags
    """
    if not messages:
        logger.debug("No messages to summarize")
        return {
            "text": ERROR_NO_CONVERSATION,
            "key_points": [ERROR_NO_KEY_POINTS],
            "sentiment": SENTIMENT_UNKNOWN,
            "tags": [],
        }

    last_user_msg = next(
        (m["text"] for m in reversed(messages) if m.get("role") == ROLE_USER),
        "User said nothing."
    )
    last_tammy_msg = next(
        (m["text"] for m in reversed(messages) if m.get("role") in (ROLE_TAMMY, ROLE_ASSISTANT)),
        "Tammy replied nothing."
    )

    summary_text = f"User said: '{last_user_msg}'. Tammy responded: '{last_tammy_msg}'."

    return {
        "text": summary_text,
        "key_points": [
            last_user_msg[:MAX_KEY_POINT_LENGTH] or ERROR_NO_KEY_POINTS,
            "Tammy provided guidance.",
        ],
        "sentiment": SENTIMENT_UNKNOWN,
        "tags": [],
    }


# -----------------------------------------------------------
# SAVE SESSION + PUSH SEMANTIC MEMORY TO PINECONE
# -----------------------------------------------------------
def save_session(
    user_id: str,
    messages: List[Dict[str, str]],
    summary: Optional[Dict[str, Any]] = None,
    session_type: str = SESSION_TYPE_CHAT,
) -> Optional[str]:
    """
    Stores the session in MongoDB and semantic memory in Pinecone.
    
    Args:
        user_id: User identifier
        messages: List of message dictionaries
        summary: Optional pre-generated summary
        session_type: Type of session (chat, onboarding, etc.)
    
    Returns:
        MongoDB inserted_id or None if failed
    """
    # ----- Validate or generate summary -----
    if summary is None:
        summary = generate_auto_summary(messages)

    # 🔥 CLEANING: remove None / empty values
    def clean(x):
        return str(x).strip() if x else ""

    summary["text"] = clean(summary.get("text"))
    summary["key_points"] = [clean(kp) for kp in summary.get("key_points", []) if clean(kp)]

    # -------------------------------------------------------
    # 1️⃣ SAVE SESSION TO MONGO
    # -------------------------------------------------------
    try:
        session_data = {
            "session_id": f"sess_{time.time()}",
            "user_id": user_id,
            "session_type": session_type,
            "timestamp": datetime.utcnow(),
            "messages": messages,
            "summary": summary,
        }

        mongo_result = user_sessions_col.insert_one(session_data)
        logger.info(f"✅ {SUCCESS_SESSION_SAVED}: {mongo_result.inserted_id}")
        
    except Exception as e:
        logger.error(f"Failed to save session to MongoDB: {e}")
        return None

    # -------------------------------------------------------
    # 2️⃣ SAVE SEMANTIC MEMORY TO PINECONE
    # -------------------------------------------------------
    try:
        memory_payload = []

        # Main summary text
        if summary["text"]:
            memory_payload.append(summary["text"])

        # Key points
        for kp in summary["key_points"]:
            if kp:
                memory_payload.append(kp)

        # Final cleaning (remove empty or None)
        memory_payload = [m for m in memory_payload if isinstance(m, str) and m.strip()]

        if memory_payload:
            success = pinecone_manager.upsert_memories(user_id, memory_payload)
            if success:
                logger.info(f"✅ {SUCCESS_MEMORY_SAVED}")
            else:
                logger.warning("Failed to save semantic memories")
        else:
            logger.warning(f"⚠️ {ERROR_EMPTY_MEMORY}")

    except Exception as e:
        logger.error(f"Pinecone memory upsert failed: {e}")

    # -------------------------------------------------------
    # 3️⃣ TRIGGER FOUNDER DNA ON 10TH SESSION
    # -------------------------------------------------------
    try:
        total_sessions = user_sessions_col.count_documents({"user_id": user_id})
        if total_sessions == 10:
            logger.info(f"User {user_id} hit 10 sessions. Triggering Founder DNA generation.")
            from backend.core_services.founder_dna_job import generate_founder_dna_bg
            generate_founder_dna_bg(user_id)
    except Exception as e:
        logger.error(f"Failed to trigger Founder DNA generation: {e}")

    return str(mongo_result.inserted_id)
