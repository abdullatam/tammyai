# admin_rag.py
"""
Admin routes for RAG book ingestion into Pinecone (tammy-books / tammy-v1).
Additive only. Never destructive to existing vectors.
"""
import io
import json
import time
import uuid
import datetime
import asyncio
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Body
from pydantic import BaseModel

from backend.auth.admin_auth import require_admin
from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/admin/rag", tags=["admin-rag"])

# ── In-memory stores ──────────────────────────────────────────────────────────
_validation_cache: dict = {}   # validation_id → {df, expires_at, filename, summary}
_job_store:        dict = {}   # job_id → {status, progress, chunks_done, chunks_total, error}

VALIDATION_TTL = 30 * 60   # 30 min
REQUIRED_COLUMNS = {
    "Book Name", "Book Code", "Book #", "Book ID",
    "Chapter Name", "Chapter Code", "Chapter #", "Chapter ID",
    "Chunk Number", "Chunk ID", "Chunk Title", "Chunk Content",
    "Meta tags", "Framework", "Token Count", "Intent", "Primary Emotion",
}

EMBEDDING_MODEL = config.TAMMY_EMB_MODEL  # text-embedding-3-small → 1536 dims
EXPECTED_DIMS   = 1536
BATCH_SIZE      = 100


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_vector_id(row) -> str:
    """BK01||CH01||BK01-CH01-01 (zero-padded 2-digit chunk)"""
    book_code    = str(row.get("Book Code",    "BK00")).strip()
    chapter_code = str(row.get("Chapter Code", "CH00")).strip()
    book_id      = str(row.get("Book ID",      "BK00")).strip()
    chapter_id   = str(row.get("Chapter ID",   "CH00")).strip()
    chunk_num    = int(row.get("Chunk Number", 1))
    return f"{book_code}||{chapter_code}||{book_id}-{chapter_id}-{chunk_num:02d}"


def _parse_meta_tags(raw) -> list:
    if not raw or (isinstance(raw, float)):
        return []
    s = str(raw).strip()
    if s.startswith("["):
        try:
            return json.loads(s)
        except Exception:
            pass
    return [t.strip() for t in s.split(",") if t.strip()]


def _get_pinecone_index():
    from backend.db.pinecone_manager import pinecone_manager
    if not pinecone_manager.available:
        raise HTTPException(503, "Pinecone not available")
    return pinecone_manager.rag_index


def _get_openai_client():
    from openai import OpenAI
    return OpenAI(api_key=config.OPENAI_API_KEY)


def _get_db():
    from backend.db.mongodb_client import _mongodb_client
    return _mongodb_client._db   # may be None


def _batches(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


# ── Step 1: Validate ──────────────────────────────────────────────────────────

@router.post("/validate", dependencies=[Depends(require_admin)])
async def validate_upload(file: UploadFile = File(...)):
    filename = file.filename or ""
    content  = await file.read()

    # Parse file
    try:
        if filename.lower().endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
        elif filename.lower().endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            raise HTTPException(400, "Only .csv and .xlsx files are supported")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Could not parse file: {e}")

    # Check columns
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise HTTPException(400, {"error": "Missing columns", "missing": sorted(missing)})

    # Build IDs + metadata rows
    rows = []
    for _, r in df.iterrows():
        vid = _build_vector_id(r)
        rows.append({
            "id":              vid,
            "book_id":         str(r.get("Book ID",       "")).strip(),
            "book_name":       str(r.get("Book Name",     "")).strip(),
            "chapter_id":      str(r.get("Chapter ID",    "")).strip(),
            "chapter_name":    str(r.get("Chapter Name",  "")).strip(),
            "chunk_content":   str(r.get("Chunk Content", "")).strip(),
            "doc_id":          vid,
            "framework":       str(r.get("Framework",     "")).strip(),
            "intent":          str(r.get("Intent",        "")).strip(),
            "meta_tags":       _parse_meta_tags(r.get("Meta tags")),
            "primary_emotion": str(r.get("Primary Emotion", "")).strip(),
            "token_count":     int(r.get("Token Count", 0) or 0),
        })

    all_ids = [row["id"] for row in rows]

    # Check which IDs already exist in Pinecone
    existing_ids = []
    try:
        index = _get_pinecone_index()
        for batch in _batches(all_ids, BATCH_SIZE):
            result = index.fetch(ids=batch, namespace=config.TAMMY_NAMESPACE)
            existing_ids.extend(list(result.vectors.keys()))
    except Exception as e:
        logger.warning(f"Pinecone fetch check failed: {e}")

    existing_set = set(existing_ids)
    new_chunks      = sum(1 for r in rows if r["id"] not in existing_set)
    existing_chunks = sum(1 for r in rows if r["id"] in existing_set)
    books_detected  = list({r["book_id"] for r in rows})

    # Estimated cost: $0.02 / 1M tokens; each embedding call ≈ chunk_content tokens
    total_tokens    = sum(r["token_count"] for r in rows if r["id"] not in existing_set)
    est_cost        = round(total_tokens / 1_000_000 * 0.02, 6)
    est_writes      = new_chunks  # default skip strategy

    validation_id = str(uuid.uuid4())
    _validation_cache[validation_id] = {
        "rows":       rows,
        "filename":   filename,
        "expires_at": time.time() + VALIDATION_TTL,
    }

    preview = [{
        "id":      r["id"],
        "book":    r["book_name"],
        "chapter": r["chapter_name"],
        "content": r["chunk_content"][:120] + ("…" if len(r["chunk_content"]) > 120 else ""),
    } for r in rows[:5]]

    return {
        "validation_id": validation_id,
        "summary": {
            "total_rows":       len(rows),
            "new_chunks":       new_chunks,
            "existing_chunks":  existing_chunks,
            "books_detected":   books_detected,
            "estimated_cost_usd": est_cost,
            "estimated_writes": est_writes,
        },
        "existing_ids":  existing_ids[:50],
        "preview_rows":  preview,
    }


# ── Step 3: Upsert ────────────────────────────────────────────────────────────

class UpsertBody(BaseModel):
    validation_id:     str
    conflict_strategy: str = "skip"   # "skip" or "overwrite"


@router.post("/upsert", dependencies=[Depends(require_admin)])
async def upsert_upload(
    body:       UpsertBody,
    background: BackgroundTasks,
    admin:      str = Depends(require_admin),
):
    cached = _validation_cache.get(body.validation_id)
    if not cached or cached["expires_at"] < time.time():
        raise HTTPException(400, "Validation expired or not found — re-upload the file")

    job_id = str(uuid.uuid4())
    _job_store[job_id] = {
        "status":       "running",
        "progress":     0,
        "chunks_done":  0,
        "chunks_total": 0,
        "error":        None,
        "filename":     cached["filename"],
    }

    rows     = cached["rows"]
    filename = cached["filename"]
    del _validation_cache[body.validation_id]   # one-time use

    background.add_task(
        _run_upsert, job_id, rows, filename, body.conflict_strategy, admin
    )
    return {"job_id": job_id}


def _run_upsert(job_id: str, rows: list, filename: str, strategy: str, admin: str):
    try:
        index  = _get_pinecone_index()
        client = _get_openai_client()
        ns     = config.TAMMY_NAMESPACE

        # Filter based on strategy
        if strategy == "skip":
            all_ids = [r["id"] for r in rows]
            existing = set()
            for batch in _batches(all_ids, BATCH_SIZE):
                res = index.fetch(ids=batch, namespace=ns)
                existing.update(res.vectors.keys())
            to_upsert = [r for r in rows if r["id"] not in existing]
        else:
            to_upsert = rows

        total = len(to_upsert)
        _job_store[job_id]["chunks_total"] = total

        if total == 0:
            _job_store[job_id].update({"status": "done", "progress": 100})
            _log_upload(job_id, admin, filename, 0, len(rows) - total, rows)
            return

        # Embed + upsert in batches of 100
        done = 0
        book_ids = list({r["book_id"] for r in to_upsert})

        for batch in _batches(to_upsert, BATCH_SIZE):
            texts = [r["chunk_content"] for r in batch]

            # Embed with exponential back-off
            emb_resp = None
            for attempt in range(5):
                try:
                    emb_resp = client.embeddings.create(
                        model=EMBEDDING_MODEL,
                        input=texts,
                        dimensions=EXPECTED_DIMS,
                    )
                    break
                except Exception as e:
                    if attempt == 4:
                        raise
                    wait = 2 ** attempt
                    logger.warning(f"Embedding rate limit, retrying in {wait}s: {e}")
                    time.sleep(wait)

            vectors = []
            for row, emb in zip(batch, emb_resp.data):
                vec = emb.embedding
                if len(vec) != EXPECTED_DIMS:
                    raise ValueError(f"Unexpected embedding dim {len(vec)}, expected {EXPECTED_DIMS}")
                meta = {k: v for k, v in row.items() if k != "id"}
                vectors.append({"id": row["id"], "values": vec, "metadata": meta})

            index.upsert(vectors=vectors, namespace=ns)
            done += len(batch)
            _job_store[job_id]["chunks_done"] = done
            _job_store[job_id]["progress"] = int(done / total * 100)

        _job_store[job_id].update({"status": "done", "progress": 100})
        _log_upload(job_id, admin, filename, done, len(rows) - done, rows, book_ids)
        logger.info(f"✅ RAG upsert job {job_id}: {done} vectors upserted")

    except Exception as e:
        _job_store[job_id].update({"status": "error", "error": str(e)})
        logger.error(f"RAG upsert job {job_id} failed: {e}")


def _log_upload(job_id, admin, filename, uploaded, skipped, rows, book_ids=None):
    try:
        db = _get_db()
        if db is None:
            return
        db["rag_uploads"].insert_one({
            "job_id":          job_id,
            "uploaded_by":     admin,
            "filename":        filename,
            "total_rows":      len(rows),
            "chunks_uploaded": uploaded,
            "chunks_skipped":  skipped,
            "book_ids":        book_ids or [],
            "status":          "done",
            "created_at":      datetime.datetime.utcnow(),
        })
    except Exception as e:
        logger.warning(f"Upload log failed: {e}")


# ── Job status ────────────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}", dependencies=[Depends(require_admin)])
async def get_job(job_id: str):
    job = _job_store.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


# ── Utility: stats + history ──────────────────────────────────────────────────

@router.get("/stats", dependencies=[Depends(require_admin)])
async def rag_stats():
    import time as _time
    # In-memory cache (60s TTL) — Pinecone stats are expensive
    if hasattr(rag_stats, "_cache") and (_time.time() - rag_stats._cache[0]) < 60:
        return rag_stats._cache[1]
    try:
        index = _get_pinecone_index()
        stats = index.describe_index_stats()
        ns_map = stats.namespaces or {}

        books = []
        try:
            # Large sample (top_k=10000) to discover all book names
            sample = index.query(
                vector=[0.0] * EXPECTED_DIMS,
                top_k=10000,
                namespace=config.TAMMY_NAMESPACE,
                include_metadata=True,
            )
            book_chunks: dict = {}
            for match in sample.matches:
                meta = match.metadata or {}
                bid  = meta.get("book_id", "unknown")
                bname = meta.get("book_name", bid)
                key = (bid, bname)
                book_chunks[key] = book_chunks.get(key, 0) + 1
            # Estimate total chunks per book from the sample ratio
            total_ns = ns_map.get(config.TAMMY_NAMESPACE)
            total_vectors = total_ns.vector_count if total_ns and hasattr(total_ns, "vector_count") else stats.total_vector_count
            sample_size = len(sample.matches) or 1
            books = [{"book_id": k[0], "book_name": k[1],
                       "chunk_count": max(v, int(v * total_vectors / sample_size))}
                     for k, v in sorted(book_chunks.items())]
        except Exception:
            pass

        result = {
            "total_vectors": stats.total_vector_count,
            "namespaces":    list(ns_map.keys()),
            "books":         books,
        }
        rag_stats._cache = (_time.time(), result)
        return result
    except Exception as e:
        raise HTTPException(500, f"Pinecone stats error: {e}")


@router.get("/history", dependencies=[Depends(require_admin)])
async def upload_history():
    db = _get_db()
    if db is None:
        return []
    docs = list(db["rag_uploads"].find({}).sort("created_at", -1).limit(50))
    for d in docs:
        d["_id"] = str(d["_id"])
        if "created_at" in d and hasattr(d["created_at"], "isoformat"):
            d["created_at"] = d["created_at"].isoformat()
    return docs


# ── Preview: fetch real chunks for a book ────────────────────────────────────

@router.get("/books/{book_id}/preview", dependencies=[Depends(require_admin)])
async def preview_book(book_id: str, limit: int = 30):
    """
    Return up to `limit` real chunks from Pinecone for a given book_id.
    Uses a zero-vector query filtered by book_id metadata.
    """
    try:
        index = _get_pinecone_index()
        ns = config.TAMMY_NAMESPACE

        result = index.query(
            vector=[0.0] * EXPECTED_DIMS,
            top_k=min(limit, 100),
            namespace=ns,
            include_metadata=True,
            filter={"book_id": {"$eq": book_id}},
        )

        chunks = []
        for m in result.matches:
            meta = m.metadata or {}
            chunks.append({
                "id":              m.id,
                "book_id":         meta.get("book_id", book_id),
                "book_name":       meta.get("book_name", ""),
                "chapter_id":      meta.get("chapter_id", ""),
                "chapter_name":    meta.get("chapter_name", ""),
                "chunk_content":   meta.get("chunk_content", ""),
                "framework":       meta.get("framework", ""),
                "intent":          meta.get("intent", ""),
                "primary_emotion": meta.get("primary_emotion", ""),
                "token_count":     meta.get("token_count", 0),
                "meta_tags":       meta.get("meta_tags", []),
                "score":           round(m.score, 4) if hasattr(m, "score") else None,
            })

        # Sort by chapter then by chunk id for readable order
        chunks.sort(key=lambda c: (c["chapter_id"], c["id"]))

        return {
            "book_id":   book_id,
            "book_name": chunks[0]["book_name"] if chunks else book_id,
            "count":     len(chunks),
            "chunks":    chunks,
        }

    except Exception as e:
        logger.error(f"Preview book {book_id} error: {e}")
        raise HTTPException(500, f"Preview failed: {e}")


# ── Re-index: re-embed all chunks for a book ──────────────────────────────────

@router.post("/books/{book_id}/reindex", dependencies=[Depends(require_admin)])
async def reindex_book(
    book_id: str,
    background: BackgroundTasks,
    admin: str = Depends(require_admin),
):
    """
    Fetch all vectors for book_id, re-embed with the current model, and upsert back.
    Returns a job_id to poll /admin/rag/jobs/{job_id}.
    """
    try:
        index = _get_pinecone_index()
        ns = config.TAMMY_NAMESPACE

        # Fetch all chunks for this book via repeated queries
        all_chunks = []
        seen_ids = set()
        cursor = None

        # Use query with filter to get all chunks (Pinecone doesn't have list-by-filter,
        # so we paginate with repeated zero-vector queries)
        for _ in range(20):  # max 20 pages × 100 = 2000 chunks
            q_args = dict(
                vector=[0.0] * EXPECTED_DIMS,
                top_k=100,
                namespace=ns,
                include_metadata=True,
                filter={"book_id": {"$eq": book_id}},
            )
            result = index.query(**q_args)
            new_hits = [m for m in result.matches if m.id not in seen_ids]
            if not new_hits:
                break
            for m in new_hits:
                seen_ids.add(m.id)
                meta = m.metadata or {}
                all_chunks.append({
                    "id":            m.id,
                    "chunk_content": meta.get("chunk_content", ""),
                    **{k: v for k, v in meta.items()},
                })

        if not all_chunks:
            raise HTTPException(404, f"No chunks found for book_id '{book_id}'")

        job_id = str(uuid.uuid4())
        _job_store[job_id] = {
            "status":       "running",
            "progress":     0,
            "chunks_done":  0,
            "chunks_total": len(all_chunks),
            "error":        None,
            "book_id":      book_id,
            "type":         "reindex",
        }

        background.add_task(_run_reindex, job_id, all_chunks, ns, admin, book_id)
        return {"job_id": job_id, "chunks_total": len(all_chunks)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reindex book {book_id} failed to start: {e}")
        raise HTTPException(500, f"Reindex failed: {e}")


def _run_reindex(job_id: str, rows: list, ns: str, admin: str, book_id: str):
    """Background: re-embed rows and upsert back to Pinecone."""
    try:
        index  = _get_pinecone_index()
        client = _get_openai_client()
        total  = len(rows)
        done   = 0

        for batch in _batches(rows, BATCH_SIZE):
            texts = [r.get("chunk_content", "") for r in batch]

            emb_resp = None
            for attempt in range(5):
                try:
                    emb_resp = client.embeddings.create(
                        model=EMBEDDING_MODEL,
                        input=texts,
                        dimensions=EXPECTED_DIMS,
                    )
                    break
                except Exception as e:
                    if attempt == 4:
                        raise
                    wait = 2 ** attempt
                    logger.warning(f"Re-index embedding retry {attempt+1}: {e}")
                    time.sleep(wait)

            vectors = []
            for row, emb in zip(batch, emb_resp.data):
                vec = emb.embedding
                meta = {k: v for k, v in row.items() if k != "id"}
                vectors.append({"id": row["id"], "values": vec, "metadata": meta})

            index.upsert(vectors=vectors, namespace=ns)
            done += len(batch)
            _job_store[job_id]["chunks_done"] = done
            _job_store[job_id]["progress"] = int(done / total * 100)

        _job_store[job_id].update({"status": "done", "progress": 100})
        logger.info(f"✅ Re-index job {job_id} done: {done} vectors for book {book_id}")

    except Exception as e:
        _job_store[job_id].update({"status": "error", "error": str(e)})
        logger.error(f"Re-index job {job_id} failed: {e}")

