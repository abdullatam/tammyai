# pinecone_memory_store.py

import os
import hashlib
from typing import List
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI

# -----------------------------------------------------------
# Setup: Pinecone + OpenAI Clients
# -----------------------------------------------------------
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = os.getenv("TAMMY_MEMORY_INDEX", "tammy-memories")
index = pc.Index(index_name)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# -----------------------------------------------------------
# Error Handling Decorator
# -----------------------------------------------------------
def handle_pinecone_errors(default=None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                print(f"❌ Pinecone error in {func.__name__}:", e)
                return default
        return wrapper
    return decorator

# -----------------------------------------------------------
# Utility: Stable Memory ID Generator
# -----------------------------------------------------------
def make_id(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest()

# -----------------------------------------------------------
# UPSERT MEMORIES (Safe with decorator)
# -----------------------------------------------------------
@handle_pinecone_errors()
def upsert_memories(user_id: str, memory_texts: List[str]):
    """
    Insert semantic memories into Pinecone.
    Cleans None values and produces embeddings safely.
    """
    if not memory_texts:
        print("⚠️ No memory texts to store.")
        return

    clean_texts = [t.strip() for t in memory_texts if t and isinstance(t, str) and t.strip()]
    if not clean_texts:
        print("⚠️ No valid text after cleaning.")
        return

    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=clean_texts
    )

    vectors = []
    for text, emb in zip(clean_texts, response.data):
        vectors.append({
            "id": make_id(text),
            "values": emb.embedding,
            "metadata": {
                "user_id": user_id,
                "text": text,
            }
        })

    index.upsert(vectors=vectors)
    print("✅ Semantic memories saved to Pinecone")

# -----------------------------------------------------------
# QUERY MEMORIES (Safe with decorator)
# -----------------------------------------------------------
@handle_pinecone_errors(default=[])
def query_memories(user_id: str, query: str, k: int = 5) -> List[str]:
    """
    Retrieves relevant semantic memories from Pinecone.
    """
    emb = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    )

    result = index.query(
        vector=emb.data[0].embedding,
        top_k=k,
        include_metadata=True,
        filter={"user_id": user_id}
    )

    if not result.matches:
        return []

    snippets = [m.metadata.get("text", "") for m in result.matches]
    return [s for s in snippets if s]
