# pinecone_manager.py
"""
Tammy V2 — Resilient Pinecone manager for RAG and semantic memory.

NAMESPACE STRATEGY:
  - tammy-memories: each user's vectors stored in namespace = user_id
    so namespace='123' for all of user 123's memories.
  - tammy-books: RAG docs stored in config.TAMMY_NAMESPACE
"""

import hashlib
import time
from datetime import datetime
from typing import List, Optional, Dict, Any
from pinecone import Pinecone
from openai import OpenAI

from backend.config import config
from backend.logger import get_logger

logger = get_logger(__name__)


class PineconeManager:
    _instance: Optional["PineconeManager"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        logger.info("Initializing Pinecone Manager...")
        self.pc = None
        self.rag_index = None
        self.memory_index = None
        self.openai_client = None

        try:
            self.pc = Pinecone(api_key=config.PINECONE_API_KEY)
            self.rag_index = self.pc.Index(config.TAMMY_INDEX_NAME)
            self.memory_index = self.pc.Index(config.TAMMY_MEMORY_INDEX)
            logger.info(f"✅ Pinecone connected: {config.TAMMY_INDEX_NAME} + {config.TAMMY_MEMORY_INDEX}")
        except Exception as e:
            logger.warning(f"⚠️ Pinecone unavailable: {e}. RAG/semantic memory disabled.")
            self.pc = None
            self.rag_index = None
            self.memory_index = None

        try:
            self.openai_client = OpenAI(api_key=config.OPENAI_API_KEY)
        except Exception as e:
            logger.warning(f"⚠️ OpenAI client init failed: {e}")
            self.openai_client = None

        self._initialized = True
        logger.info("✅ Pinecone Manager ready")

    @property
    def available(self) -> bool:
        return self.rag_index is not None and self.memory_index is not None

    def _embed(self, text: str) -> List[float]:
        if not self.openai_client:
            return []
        try:
            resp = self.openai_client.embeddings.create(
                model=config.TAMMY_EMB_MODEL,
                input=[text]
            )
            return resp.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding failed: {e}")
            return []

    def query_memories(self, user_id: str, query: str, k: int = None, use_user_namespace: bool = False) -> List[Dict[str, Any]]:
        if not user_id:
            raise ValueError("user_id required")
        """
        Query semantic memories for a user.

        Strategy: query namespace=user_id (where V2 stores memories).
        Also fall back to default namespace with metadata filter for legacy vectors.
        """
        if not self.available:
            return []
        k = k or config.SEMANTIC_MEMORY_K
        try:
            vec = self._embed(query)
            if not vec:
                return []

            results = []

            # Query the central memory namespace filtering by user_id
            try:
                namespace = user_id if use_user_namespace else config.TAMMY_MEMORY_INDEX
                r = self.memory_index.query(
                    vector=vec,
                    top_k=k,
                    include_metadata=True,
                    namespace=namespace,
                    filter={"user_id": user_id},
                )
                for m in r.matches:
                    text = m.metadata.get("text", "")
                    if text and m.score > 0.2:
                        ts = m.metadata.get("timestamp")
                        results.append({"text": text, "timestamp": ts})
                logger.info(f"[Pinecone] user='{user_id}': {len(r.matches)} hits, {len(results)} above threshold")
            except Exception as e:
                logger.error(f"Pinecone query failed: {e}")

            return results[:k]

        except Exception as e:
            logger.error(f"Memory query failed: {e}")
            return []

    def query_rag(self, query: str, k: int = None) -> List[str]:
        """Query the knowledge base (RAG) index."""
        if not self.available:
            return []
        k = k or config.RAG_TOP_K
        try:
            vec = self._embed(query)
            if not vec:
                return []
            result = self.rag_index.query(
                vector=vec,
                top_k=k,
                include_metadata=True,
                namespace=config.TAMMY_NAMESPACE,
            )
            docs = []
            for m in result.matches:
                text = m.metadata.get("chunk_content") or m.metadata.get("text", "")
                if text:
                    docs.append(text)
            return docs
        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            return []

    def upsert_memories(self, user_id: str, texts: List[str]) -> bool:
        """
        Store user memory vectors in namespace=user_id.
        Uses user_id as both namespace and metadata field for maximum retrievability.
        """
        if not user_id:
            raise ValueError("user_id required")
        if not self.available:
            return False
        if not texts:
            return True
        try:
            vectors = []
            for text in texts:
                embedding = self._embed(text)
                if embedding:
                    vid = hashlib.sha1(f"{user_id}:{text}".encode()).hexdigest()
                    vectors.append({
                        "id": vid,
                        "values": embedding,
                        "metadata": {
                            "user_id": user_id,
                            "text": text,
                            "type": "memory",
                            "timestamp": time.time(),
                            "date_stored": datetime.utcnow().strftime("%Y-%m-%d"),
                        }
                    })
            if vectors:
                # Store in central memory namespace
                self.memory_index.upsert(vectors=vectors, namespace=config.TAMMY_MEMORY_INDEX)
                logger.info(f"✅ Upserted {len(vectors)} memories for user {user_id} in namespace='{config.TAMMY_MEMORY_INDEX}'")
            return True
        except Exception as e:
            logger.error(f"Memory upsert failed: {e}")
            return False

    def upsert_user_knowledge(self, user_id: str, texts: List[str]) -> bool:
        if not user_id:
            raise ValueError("user_id required")
        if not self.available:
            return False
        if not texts:
            return True
        try:
            vectors = []
            for text in texts:
                embedding = self._embed(text)
                if embedding:
                    vid = hashlib.sha1(f"{user_id}:{text}".encode()).hexdigest()
                    vectors.append({
                        "id": vid,
                        "values": embedding,
                        "metadata": {
                            "user_id": user_id,
                            "text": text,
                            "type": "knowledge",
                            "category": "user_knowledge",
                            "timestamp": time.time(),
                            "date_stored": datetime.utcnow().strftime("%Y-%m-%d"),
                        }
                    })
            if vectors:
                self.memory_index.upsert(vectors=vectors, namespace=config.TAMMY_MEMORY_INDEX)
                logger.info(f"✅ Upserted {len(vectors)} user_knowledge chunks for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"User knowledge upsert failed: {e}")
            return False

    def query_user_knowledge(self, user_id: str, query: str, k: int = 5) -> List[str]:
        if not self.available:
            return []
        try:
            vec = self._embed(query)
            if not vec:
                return []

            r = self.memory_index.query(
                vector=vec,
                top_k=k,
                include_metadata=True,
                namespace=config.TAMMY_MEMORY_INDEX,
                filter={"user_id": user_id, "category": "user_knowledge"},
            )
            docs = []
            for m in r.matches:
                text = m.metadata.get("text", "")
                if text and m.score > 0.2:
                    docs.append(text)
            return docs
        except Exception as e:
            logger.error(f"User knowledge query failed: {e}")
            return []


    def get_all_memories(self, user_id: str) -> list:
        if not self.available:
            return []
        try:
            # Use a dummy zero vector for pure metadata-based retrieval (1536 dims for text-embedding-3-small)
            vec = [0.0] * 1536
            r = self.memory_index.query(
                vector=vec,
                top_k=1000,
                include_metadata=True,
                namespace=config.TAMMY_MEMORY_INDEX,
                filter={"user_id": user_id, "type": "memory"}
            )
            docs = []
            for m in r.matches:
                docs.append({
                    "id": m.id,
                    "text": m.metadata.get("text", ""),
                    "timestamp": m.metadata.get("timestamp")
                })
            return docs
        except Exception as e:
            logger.error(f"Failed to list all memories: {e}")
            return []

    def add_memory(self, user_id: str, text: str) -> dict:
        if not self.available or not text:
            return None
        import uuid, time
        vid = str(uuid.uuid4())
        emb = self._embed(text)
        if not emb: return None
        self.memory_index.upsert(vectors=[{
            "id": vid,
            "values": emb,
            "metadata": {
                "user_id": user_id,
                "text": text,
                "type": "memory",
                "timestamp": time.time(),
            }
        }], namespace=config.TAMMY_MEMORY_INDEX)
        return {"id": vid, "text": text}

    def update_memory(self, user_id: str, memory_id: str, text: str) -> bool:
        if not self.available or not text:
            return False
        import time
        emb = self._embed(text)
        if not emb: return False
        self.memory_index.upsert(vectors=[{
            "id": memory_id,
            "values": emb,
            "metadata": {
                "user_id": user_id,
                "text": text,
                "type": "memory",
                "timestamp": time.time(),
            }
        }], namespace=config.TAMMY_MEMORY_INDEX)
        return True

    def get_user_knowledge_list(self, user_id: str) -> List[Dict]:
        if not self.available:
            return []
        try:
            # Generic query to fetch list using a zero vector
            vec = [0.0] * 1536
            r = self.memory_index.query(
                vector=vec,
                top_k=100,
                include_metadata=True,
                namespace=config.TAMMY_MEMORY_INDEX,
                filter={"user_id": user_id, "category": "user_knowledge"},
            )
            docs = []
            for m in r.matches:
                docs.append({
                    "id": m.id,
                    "text_preview": m.metadata.get("text", "")[:100] + "...",
                    "date_stored": m.metadata.get("date_stored", "")
                })
            return docs
        except Exception as e:
            logger.error(f"Failed to list user knowledge: {e}")
            return []

    def delete_user_knowledge(self, user_id: str, doc_id: str) -> bool:
        if not user_id:
            raise ValueError("user_id required")
        if not self.available:
            return False
        try:
            self.memory_index.delete(ids=[doc_id], namespace=config.TAMMY_MEMORY_INDEX)
            logger.info(f"Deleted user knowledge {doc_id} for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete user knowledge: {e}")
            return False

    def health_check(self) -> dict:
        if not self.available:
            return {"available": False}
        try:
            stats = self.memory_index.describe_index_stats()
            ns = stats.get("namespaces", {})
            return {
                "available": True,
                "namespaces": list(ns.keys()),
                "total_vectors": stats.get("total_vector_count", 0),
            }
        except Exception:
            return {"available": True, "stats_error": True}


pinecone_manager = PineconeManager()

__all__ = ["pinecone_manager", "PineconeManager"]
