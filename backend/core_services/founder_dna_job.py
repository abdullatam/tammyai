import time
import json
import threading
from typing import Optional, List, Dict
from bson import ObjectId

from backend.logger import get_logger
from backend.db.mongodb_client import _mongodb_client
from ai.core.llm_client import get_response
from backend.core_services.notification_manager import create_notification

logger = get_logger(__name__)

FOUNDER_DNA_PROMPT = """You are Tammy's psychological profiling engine. Analyze this founder's chat sessions and extract a DEEP, SPECIFIC "Founder DNA" profile.

RULES FOR GENERATION:
- Every single point must reference specific evidence (e.g., dates, session context, what was said, how many times).
- NO GENERIC STATEMENTS. "you tend to avoid hard conversations" is unacceptable. "you redirected away from the CTO conversation 4 times" is acceptable.
- If data does not support a conclusion, do not include it.
- We need to extract patterns in pairs (left side vs right side, e.g. "Fast execution" vs "Paralysis on big bets").

DIMENSIONS TO EXTRACT (use these for the 'cat' field in pairs):
- decision: decision patterns and speed
- emotion: emotional triggers and states
- performance: performance conditions
- avoidance: avoidance patterns
- strength: relationship with growth and success

CONVERSATION LOG (Last 20 sessions max):
{sessions_text}

Return ONLY valid JSON in this exact format:
{{
  "archetype": "Title Case Archetype Name (e.g. 'The Visionary Who Fears Their Own Creation')",
  "archetype_desc": "2 sharp sentences summarizing their core pattern.",
  "pairs": [
    {{
      "cat": "decision|emotion|performance|avoidance|strength",
      "left": "Left side of pattern (e.g. 'Moves fast on product')",
      "right": "Right side of pattern (e.g. 'Freezes on hiring')",
      "strength": 0.85,
      "evidence": "Specific evidence from the sessions.",
      "when": "Session numbers/dates"
    }}
  ]
}}
"""

def generate_founder_dna_bg(user_id: str):
    """Generate Founder DNA for a user in a background thread."""
    threading.Thread(target=_generate_founder_dna, args=(user_id,)).start()

def _generate_founder_dna(user_id: str):
    try:
        db = _mongodb_client._db
        if db is None:
            return

        # Fetch up to 20 most recent sessions
        sessions = list(db["sessions"].find({"user_id": user_id}).sort("timestamp", 1))
        if len(sessions) < 10:
            logger.info(f"User {user_id} has {len(sessions)} sessions. Minimum 10 required for Founder DNA.")
            return

        sessions_text = ""
        for i, s in enumerate(sessions[-20:]):
            ts = s.get("timestamp")
            ts_str = ts.strftime("%B %d, %Y at %I:%M %p") if ts else "Unknown time"
            summary = s.get("summary", {})
            text = summary.get("text", "") if isinstance(summary, dict) else str(summary)
            sessions_text += f"Session {i+1} ({ts_str}):\n{text}\n\n"

        prompt = FOUNDER_DNA_PROMPT.format(sessions_text=sessions_text)
        
        raw_response = get_response(prompt, "", "Extract Founder DNA", [])
        start = raw_response.find('{')
        end = raw_response.rfind('}') + 1
        if start == -1 or end <= 0:
            logger.error("Failed to parse JSON from Founder DNA response")
            return
            
        dna_data = json.loads(raw_response[start:end])
        
        # Save to DB
        db["founder_dna"].update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "data": dna_data,
                "session_count_at_generation": len(sessions),
                "updated_at": time.time()
            }},
            upsert=True
        )
        
        logger.info(f"🧬 Generated Founder DNA for user {user_id}")
        
    except Exception as e:
        logger.error(f"Founder DNA generation failed for {user_id}: {e}")

def run_retroactive_generation():
    """Find eligible accounts and generate their DNA."""
    try:
        db = _mongodb_client._db
        if db is None:
            print("No MongoDB connection")
            return
            
        print("Starting retroactive Founder DNA generation...")
        
        # Aggregate user session counts
        pipeline = [
            {"$group": {"_id": "$user_id", "session_count": {"$sum": 1}}},
            {"$match": {"session_count": {"$gte": 10}}}
        ]
        
        eligible_users = list(db["sessions"].aggregate(pipeline))
        processed = []
        
        for u in eligible_users:
            user_id = u["_id"]
            session_count = u["session_count"]
            
            existing = db["founder_dna"].find_one({"user_id": user_id})
            
            needs_generation = True
            if not existing:
                print(f"User {user_id} needs initial DNA generation (has {session_count} sessions)")
            elif existing.get("session_count_at_generation", 0) < 10:
                print(f"User {user_id} needs DNA regeneration (generated at < 10 sessions)")
            else:
                print(f"User {user_id} forcing regeneration to update format.")
                
            if needs_generation:
                _generate_founder_dna(user_id)
                processed.append(user_id)
                
        print(f"Finished. Processed {len(processed)} accounts: {processed}")
        return processed
        
    except Exception as e:
        print(f"Retroactive generation failed: {e}")

if __name__ == "__main__":
    run_retroactive_generation()
