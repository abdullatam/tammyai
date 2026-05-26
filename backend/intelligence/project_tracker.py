# project_tracker.py
"""
Tammy V2 — Intelligent Project Detection & Tracking.
Scans conversations for project/company mentions and automatically creates or
updates project cards in MongoDB.  Runs in a background thread after each
conversation — never blocks the streaming response.
"""

import time
import json
import re
from typing import Optional, Dict

from backend.logger import get_logger

logger = get_logger(__name__)

# ────────────────────────────────────────────────────────────────
# Brand colors automatically assigned to new projects
# ────────────────────────────────────────────────────────────────
_BRAND_COLORS = [
    "#947DED", "#6B5BC8", "#C0ACFF", "#7B9BED", "#ED7D97",
    "#7DED94", "#EDB87D", "#ED7DC0", "#7DEDE4", "#C8ED7D",
]


def _pick_color(existing_count: int) -> str:
    return _BRAND_COLORS[existing_count % len(_BRAND_COLORS)]


# ────────────────────────────────────────────────────────────────
# LLM-based extraction
# ────────────────────────────────────────────────────────────────

_DETECT_PROMPT = """You are an executive assistant analyzing a conversation.  Identify ANY company, startup, product, side-project, or named initiative the user mentions as theirs or one they are actively working on.

Rules:
- Only extract projects the user OWNS, is building, or is deeply involved in.
- Do NOT extract companies that are just mentioned in passing (e.g. "Apple" in a news context).
- If no project is detected, return {"projects": []}.

Return ONLY valid JSON — no markdown, no explanation:
{
  "projects": [
    {
      "name": "ExactProjectName",
      "description": "1-2 sentence description if available",
      "stage": "idea|building|launched|scaling",
      "industry": "industry if mentioned",
      "team_size": null,
      "current_challenge": "what they are struggling with right now if mentioned",
      "last_milestone": "most recent win or achievement if mentioned",
      "clients": ["list of new clients mentioned"],
      "open_threads": ["unresolved question 1"],
      "stalled_on": "what has been mentioned but not progressed",
      "energy_level": "high|medium|low",
      "founded_context": "background info about the founder or founding if mentioned"
    }
  ]
}
Only fill in fields that are explicitly mentioned or strongly implied.  Leave others as null or empty."""

_UPDATE_PROMPT = """You are updating a project record based on a new conversation.

EXISTING PROJECT DATA:
{existing}

NEW CONVERSATION:
User: {user_msg}
Tammy: {tammy_msg}

Extract ONLY new or changed information from this conversation for the project "{name}".
Return ONLY the fields that should be UPDATED — omit unchanged fields.
Never overwrite a non-empty field with empty/null.

Return ONLY valid JSON — no markdown:
{{
  "description": "only if new/better description available",
  "stage": "only if stage changed",
  "industry": "only if newly mentioned",
  "team_size": null,
  "current_challenge": "only if a new challenge is mentioned",
  "last_milestone": "only if a new achievement is mentioned",
  "clients": ["only NEW clients mentioned"],
  "open_threads": ["only NEW unresolved questions — will be appended"],
  "stalled_on": "only if something new is stalled",
  "energy_level": "only if tone changed"
}}"""


def _parse_json_safe(text: str) -> Optional[dict]:
    """Best-effort JSON extraction from LLM output."""
    text = text.strip()
    # Strip markdown fences
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object in text
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
    return None


def detect_and_update_projects(
    user_id: str,
    user_message: str,
    tammy_response: str,
    session_id: Optional[str] = None,
):
    """
    Main entry point — called from tammy_core.py background thread.
    1. Ask LLM to detect project names in the conversation
    2. For each project: create or update in MongoDB
    """
    try:
        from ai.core.llm_client import get_response
        from backend.db.mongodb_client import _mongodb_client
        db = _mongodb_client._db
        if db is None:
            return

        # Get existing project names so the LLM can match follow-up messages
        existing_projects = list(db["projects"].find(
            {"user_id": user_id},
            {"name": 1, "description": 1}
        ))
        existing_names = [p["name"] for p in existing_projects]

        # Build detection prompt with existing project context
        existing_ctx = ""
        if existing_names:
            existing_ctx = (
                f"\n\nIMPORTANT — This user already has these known projects: {', '.join(existing_names)}. "
                "If the conversation is about one of these existing projects (even without mentioning the name explicitly), "
                "return that EXISTING project name. Only create a new project name if the user is clearly talking about "
                "something separate from these existing projects."
            )

        # ── Step 1: Detect projects ──────────────────────────────
        conversation = f"User: {user_message}\nTammy: {tammy_response}"
        raw = get_response(
            _DETECT_PROMPT + existing_ctx,
            "",  # no context needed
            conversation,
        )
        parsed = _parse_json_safe(raw)
        if not parsed or not parsed.get("projects"):
            return

        detected = parsed["projects"]
        logger.info(f"🗂️ Detected {len(detected)} project(s) for user {user_id}: {[p['name'] for p in detected]}")

        existing_count = db["projects"].count_documents({"user_id": user_id})

        for proj in detected:
            name = proj.get("name", "").strip()
            if not name or len(name) < 2:
                continue

            # ── Step 2: Check if project exists ──────────────────
            existing = db["projects"].find_one({
                "user_id": user_id,
                "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"},
            })

            if existing:
                _update_existing_project(db, existing, user_message, tammy_response, session_id)
            else:
                _create_new_project(db, user_id, proj, session_id, existing_count)
                existing_count += 1

    except Exception as e:
        logger.error(f"Project detection error: {e}")


def _create_new_project(db, user_id: str, proj: dict, session_id: Optional[str], color_idx: int):
    """Create a new project document."""
    now = time.time()
    doc = {
        "user_id": user_id,
        "name": proj.get("name", "Untitled"),
        "description": proj.get("description") or "",
        "stage": proj.get("stage") or "building",
        "industry": proj.get("industry") or "",
        "founded_context": proj.get("founded_context") or "",
        "team_size": proj.get("team_size"),
        "current_challenge": proj.get("current_challenge") or "",
        "last_milestone": proj.get("last_milestone") or "",
        "clients": [c for c in (proj.get("clients") or []) if c],
        "open_threads": [t for t in (proj.get("open_threads") or []) if t],
        "stalled_on": proj.get("stalled_on") or "",
        "energy_level": proj.get("energy_level") or "medium",
        "mentions_count": 1,
        "first_mentioned": now,
        "last_mentioned": now,
        "updated_at": now,
        "conversation_ids": [session_id] if session_id else [],
        "color": _pick_color(color_idx),
        # Legacy fields for UI compatibility
        "status": _stage_to_status(proj.get("stage")),
        "energy": [3, 4, 5, 6, 5, 4, 3],
        "threads": [t for t in (proj.get("open_threads") or []) if t],
        "open": len([t for t in (proj.get("open_threads") or []) if t]),
        "summary": proj.get("description") or "",
    }
    db["projects"].insert_one(doc)
    logger.info(f"🗂️ Created project '{doc['name']}' for user {user_id}")

    # Notification: project auto-created
    try:
        from backend.core_services.notification_manager import create_notification
        create_notification(user_id, {
            "type": "project_created",
            "title": f"Project added: {doc['name']}",
            "body": "Tammy created a project card from your conversation",
            "action_url": "/projects",
            "action_label": "See it",
        })
    except Exception:
        pass


def _update_existing_project(db, existing: dict, user_msg: str, tammy_msg: str, session_id: Optional[str]):
    """Update an existing project with new information from conversation."""
    try:
        from ai.core.llm_client import get_response

        # Prepare existing data summary (omit internal fields)
        existing_summary = {
            k: v for k, v in existing.items()
            if k not in ("_id", "user_id", "color", "energy", "threads", "open",
                        "status", "summary", "updated_at", "conversation_ids",
                        "first_mentioned", "mentions_count")
        }

        raw = get_response(
            _UPDATE_PROMPT.format(
                existing=json.dumps(existing_summary, default=str),
                user_msg=user_msg[:500],
                tammy_msg=tammy_msg[:500],
                name=existing["name"],
            ),
            "",
            "Extract updates.",
        )
        updates = _parse_json_safe(raw)
        if not updates:
            # Even if no field updates, still bump mention count
            _bump_mentions(db, existing, session_id)
            return

        # Build $set — never overwrite with empty values
        set_fields = {}
        for field in ("description", "stage", "industry", "current_challenge",
                      "last_milestone", "stalled_on", "energy_level",
                      "founded_context"):
            val = updates.get(field)
            if val and isinstance(val, str) and val.strip():
                set_fields[field] = val.strip()

        if updates.get("team_size") is not None:
            set_fields["team_size"] = updates["team_size"]

        # Stage → status mapping
        if "stage" in set_fields:
            set_fields["status"] = _stage_to_status(set_fields["stage"])

        # Update summary from description
        if "description" in set_fields:
            set_fields["summary"] = set_fields["description"]

        # Update current_challenge into summary if more useful
        if "current_challenge" in set_fields and not set_fields.get("description"):
            set_fields["last_said"] = set_fields["current_challenge"]

        # Append new open_threads
        new_threads = updates.get("open_threads", [])
        new_threads = [t for t in new_threads if t and isinstance(t, str)]

        # Append new clients
        new_clients = updates.get("clients", [])
        new_clients = [c for c in new_clients if c and isinstance(c, str)]

        now = time.time()
        set_fields["last_mentioned"] = now
        set_fields["updated_at"] = now

        update_op = {"$set": set_fields, "$inc": {"mentions_count": 1}}

        # Append new threads and session_id
        push_ops = {}
        if new_threads:
            push_ops["open_threads"] = {"$each": new_threads}
            push_ops["threads"] = {"$each": new_threads}  # Legacy field
        if new_clients:
            push_ops["clients"] = {"$each": new_clients}
        if session_id:
            push_ops["conversation_ids"] = session_id

        if push_ops:
            update_op["$push"] = push_ops

        # Update open count
        current_threads = len(existing.get("open_threads", []))
        set_fields["open"] = current_threads + len(new_threads)

        db["projects"].update_one({"_id": existing["_id"]}, update_op)
        logger.info(f"🗂️ Updated project '{existing['name']}': {list(set_fields.keys())}")
        
        # Fire Notification if fields changed
        if set_fields or new_clients:
            try:
                from backend.core_services.notification_manager import create_notification
                create_notification(existing.get("user_id"), {
                    "type": "project_updated",
                    "title": f"Project Update: {existing['name']}",
                    "body": "Tammy updated your project based on recent conversation.",
                    "action_url": "/projects"
                })
            except Exception as e:
                logger.error(f"Failed to fire project_updated notification: {e}")

    except Exception as e:
        logger.error(f"Project update error for '{existing.get('name')}': {e}")
        # Still bump mention count even if update fails
        _bump_mentions(db, existing, session_id)


def _bump_mentions(db, existing: dict, session_id: Optional[str]):
    """Just increment mention count and update timestamps."""
    now = time.time()
    update = {
        "$set": {"last_mentioned": now, "updated_at": now},
        "$inc": {"mentions_count": 1},
    }
    if session_id:
        update["$push"] = {"conversation_ids": session_id}
    db["projects"].update_one({"_id": existing["_id"]}, update)


def _stage_to_status(stage: Optional[str]) -> str:
    """Map project stage to UI status."""
    mapping = {
        "idea": "Review",
        "building": "Live",
        "launched": "Live",
        "scaling": "Live",
    }
    return mapping.get(stage, "Live") if stage else "Live"


__all__ = ["detect_and_update_projects"]
