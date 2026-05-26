import sys
from backend.config import config
from backend.db.pinecone_manager import pinecone_manager

def main():
    index = pinecone_manager.rag_index
    stats = index.describe_index_stats()
    print("Total vectors:", stats.total_vector_count)
    print("Namespaces:", stats.namespaces)

if __name__ == "__main__":
    main()
