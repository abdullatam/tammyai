# save_session.py

from datetime import datetime
import time
from typing import List, Dict, Any
from typing import Optional
from mongodb_client import user_sessions_col
from pinecone_memory_store import upsert_memories


# -----------------------------------------------------------
# SAFE AUTO-SUMMARY (always returns valid strings)
# -----------------------------------------------------------
def generate_auto_summary(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """Fallback summary generator that NEVER returns None."""
    if not messages:
        return {
            "text": "No conversation content available.",
            "key_points": ["No key points available."],
            "sentiment": "neutral",
            "tags": [],
        }

    last_user_msg = next(
        (m["text"] for m in reversed(messages) if m.get("role") == "user"),
        "User said nothing."
    )
    last_tammy_msg = next(
        (m["text"] for m in reversed(messages) if m.get("role") in ("tammy", "assistant")),
        "Tammy replied nothing."
    )

    summary_text = f"User said: '{last_user_msg}'. Tammy responded: '{last_tammy_msg}'."

    return {
        "text": summary_text,
        "key_points": [
            last_user_msg[:120] or "No key point.",
            "Tammy provided guidance.",
        ],
        "sentiment": "unknown",
        "tags": [],
    }


# -----------------------------------------------------------
# SAVE SESSION + PUSH SEMANTIC MEMORY TO PINECONE
# -----------------------------------------------------------
def save_session(
    user_id: str,
    messages: List[Dict[str, str]],
    summary: Optional[Dict[str, Any]] = None,
    session_type: str = "chat",
):
    """Stores the session in MongoDB and semantic memory in Pinecone."""

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
    session_data = {
        "session_id": f"sess_{time.time()}",
        "user_id": user_id,
        "session_type": session_type,
        "timestamp": datetime.utcnow(),
        "messages": messages,
        "summary": summary,
    }

    mongo_result = user_sessions_col.insert_one(session_data)
    print(f"✅ Session saved to MongoDB: {mongo_result.inserted_id}")

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
            upsert_memories(user_id, memory_payload)
            print("✅ Semantic memories saved to Pinecone")
        else:
            print("⚠️ Nothing to save in Pinecone (empty memory list).")

    except Exception as e:
        print("❌ Pinecone memory upsert failed:", e)

    return mongo_result.inserted_id
