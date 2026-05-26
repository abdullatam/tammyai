import json
import time
from typing import Optional
from backend.logger import get_logger

logger = get_logger(__name__)

_PREDICTION_PROMPT = """You are a behavioral analyst looking for explicit predictions about the future.
A prediction is a statement where the user claims something WILL happen or WILL NOT happen, usually with some degree of certainty.
Examples of predictions:
- "I'm sure we'll hit $10k MRR this month"
- "I bet my co-founder will quit in 3 months"
- "They are going to reject our pitch tomorrow"
- "I think this launch will fail"

NOT predictions:
- "I want to launch next week" (Goal)
- "I decided to fire him" (Decision)
- "I'm worried about the market" (Emotion)

Analyze the following user message and determine if they made a prediction.
If they did, extract it and assign a confidence score (0-100) based on their language (e.g., "I know" = 90, "I think" = 60).
Categorize the domain into one of: Business, Product, Sales, Team, Market, Personal, Relationships, Other.

Return ONLY valid JSON:
{{
  "prediction_detected": true|false,
  "text": "The core prediction cleanly summarized (e.g., 'Will hit $10k MRR this month')",
  "confidence": 80,
  "domain": "Sales"
}}
"""

def detect_and_log_prediction(user_id: str, text: str) -> Optional[dict]:
    """
    Analyzes a user message in the background. If a prediction is detected,
    logs it to the user's calibration tracker and fires a notification.
    """
    if not text or len(text.strip()) < 10:
        return None
        
    try:
        from ai.core.llm_client import get_response
        
        response = get_response(
            system_prompt=_PREDICTION_PROMPT,
            context="",
            question=text,
            history=[]
        )
        
        # Parse JSON
        start = response.find('{')
        end = response.rfind('}')
        if start == -1 or end == -1:
            return None
            
        data = json.loads(response[start:end+1])
        
        if not data.get("prediction_detected"):
            return None
            
        prediction_text = data.get("text")
        confidence = data.get("confidence", 70)
        domain = data.get("domain", "Business")
        
        if not prediction_text:
            return None
            
        # Add to DB
        from backend.db.mongodb_client import _mongodb_client
        from bson import ObjectId
        
        db = _mongodb_client._db
        if db is None:
            return None
            
        prediction = {
            "text": prediction_text,
            "confidence": int(confidence),
            "domain": domain,
            "verdict": "pending",
            "created_at": time.time(),
        }
        
        # Append to calibration_cache.recent
        doc = db["users"].find_one({"_id": ObjectId(user_id)}, {"calibration_cache": 1})
        cal = doc.get("calibration_cache") if doc else None
        
        if isinstance(cal, dict) and "recent" in cal:
            cal["recent"].insert(0, {"date": "just now", **prediction})
            # Also increment stats total so UI counts match
            stats = cal.get("stats", [])
            domain_found = False
            for s in stats:
                if s.get("domain", "").lower() == domain.lower():
                    s["total"] = s.get("total", 0) + 1
                    domain_found = True
                    break
            if not domain_found:
                stats.append({"domain": domain, "total": 1, "right": 0, "wrong": 0, "partial": 0})
            cal["stats"] = stats
        else:
            cal = {
                "stats": [{"domain": domain, "total": 1, "right": 0, "wrong": 0, "partial": 0}], 
                "recent": [{"date": "just now", **prediction}]
            }
            
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"calibration_cache": cal}}
        )
        
        logger.info(f"🎯 Prediction logged for {user_id}: {prediction_text}")
        
        # Fire Notification
        try:
            from backend.core_services.notification_manager import create_notification
            create_notification(user_id, {
                "type": "calibration_update",
                "title": "Prediction Tracked",
                "body": f"Logged prediction: '{prediction_text}' at {confidence}% confidence.",
                "action_label": "View Calibration",
                "action_url": "/calibration",
                "priority": "medium"
            })
        except Exception as ne:
            logger.error(f"Failed to create prediction notification: {ne}")
            
        return prediction
        
    except Exception as e:
        logger.error(f"Prediction detection error: {e}")
        return None

if __name__ == "__main__":
    # Test script
    print("Testing prediction detection...")
    uid = "69cfd6c888cae0899dc4956a" # test user
    msg = "I bet we hit 1 million MRR by Q4"
    res = detect_and_log_prediction(uid, msg)
    print("Result:", res)
