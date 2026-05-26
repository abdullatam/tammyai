from pinecone_manager import pinecone_manager
print("Health:", pinecone_manager.health_check())
print("Memories namespace:", pinecone_manager.query_memories("69c190917b89acd9fe122ee7", "pattern", k=5, use_user_namespace=True))
print("Memories default:", pinecone_manager.query_memories("69c190917b89acd9fe122ee7", "pattern", k=5, use_user_namespace=False))
