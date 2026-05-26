import time
import json
import uuid
from typing import Optional

from backend.logger import get_logger
from backend.db.mongodb_client import _mongodb_client

logger = get_logger(__name__)

_DECISION_PROMPT = """You are an executive assistant detecting major commitments and decisions in a founder's message.

A decision IS detected when:
- User states commitment: "I decided to..." · "we're going with..." · "I chose..." · "we decided"
- User states irreversible action: "I'm firing..." · "we're shutting down..." · "I'm pivoting..."
- User states strong commitment: "we're raising a seed round" · "I'm hiring Omar" · "we signed with..."
- User resolves uncertainty they expressed before: was saying "I don't know" → now saying "I've decided"
- User announces outcome of a decision process: "we went with option B"

A decision is NOT detected when:
- User is still considering: "I'm thinking about..." · "I might..." · "maybe we should..."
- User asks opinion without committing
- User vents without committing to action
- User asks hypothetically: "what if we..."

Analyze the message below. If a decision IS detected, extract the details.
Return ONLY valid JSON:
{{
  "decision_detected": true|false,
  "decision_text": "A very short, punchy 3-5 word title of the decision (e.g. 'Pivot to Pharma in Jordan')",
  "context": "A 1-2 sentence detailed explanation of the decision and why it was made",
  "emotional_state": "high-arousal-negative | high-arousal-positive | neutral",
  "is_major": true|false,
  "is_irreversible": true|false
}}

User Message: {user_message}
"""

def detect_and_log_decision(user_id: str, user_message: str):
    """Detect decisions in background and log them."""
    try:
        from ai.core.llm_client import get_response
        
        raw = get_response(
            _DECISION_PROMPT.format(user_message=user_message[:500]),
            "",
            "Analyze for decisions.",
            []
        )
        
        start = raw.find('{')
        end = raw.rfind('}') + 1
        if start == -1 or end <= 0:
            return
            
        data = json.loads(raw[start:end])
        
        if not data.get("decision_detected"):
            return
            
        decision_text = data.get("decision_text")
        if not decision_text:
            return
            
        db = _mongodb_client._db
        if db is None:
            return
            
        decision_id = str(uuid.uuid4())
        now = time.time()
        
        doc = {
            "decision_id": decision_id,
            "user_id": user_id,
            "text": decision_text,
            "context": data.get("context", ""),
            "emotional_state": data.get("emotional_state", "neutral"),
            "is_major": data.get("is_major", False),
            "is_irreversible": data.get("is_irreversible", False),
            "status": "pending",
            "created_at": now,
            "follow_up_at": now + (7 * 86400) # 7 days later
        }
        
        db["decisions"].insert_one(doc)
        logger.info(f"⚖️ Logged decision for {user_id}: {decision_text}")
        
        # Fire Notification
        try:
            from backend.core_services.notification_manager import create_notification
            create_notification(user_id, {
                "type": "decision_new",
                "title": "Decision Logged",
                "body": decision_text,
                "action_url": "/decisions"
            })
        except Exception as e:
            logger.error(f"Failed to create decision notification: {e}")
            
    except Exception as e:
        logger.error(f"Decision detection failed: {e}")
