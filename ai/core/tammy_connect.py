"""
Tammy Connect Matching Engine
Implements intelligent semantic matching using real conversation memories.
"""

import time
import json
from typing import List, Dict, Any
from backend.logger import get_logger
from backend.db.mongodb_client import _mongodb_client
from backend.db.pinecone_manager import pinecone_manager
from backend.config import config

logger = get_logger(__name__)

def get_opted_in_users(exclude_user_id: str) -> List[Dict]:
    db = _mongodb_client._db
    if db is None:
        return []
    
    from bson import ObjectId
    # Exclude the requesting user
    exclude_filter = {"network_opted_in": True}
    try:
        exclude_filter["_id"] = {"$ne": ObjectId(exclude_user_id)}
    except Exception:
        pass

    users_raw = list(db["users"].find(
        exclude_filter,
        {"name": 1, "venture_description": 1}
    ))
    # Convert _id to user_id string for Pinecone compatibility
    users = []
    for u in users_raw:
        users.append({
            "user_id": str(u["_id"]),
            "name": u.get("name", ""),
            "venture_description": u.get("venture_description", ""),
        })
    return users


def find_matches(requesting_user_id: str, need_description: str) -> List[Dict]:
    """
    Search tammy-memories across opted-in users (excluding requester)
    for relevance to the need_description.
    """
    if not pinecone_manager.available:
        logger.warning("Pinecone unavailable for matching.")
        return []

    # 1. Embed the need description
    vec = pinecone_manager._embed(need_description)
    if not vec:
        return []

    # 2 & 3. Get opted-in users
    target_users = get_opted_in_users(requesting_user_id)
    if not target_users:
        return []
    
    target_user_ids = [u["user_id"] for u in target_users]
    user_map = {u["user_id"]: u for u in target_users}

    # Query Pinecone across these users
    try:
        r = pinecone_manager.memory_index.query(
            vector=vec,
            top_k=50,  # pull broad matches first, then group by user
            include_metadata=True,
            namespace=config.TAMMY_MEMORY_INDEX,
            filter={"user_id": {"$in": target_user_ids}, "type": "memory"}
        )
    except Exception as e:
        logger.error(f"Pinecone match query failed: {e}")
        return []

    # Group matches by user
    user_scores = {}
    for m in r.matches:
        uid = m.metadata.get("user_id")
        if not uid:
            continue
        if uid not in user_scores:
            user_scores[uid] = {
                "score": 0.0,
                "mentions": 0,
                "latest_ts": 0,
                "relevant_memories": []
            }
        
        # Accumulate score based on semantic similarity
        if m.score > 0.2:
            user_scores[uid]["score"] += float(m.score)
            user_scores[uid]["mentions"] += 1
            ts = float(m.metadata.get("timestamp", 0))
            if ts > user_scores[uid]["latest_ts"]:
                user_scores[uid]["latest_ts"] = ts
            user_scores[uid]["relevant_memories"].append(m.metadata.get("text", ""))

    # Format the results
    candidates = []
    for uid, data in user_scores.items():
        if data["mentions"] == 0:
            continue
            
        u_info = user_map.get(uid, {})
        
        # 4. Score each match and generate the match_reason using LLM
        from ai.core.llm_client import get_response
        memories_text = "\n- ".join(data["relevant_memories"][:10]) # Use top 10 most relevant chunks
        
        system_prompt = f"""
        You are Tammy's matchmaker logic. Analyze the following user's memories and venture context against the requested need.
        
        Requested Need: {need_description}
        Target User Name: {u_info.get('name', 'Anonymous')}
        Target User Venture Context: {u_info.get('venture_description', 'Not provided')}
        Relevant Conversation Memories from Target User:
        - {memories_text}
        
        Write a concise, personal 'match_reason' explaining EXACTLY why this person matches the need based ONLY on their specific memories and venture context. 
        It must sound like Tammy explaining it naturally to the requesting user.
        RULES:
        - MUST be specific and personal.
        - MUST reference exactly what Tammy knows about them from real conversations (the memories).
        - NEVER be generic.
        - Example of GOOD: "{u_info.get('name', 'They')} discussed startup validation, fundraising, and team building in recent sessions, which directly matches your need."
        - Example of BAD: "{u_info.get('name', 'They')} have startup experience."
        
        Return ONLY valid JSON:
        {{"match_reason": "your explanation string"}}
        """
        
        try:
            raw_res = get_response(system_prompt, "", "Analyze this match.", [])
            start = raw_res.find('{')
            end = raw_res.rfind('}') + 1
            res_json = json.loads(raw_res[start:end])
            match_reason = res_json.get("match_reason", "")
        except Exception as e:
            logger.error(f"Match reason generation failed: {e}")
            match_reason = f"They have {data['mentions']} relevant discussion points matching your need."

        candidates.append({
            "user_id": uid,
            "name": u_info.get("name", "Unknown"),
            "venture_description": u_info.get("venture_description", ""),
            "score": data["score"],
            "mentions": data["mentions"],
            "latest_ts": data["latest_ts"],
            "match_reason": match_reason
        })
        
    # Sort candidates by aggregate score
    candidates.sort(key=lambda x: x["score"], reverse=True)
    
    return candidates[:3]

def detect_and_match_network_need(user_id: str, message: str, session_id: str):
    """
    Background worker to detect if the user needs someone,
    find matches, and insert a follow-up intro offer.
    """
    # 1. Check for keywords quickly
    _NEED_SIGNALS = [
        "need someone", "looking for", "do you know anyone", 
        "find me someone", "i need a person who", "anyone who can",
        "need help with", "need advice", "wish i could talk to",
        "technical partner", "need funding", "need a co-founder",
        "need guidance", "has anyone else", "work with on",
        "don't have anyone", "we lack", "need a"
    ]
    msg_lower = message.lower()
    if not any(sig in msg_lower for sig in _NEED_SIGNALS):
        return

    # 2. Extract need with LLM
    from ai.core.llm_client import get_response
    import uuid

    system = (
        "Does this message express that the user is looking for a person, co-founder, mentor, advisor, investor, or collaborator? "
        "If yes, extract the exact need description. Return ONLY JSON: "
        "{\"needs_person\": true, \"need_description\": \"detailed description of what they need\"} or "
        "{\"needs_person\": false}. No markdown."
    )
    try:
        raw = get_response(system, "", message[:500], [])
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1 or end <= 0:
            return
        data = json.loads(raw[start:end])
        if not data.get("needs_person"):
            return
        need_desc = data.get("need_description", "").strip()
        if not need_desc:
            return

        # 3. Find matches using the engine
        matches = find_matches(user_id, need_desc)
        if not matches:
            return

        # 4. We found someone. Take the top match.
        top_match = matches[0]

        # 5. Store pending request in MongoDB
        db = _mongodb_client._db
        if db is None:
            return
        
        request_id = str(uuid.uuid4())
        db["network_requests"].insert_one({
            "request_id": request_id,
            "requester_id": user_id,
            "target_id": top_match["user_id"],
            "target_name": top_match["name"],
            "need_description": need_desc,
            "match_reason": top_match["match_reason"],
            "status": "pending_requester_approval", # Requester must say "Yes, reach out"
            "created_at": time.time()
        })

        # 6. Inject follow-up message into the active conversation
        intro_text = "Actually — I think I know someone in the network who fits this. Want me to reach out to them?"
        msg = {
            "id": str(uuid.uuid4()),
            "role": "tammy",
            "text": intro_text,
            "timestamp": time.time(),
            "type": "network_intro_offer",
            "network_request_id": request_id
        }
        
        db["conversations"].update_one(
            {"session_id": session_id},
            {"$push": {"messages": msg}}
        )
        logger.info(f"Injected network intro offer for {user_id}")

    except Exception as e:
        logger.error(f"Network need detection failed: {e}")

