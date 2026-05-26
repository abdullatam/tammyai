# memory_manager.py
"""
Tammy V2 — Single interface for all memory read/write operations.
Handles Redis (short-term), MongoDB (long-term), and Pinecone (semantic).

All operations use fixed user_id and session_id via identity.py.
"""

import json
import time
import hashlib
from typing import List, Dict, Optional, Any
from bson import ObjectId

from backend.db.redis_client import get_redis, is_redis_available
from backend.db.mongodb_client import _mongodb_client
from backend.db.pinecone_manager import pinecone_manager
from backend.auth.identity import get_session_id
from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)

# MongoDB collections — resolved at call time so we survive reconnects
def _col(name: str):
    """Get a MongoDB collection by name. Returns None if DB unavailable."""
    db = _mongodb_client._db
    if db is None:
        return None
    return db[name]


# ── Redis Keys ────────────────────────────────────────────────────────────────

def _chat_key(user_id: str) -> str:
    # Use both user_id and session_id for isolated Redis chat history
    try:
        session_id = get_session_id()
        return f"{config.REDIS_KEY_PREFIX}:{user_id}:{session_id}"
    except ValueError:
        return f"{config.REDIS_KEY_PREFIX}:{user_id}:default"

def _cache_key(question: str) -> str:
    h = hashlib.md5(question.strip().lower().encode()).hexdigest()
    return f"tammy:cache:{h}"


# ── Short-Term Memory (Redis) ─────────────────────────────────────────────────

def get_short_term(user_id: str) -> List[Dict]:
    """Get last N messages from Redis. Returns [] if Redis unavailable."""
    if not is_redis_available():
        return []
    try:
        r = get_redis()
        raw = r.lrange(_chat_key(user_id), -config.SHORT_TERM_MESSAGE_LIMIT, -1)
        return [json.loads(m) for m in raw if m]
    except Exception as e:
        logger.error(f"Redis read failed: {e}")
        return []


def save_message(user_id: str, role: str, text: str, attachments: Optional[List[Dict]] = None) -> None:
    """Push a message to Redis short-term memory."""
    if not is_redis_available():
        return
    try:
        r = get_redis()
        key = _chat_key(user_id)
        msg_obj = {"role": role, "text": text, "ts": time.time()}
        if attachments:
            msg_obj["attachments"] = attachments
        r.rpush(key, json.dumps(msg_obj))
        r.expire(key, config.REDIS_TTL)
    except Exception as e:
        logger.error(f"Redis write failed: {e}")


def clear_short_term(user_id: str) -> None:
    """Clear Redis short-term memory for user."""
    if not is_redis_available():
        return
    try:
        get_redis().delete(_chat_key(user_id))
        logger.info(f"✅ Redis cleared for user {user_id}")
    except Exception as e:
        logger.error(f"Redis clear failed: {e}")


# ── Response Cache (Redis) ────────────────────────────────────────────────────

def get_cached_response(question: str) -> Optional[str]:
    if not is_redis_available():
        return None
    try:
        return get_redis().get(_cache_key(question))
    except Exception:
        return None


def cache_response(question: str, response: str, ttl: int = 300) -> None:
    if not is_redis_available():
        return
    try:
        get_redis().setex(_cache_key(question), ttl, response)
    except Exception:
        pass


# ── Long-Term Memory (MongoDB) ────────────────────────────────────────────────

def get_user_profile(user_id: str) -> str:
    """
    Get user profile from MongoDB.
    Checks 'user_profile' (V1, rich data) and 'users' (V2) collections.
    Returns a compact summary string for context injection.
    """
    parts = []

    # ── V1: user_profile collection (has real rich data) ─────────────────────
    col_v1 = _col("user_profile")
    if col_v1 is not None:
        try:
            doc = col_v1.find_one({"user_id": user_id}, {"_id": 0})
            if doc:
                if doc.get("name"):
                    parts.append(f"Name: {doc['name']}")
                if doc.get("profile_summary"):
                    parts.append(f"About: {str(doc['profile_summary'])[:200]}")
                if doc.get("goals"):
                    g = doc["goals"]
                    goals_text = ", ".join(g[:4]) if isinstance(g, list) else str(g)[:150]
                    parts.append(f"Goals: {goals_text}")
                if doc.get("language"):
                    parts.append(f"Language: {doc['language']}")
                if doc.get("university") or doc.get("school"):
                    edu = doc.get("university") or doc.get("school")
                    parts.append(f"University: {edu}")
                if doc.get("personality"):
                    parts.append(f"Personality: {str(doc['personality'])[:100]}")
                # Catch-all for any other fields
                for k, v in doc.items():
                    if k not in ("user_id", "name", "profile_summary", "goals",
                                 "language", "university", "school", "personality",
                                 "_id", "created_at", "updated_at") and v:
                        parts.append(f"{k}: {str(v)[:80]}")
        except Exception as e:
            logger.error(f"user_profile V1 fetch failed: {e}")

    # ── V2: users collection ──────────────────────────────────────────────────
    if not parts:
        col_v2 = _col("users")
        if col_v2 is not None:
            try:
                # In V2, the user's primary doc is keyed by _id (as ObjectId)
                doc = col_v2.find_one({"_id": ObjectId(user_id)}, {"_id": 0})
                if doc:
                    if doc.get("username"):
                        parts.append(f"Name: {doc['username']}")
                    if doc.get("profile_summary"):
                        parts.append(f"About: {str(doc['profile_summary'])[:300]}")
                    if doc.get("goals"):
                        g = doc["goals"]
                        parts.append(f"Goals: {', '.join(g[:3]) if isinstance(g, list) else str(g)[:100]}")
            except Exception as e:
                logger.error(f"users V2 fetch failed: {e}")

    profile = " | ".join(parts)
    logger.info(f"[MongoDB] user profile loaded ({len(parts)} fields)")
    return profile



def get_long_term(user_id: str) -> List[Dict[str, Any]]:
    """
    Get recent session summaries from MongoDB.
    Reads from the new `sessions` collection.
    Each summary is truncated to SUMMARY_MAX_CHARS before LLM injection.
    """
    summaries = []

    col = _col("sessions")
    if col is not None:
        try:
            # Query isolated sessions belonging to the user
            docs = list(col.find(
                {"user_id": user_id},
                {"summary": 1, "session_name": 1, "updated_at": 1, "_id": 0},
                sort=[("updated_at", -1)],
                limit=config.LONG_TERM_SESSION_LIMIT,
            ))
            for doc in docs:
                name = doc.get("session_name", "Session")
                s = doc.get("summary", "")
                if isinstance(s, dict):
                    s = s.get("text", "")
                if s:
                    ts = doc.get("updated_at")
                    summaries.append({
                        "text": f"[{name}] {str(s)[:config.SUMMARY_MAX_CHARS]}",
                        "timestamp": ts
                    })
            logger.info(f"[MongoDB] retrieved {len(summaries)} sessions for user {user_id}")
        except Exception as e:
            logger.error(f"sessions fetch failed: {e}")

    if not summaries:
        logger.warning(f"[MongoDB] ⚠️ 0 summaries retrieved for user {user_id} — check collections")

    return summaries


def extract_facts(user_msg: str, bot_msg: str) -> List[str]:
    """Use LLM to extract specific facts about the user from a single turn."""
    from ai.core.llm_client import get_response
    
    prompt = f"""
    Extract ONLY specific personal facts, interests, or preferences about the user from this exchange.
    Exchange:
    User: {user_msg}
    Tammy: {bot_msg}
    
    Format: A simple list of sentences (e.g., 'User works at Apple', 'User likes hiking').
    Return 'NONE' if no new facts are found.
    """
    
    try:
        res = get_response("You are a fact extraction engine.", prompt, "", [])
        if "NONE" in res or len(res) < 5:
            return []
        # Split by newlines or bullets
        facts = [f.strip("- *").strip() for f in res.split("\n") if len(f.strip()) > 5]
        return facts
    except Exception as e:
        logger.error(f"Fact extraction failed: {e}")
        return []

def update_user_profile(user_id: str, facts: List[str]) -> None:
    """Append new facts to the user's profile summary in MongoDB."""
    if not facts:
        return
    
    col = _col("users")
    if col is not None:
        try:
            # We'll prepend the new facts to the existing profile_summary
            uid = ObjectId(user_id)
            doc = col.find_one({"_id": uid}) or {}
            existing = doc.get("profile_summary", "")
            
            new_facts_text = " | ".join(facts)
            updated_summary = f"{new_facts_text} | {existing}" if existing else new_facts_text
            
            # Keep it reasonably sized
            updated_summary = updated_summary[:1000]
            
            col.update_one(
                {"_id": uid},
                {"$set": {"profile_summary": updated_summary, "updated_at": time.time()}}
            )
            logger.info(f"✅ Updated profile with {len(facts)} new facts for user {user_id}")
        except Exception as e:
            logger.error(f"Profile update failed: {e}")

def save_session_summary(user_id: str, messages: List[Dict]) -> None:
    """Save the chat to `conversations`, the summary to `sessions`, and EXTRACT FACTS."""
    if not messages or len(messages) < 2:
        return

    try:
        session_id = get_session_id()
    except ValueError:
        logger.error("Cannot save session: no active session_id.")
        return

    # 1. Standard Persistence (Conversations & Sessions)
    user_msgs  = [m["text"] for m in messages if m.get("role") == "user"]
    tammy_msgs = [m["text"] for m in messages if m.get("role") in ("tammy", "assistant")]

    if not user_msgs:
        return

    # Conv save
    conv_col = _col("conversations")
    if conv_col is not None:
        try:
            conv_col.insert_one({
                "user_id": user_id,
                "session_id": session_id,
                "messages": messages,
                "timestamp": time.time(),
            })
        except Exception as e:
            logger.error(f"Conversation save failed: {e}")

    # Session Summary — richer: include all user turns + emotion/valence detection
    all_user_text = " ".join(user_msgs)
    # Keyword-based valence (fast, no extra LLM call)
    def _detect_valence_local(text: str):
        t = text.lower()
        if any(w in t for w in ["overwhelmed", "paralyzed", "burnout", "exhausted", "panic", "can't", "cannot", "breaking"]):
            return -0.65, "overwhelmed"
        if any(w in t for w in ["stressed", "anxious", "worried", "pressure", "struggling", "difficult", "hard time"]):
            return -0.35, "stressed"
        if any(w in t for w in ["heavy", "unsure", "confused", "lost", "blocked", "stuck", "unclear"]):
            return -0.15, "heavy"
        if any(w in t for w in ["restless", "frustrated", "scattered", "annoyed", "uneasy"]):
            return -0.05, "restless"
        if any(w in t for w in ["in flow", "in-flow", "excited", "breakthrough", "amazing", "nailed", "incredible"]):
            return 0.75, "in-flow"
        if any(w in t for w in ["clear", "decided", "resolved", "shipped", "launched", "progress", "better"]):
            return 0.40, "clear"
        return 0.0, "neutral"

    valence, emotion_tag = _detect_valence_local(all_user_text)

    # Build a compact but meaningful summary from all user messages, not just the last one
    recent_user = user_msgs[-3:] if len(user_msgs) >= 3 else user_msgs
    summary_text = (
        f"Topics: {'; '.join(m[:100] for m in recent_user)}. "
        f"Mood: {emotion_tag} ({valence:+.2f}). "
        f"Tammy: {tammy_msgs[-1][:100] if tammy_msgs else 'responded'}."
    )

    sess_col = _col("sessions")
    if sess_col is not None:
        try:
            # session_id might be a string hex from hashlib or an ObjectId string
            sid = session_id
            if isinstance(session_id, str) and len(session_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in session_id):
                sid = ObjectId(session_id)

            sess_col.update_one(
                {"user_id": user_id, "_id": sid},
                {
                    "$set": {
                        "summary": summary_text,
                        "valence": valence,
                        "emotion_tag": emotion_tag,
                        "updated_at": time.time(),
                    },
                    "$setOnInsert": {"created_at": time.time(), "session_name": f"Chat {time.strftime('%H:%M')}"}
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Session save to Mongo failed: {e}")

    # 2. Memory Perfection (Fact Extraction & Profile Sync)
    # Only run on the latest turn
    if len(user_msgs) >= 1 and len(tammy_msgs) >= 1:
        facts = extract_facts(user_msgs[-1], tammy_msgs[-1])
        if facts:
            update_user_profile(user_id, facts)
            # Also store these high-value facts in Pinecone for semantic retrieval
            pinecone_manager.upsert_memories(user_id, facts)

    # Base Pinecone back-up (raw message)
    try:
        memory_texts = [m["text"][:200] for m in messages if m.get("role") == "user" and len(m.get("text", "")) > 20]
        if memory_texts:
            pinecone_manager.upsert_memories(user_id, memory_texts)
    except Exception as e:
        logger.error(f"Session save to Pinecone failed: {e}")

    # Relationship extraction (background, best-effort)
    try:
        from backend.intelligence.relationship_manager import extract_relationships, upsert_relationships
        conv_text = " ".join([f"{m.get('role','')}: {m.get('text','')}" for m in messages])
        people = extract_relationships(user_id, conv_text)
        if people:
            upsert_relationships(user_id, people)
    except Exception as e:
        logger.error(f"Relationship extraction failed: {e}")

    # Energy level detection & storage
    try:
        energy = _detect_energy_level(messages)
        sess_col2 = _col("sessions")
        if sess_col2 is not None and energy:
            sid2 = session_id
            if isinstance(session_id, str) and len(session_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in session_id):
                try:
                    sid2 = ObjectId(session_id)
                except Exception:
                    pass
            sess_col2.update_one(
                {"user_id": user_id, "_id": sid2},
                {"$set": {"energy_level": energy}}
            )
    except Exception as e:
        logger.error(f"Energy level detection failed: {e}")


# ── Semantic & RAG (Pinecone) ─────────────────────────────────────────────────

def get_warmth_level(user_id: str) -> int:
    """Read warmth_level from users collection. Returns 3 (default) on any failure."""
    col = _col("users")
    if col is None:
        return 3
    for query_doc in ({"_id": ObjectId(user_id)}, {"user_id": user_id}):
        try:
            doc = col.find_one(query_doc, {"warmth_level": 1, "_id": 0})
            if doc and "warmth_level" in doc:
                return int(doc["warmth_level"])
        except Exception:
            continue
    return 3


def get_pending_interventions(user_id: str) -> List[Dict[str, Any]]:
    """Return unread intervention notifications for this user (max 3, newest first)."""
    col = _col("notifications")
    if col is None:
        return []
    try:
        docs = list(col.find(
            {"user_id": user_id, "type": "intervention", "read": False},
            sort=[("timestamp", -1)],
            limit=3,
        ))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
    except Exception as e:
        logger.error(f"Failed to fetch pending interventions: {e}")
        return []


def get_semantic(user_id: str, query: str) -> List[Dict[str, Any]]:
    """Get semantically relevant memories from Pinecone (namespace=user_id)."""
    results = pinecone_manager.query_memories(user_id, query)
    logger.info(f"[Pinecone] {len(results)} semantic memories for user {user_id}")
    if len(results) == 0:
        logger.warning(f"[Pinecone] ⚠️ 0 memories retrieved for user {user_id} — check namespace/index")
    return results


def get_rag(query: str) -> List[str]:
    """Get relevant knowledge from Pinecone RAG index."""
    return pinecone_manager.query_rag(query)


RESOLUTION_WINDOWS = {
    "illness": 14, "sick": 14, "flu": 14, "cold": 14,
    "grief": 90, "loss": 90, "died": 90, "death": 90,
    "excited": 3, "launch": 3, "release": 3,
    "stress": 30, "overwhelm": 30, "burnout": 30,
    "breakup": 60, "divorce": 60
}

def get_time_label(timestamp: float, text: str = "") -> str:
    """Convert unix timestamp to human-readable relative label."""
    if not timestamp:
        return ""
    
    elapsed_days = (time.time() - timestamp) / 86400.0
    
    label = ""
    if elapsed_days < 1:
        label = "today"
    elif elapsed_days < 2:
        label = "yesterday"
    elif elapsed_days < 7:
        label = f"{int(elapsed_days)} days ago"
    elif elapsed_days < 28:
        label = f"{int(elapsed_days / 7)} weeks ago"
    elif elapsed_days < 365:
        label = f"{int(elapsed_days / 30)} months ago"
    else:
        label = f"{int(elapsed_days / 365)} years ago"
        
    text_lower = text.lower()
    resolved = False
    
    for kw, max_days in RESOLUTION_WINDOWS.items():
        if kw in text_lower and elapsed_days > max_days:
            resolved = True
            break
            
    if resolved:
        return f"[{label}, likely resolved]"
    return f"[{label}]"

def apply_time_labels(memories: List[Any]) -> List[str]:
    """Takes a list of memory dicts (or strings) and prepends time labels."""
    results = []
    for m in memories:
        if isinstance(m, dict):
            text = m.get("text", "")
            ts = m.get("timestamp")
            if ts:
                label = get_time_label(ts, text)
                results.append(f"{label} {text}" if label else text)
            else:
                results.append(text)
        elif isinstance(m, str):
            results.append(m)
    return results


def _detect_energy_level(messages: List[Dict]) -> str:
    """
    Keyword + message-length heuristic to classify energy as low/medium/high.
    Used to inform Tammy's response style (don't push action when low).
    """
    texts = [m.get("text", "").lower() for m in messages if m.get("role") == "user"]
    if not texts:
        return "medium"

    combined = " ".join(texts)

    low_signals = ["exhausted", "can't focus", "can't concentrate", "drained", "tired",
                   "no energy", "barely", "struggling", "numb", "can't think", "foggy",
                   "burned out", "burnout", "overwhelmed", "shutting down"]
    high_signals = ["on fire", "pumped", "energized", "flying", "crushing it", "breakthrough",
                    "unstoppable", "so motivated", "electric", "dialed in", "in the zone",
                    "excited", "loving this", "incredible momentum"]

    low_count = sum(1 for w in low_signals if w in combined)
    high_count = sum(1 for w in high_signals if w in combined)

    # Avg message length also signals energy (short = low engagement)
    avg_len = sum(len(t.split()) for t in texts) / len(texts)

    if low_count >= 2 or (low_count >= 1 and avg_len < 10):
        return "low"
    if high_count >= 2 or (high_count >= 1 and avg_len > 20):
        return "high"
    if avg_len < 8 and not high_count:
        return "low"
    return "medium"


def get_energy_level(user_id: str) -> str:
    """Get the most recently detected energy level for a user."""
    col = _col("sessions")
    if col is None:
        return "medium"
    try:
        doc = col.find_one(
            {"user_id": user_id, "energy_level": {"$exists": True}},
            {"energy_level": 1},
            sort=[("updated_at", -1)]
        )
        return doc.get("energy_level", "medium") if doc else "medium"
    except Exception:
        return "medium"


__all__ = [
    "get_short_term", "save_message", "clear_short_term",
    "get_cached_response", "cache_response",
    "get_user_profile", "get_long_term", "save_session_summary",
    "get_semantic", "get_rag", "extract_facts", "update_user_profile",
    "get_time_label", "apply_time_labels",
    "get_warmth_level", "get_pending_interventions",
    "_detect_energy_level", "get_energy_level",
]
