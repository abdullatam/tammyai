# admin_prompts.py
"""
Admin routes for system prompt versioning, editing, publishing, playground.
"""
import time
import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.auth.admin_auth import require_admin
from ai.prompts.prompt_cache import invalidate_prompt_cache
from backend.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin/prompts", tags=["admin-prompts"])


def _db():
    from backend.db.mongodb_client import _mongodb_client
    db = _mongodb_client._db
    if db is None:
        raise HTTPException(503, "Database unavailable")
    return db


def _to_doc(doc) -> dict:
    if doc is None:
        return None
    d = dict(doc)
    d["_id"] = str(d["_id"])
    for k in ("created_at", "published_at"):
        if k in d and d[k]:
            d[k] = d[k].isoformat() if hasattr(d[k], "isoformat") else d[k]
    if "version_id" in d and d["version_id"] is not None:
        d["version_id"] = str(d["version_id"])
    if "parent_version" in d and d["parent_version"] is not None:
        d["parent_version"] = str(d["parent_version"])
    return d


# ── Models ────────────────────────────────────────────────────────────────────

class CreatePromptBody(BaseModel):
    content: str
    note: Optional[str] = ""
    parent_version: Optional[str] = None


class UpdatePromptBody(BaseModel):
    content: Optional[str] = None
    note: Optional[str] = None


class PlaygroundBody(BaseModel):
    messages: list   # [{role: "user"|"assistant", content: str}]


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("", dependencies=[Depends(require_admin)])
async def list_prompts(page: int = 1, limit: int = 50):
    db = _db()
    skip = (page - 1) * limit
    docs = list(db["prompt_versions_v2"].find(
        {}, {"content": 0}
    ).sort("version", -1).skip(skip).limit(limit))
    total = db["prompt_versions_v2"].count_documents({})
    return {"versions": [_to_doc(d) for d in docs], "total": total}


@router.get("/active", dependencies=[Depends(require_admin)])
async def get_active_prompt():
    db = _db()
    active = db["prompt_active"].find_one({"_id": "current"})
    if not active:
        raise HTTPException(404, "No active prompt")
    version_doc = db["prompt_versions_v2"].find_one({"_id": active["version_id"]})
    if not version_doc:
        raise HTTPException(404, "Active version doc missing")
    return _to_doc(version_doc)


@router.get("/{version_id}", dependencies=[Depends(require_admin)])
async def get_prompt(version_id: str):
    db = _db()
    try:
        oid = ObjectId(version_id)
    except Exception:
        raise HTTPException(400, "Invalid version_id")
    doc = db["prompt_versions_v2"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Version not found")
    return _to_doc(doc)


@router.post("", dependencies=[Depends(require_admin)])
async def create_draft(body: CreatePromptBody, admin: str = Depends(require_admin)):
    db = _db()
    last = db["prompt_versions_v2"].find_one({}, sort=[("version", -1)])
    next_v = (last["version"] + 1) if last else 1

    parent_oid = None
    if body.parent_version:
        try:
            parent_oid = ObjectId(body.parent_version)
        except Exception:
            pass

    oid = ObjectId()
    now = datetime.datetime.utcnow()
    doc = {
        "_id":            oid,
        "version":        next_v,
        "content":        body.content.strip(),
        "note":           body.note or "",
        "status":         "draft",
        "created_by":     admin,
        "created_at":     now,
        "published_at":   None,
        "published_by":   None,
        "parent_version": parent_oid,
    }
    db["prompt_versions_v2"].insert_one(doc)
    logger.info(f"Created draft v{next_v} by {admin}")
    return _to_doc(doc)


@router.patch("/{version_id}", dependencies=[Depends(require_admin)])
async def update_draft(version_id: str, body: UpdatePromptBody, admin: str = Depends(require_admin)):
    db = _db()
    try:
        oid = ObjectId(version_id)
    except Exception:
        raise HTTPException(400, "Invalid version_id")

    doc = db["prompt_versions_v2"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Version not found")
    if doc["status"] != "draft":
        raise HTTPException(400, f"Cannot edit a {doc['status']} version — fork it instead")

    updates = {}
    if body.content is not None:
        updates["content"] = body.content.strip()
    if body.note is not None:
        updates["note"] = body.note

    if updates:
        db["prompt_versions_v2"].update_one({"_id": oid}, {"$set": updates})
    return _to_doc(db["prompt_versions_v2"].find_one({"_id": oid}))


@router.post("/{version_id}/publish", dependencies=[Depends(require_admin)])
async def publish_prompt(version_id: str, admin: str = Depends(require_admin)):
    db = _db()
    try:
        oid = ObjectId(version_id)
    except Exception:
        raise HTTPException(400, "Invalid version_id")

    doc = db["prompt_versions_v2"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Version not found")
    if doc["status"] == "archived":
        raise HTTPException(400, "Archived versions cannot be published directly — use rollback")

    now = datetime.datetime.utcnow()

    # Archive the currently published version
    db["prompt_versions_v2"].update_many(
        {"status": "published"},
        {"$set": {"status": "archived"}}
    )

    # Publish the target version
    db["prompt_versions_v2"].update_one(
        {"_id": oid},
        {"$set": {"status": "published", "published_at": now, "published_by": admin}}
    )

    # Update prompt_active
    db["prompt_active"].replace_one(
        {"_id": "current"},
        {
            "_id":            "current",
            "version_id":     oid,
            "version_number": doc["version"],
            "activated_at":   now,
            "activated_by":   admin,
        },
        upsert=True
    )

    # Invalidate cache — new prompt takes effect within 1 second
    invalidate_prompt_cache()
    logger.info(f"Published v{doc['version']} by {admin}")
    return {"ok": True, "published_version": doc["version"]}


@router.post("/{version_id}/rollback", dependencies=[Depends(require_admin)])
async def rollback_prompt(version_id: str, admin: str = Depends(require_admin)):
    """Create a new published version copying the target's content."""
    db = _db()
    try:
        oid = ObjectId(version_id)
    except Exception:
        raise HTTPException(400, "Invalid version_id")

    source = db["prompt_versions_v2"].find_one({"_id": oid})
    if not source:
        raise HTTPException(404, "Version not found")

    last = db["prompt_versions_v2"].find_one({}, sort=[("version", -1)])
    next_v = (last["version"] + 1) if last else 1
    now = datetime.datetime.utcnow()

    # Archive current published
    db["prompt_versions_v2"].update_many({"status": "published"}, {"$set": {"status": "archived"}})

    new_oid = ObjectId()
    new_doc = {
        "_id":            new_oid,
        "version":        next_v,
        "content":        source["content"],
        "note":           f"Rollback from v{source['version']}",
        "status":         "published",
        "created_by":     admin,
        "created_at":     now,
        "published_at":   now,
        "published_by":   admin,
        "parent_version": oid,
    }
    db["prompt_versions_v2"].insert_one(new_doc)
    db["prompt_active"].replace_one(
        {"_id": "current"},
        {"_id": "current", "version_id": new_oid, "version_number": next_v,
         "activated_at": now, "activated_by": admin},
        upsert=True
    )
    invalidate_prompt_cache()
    logger.info(f"Rolled back to content of v{source['version']} as new v{next_v} by {admin}")
    return _to_doc(new_doc)


@router.post("/{version_id}/playground", dependencies=[Depends(require_admin)])
async def playground(version_id: str, body: PlaygroundBody):
    """
    Run a test conversation using this version's prompt.
    Does NOT affect production.
    """
    db = _db()
    try:
        oid = ObjectId(version_id)
    except Exception:
        raise HTTPException(400, "Invalid version_id")

    doc = db["prompt_versions_v2"].find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Version not found")

    import anthropic as _ant
    import os
    start = time.time()
    try:
        client = _ant.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
        messages = [{"role": m["role"], "content": m["content"]} for m in body.messages]
        resp = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            system=doc["content"],
            messages=messages,
        )
        text = resp.content[0].text if resp.content else ""
        tokens = resp.usage.input_tokens + resp.usage.output_tokens
        return {
            "response":    text,
            "tokens_used": tokens,
            "latency_ms":  int((time.time() - start) * 1000),
            "version":     doc["version"],
        }
    except Exception as e:
        raise HTTPException(500, f"Playground error: {e}")
