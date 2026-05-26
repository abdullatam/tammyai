import sys
import os
from backend.config import config
from backend.db.pinecone_manager import pinecone_manager

def main():
    index = pinecone_manager.rag_index
    try:
        sample = index.query(
            vector=[0.0] * 1536,
            top_k=10000,
            namespace=config.TAMMY_NAMESPACE,
            include_metadata=True,
        )
        book_chunks = {}
        for match in sample.matches:
            meta = match.metadata or {}
            bid  = meta.get("book_id", "unknown")
            bname = meta.get("book_name", bid)
            key = (bid, bname)
            book_chunks[key] = book_chunks.get(key, 0) + 1
        
        print(f"Total matched vectors: {len(sample.matches)}")
        print(f"Books found: {len(book_chunks)}")
        for k, v in book_chunks.items():
            print(f"- {k[1]} ({k[0]}): {v} vectors in sample")
            
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
