# pinecone_manager.py
"""
Unified Pinecone client manager.
Handles both RAG (books/documents) and semantic memory operations.
"""

import hashlib
from typing import List, Optional
from pinecone import Pinecone
from openai import OpenAI

from config import config
from logger import get_logger
from constants import ERROR_EMPTY_MEMORY

logger = get_logger(__name__)


class PineconeManager:
    """
    Singleton manager for all Pinecone operations.
    Handles both RAG index and memory index.
    """
    
    _instance: Optional['PineconeManager'] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize Pinecone clients (only once)."""
        if self._initialized:
            return
        
        logger.info("Initializing Pinecone Manager...")
        
        # Initialize Pinecone client
        self.pc = Pinecone(api_key=config.PINECONE_API_KEY)
        
        # RAG Index (for books/documents)
        self.rag_index = self.pc.Index(config.TAMMY_INDEX_NAME)
        logger.info(f"✅ Connected to RAG index: {config.TAMMY_INDEX_NAME}")
        
        # Memory Index (for semantic memories)
        self.memory_index = self.pc.Index(config.TAMMY_MEMORY_INDEX)
        logger.info(f"✅ Connected to Memory index: {config.TAMMY_MEMORY_INDEX}")
        
        # OpenAI client for embeddings
        self.openai_client = OpenAI(api_key=config.OPENAI_API_KEY)
        
        self._initialized = True
        logger.info("✅ Pinecone Manager initialized successfully")
    
    # ============================================
    # EMBEDDING GENERATION
    # ============================================
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of text strings to embed
        
        Returns:
            List of embedding vectors
        """
        if not texts:
            return []
        
        try:
            response = self.openai_client.embeddings.create(
                model=config.TAMMY_EMB_MODEL,
                input=texts
            )
            return [emb.embedding for emb in response.data]
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text string to embed
        
        Returns:
            Embedding vector
        """
        embeddings = self.generate_embeddings([text])
        return embeddings[0] if embeddings else []
    
    # ============================================
    # SEMANTIC MEMORY OPERATIONS
    # ============================================
    
    @staticmethod
    def make_memory_id(text: str) -> str:
        """Generate a stable ID for a memory text."""
        return hashlib.sha1(text.encode("utf-8")).hexdigest()
    
    def upsert_memories(
        self,
        user_id: str,
        memory_texts: List[str],
        namespace: Optional[str] = None
    ) -> bool:
        """
        Insert semantic memories into Pinecone memory index.
        
        Args:
            user_id: User identifier
            memory_texts: List of memory text strings
            namespace: Optional namespace (defaults to user_id)
        
        Returns:
            True if successful, False otherwise
        """
        if not memory_texts:
            logger.warning(ERROR_EMPTY_MEMORY)
            return False
        
        # Clean texts
        clean_texts = [
            t.strip() for t in memory_texts 
            if t and isinstance(t, str) and t.strip()
        ]
        
        if not clean_texts:
            logger.warning("No valid texts after cleaning")
            return False
        
        try:
            # Generate embeddings
            embeddings = self.generate_embeddings(clean_texts)
            
            # Create vectors with metadata
            vectors = []
            for text, embedding in zip(clean_texts, embeddings):
                vectors.append({
                    "id": self.make_memory_id(text),
                    "values": embedding,
                    "metadata": {
                        "user_id": user_id,
                        "text": text,
                    }
                })
            
            # Upsert to Pinecone
            namespace = namespace or user_id
            self.memory_index.upsert(vectors=vectors, namespace=namespace)
            
            logger.info(f"✅ Upserted {len(vectors)} memories for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upsert memories: {e}")
            return False
    
    def query_memories(
        self,
        user_id: str,
        query: str,
        k: Optional[int] = None,
        namespace: Optional[str] = None
    ) -> List[str]:
        """
        Query semantic memories from Pinecone.
        
        Args:
            user_id: User identifier
            query: Query text
            k: Number of results (defaults to config.SEMANTIC_MEMORY_K)
            namespace: Optional namespace (defaults to user_id)
        
        Returns:
            List of relevant memory text strings
        """
        if not query:
            return []
        
        k = k or config.SEMANTIC_MEMORY_K
        namespace = namespace or user_id
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Query Pinecone
            result = self.memory_index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True,
                filter={"user_id": user_id},
                namespace=namespace
            )
            
            if not result.matches:
                logger.debug(f"No memories found for user {user_id}")
                return []
            
            # Extract text from matches
            snippets = [m.metadata.get("text", "") for m in result.matches]
            snippets = [s for s in snippets if s]
            
            logger.info(f"Retrieved {len(snippets)} memories for user {user_id}")
            return snippets
            
        except Exception as e:
            logger.error(f"Failed to query memories: {e}")
            return []
    
    def delete_user_memories(
        self,
        user_id: str,
        namespace: Optional[str] = None
    ) -> bool:
        """
        Delete all memories for a specific user.
        
        Args:
            user_id: User identifier
            namespace: Optional namespace (defaults to user_id)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            namespace = namespace or user_id
            self.memory_index.delete(
                filter={"user_id": user_id},
                namespace=namespace
            )
            logger.info(f"✅ Deleted all memories for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete memories: {e}")
            return False
    
    # ============================================
    # RAG OPERATIONS
    # ============================================
    
    def query_rag_documents(
        self,
        query: str,
        k: Optional[int] = None,
        namespace: Optional[str] = None
    ) -> List[str]:
        """
        Query RAG documents from Pinecone.
        
        Args:
            query: Query text
            k: Number of results (defaults to config.RAG_TOP_K)
            namespace: Optional namespace (defaults to config.TAMMY_NAMESPACE)
        
        Returns:
            List of relevant document text strings
        """
        if not query:
            return []
        
        k = k or config.RAG_TOP_K
        namespace = namespace or config.TAMMY_NAMESPACE
        
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)
            
            # Query Pinecone
            result = self.rag_index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True,
                namespace=namespace
            )
            
            if not result.matches:
                logger.debug("No RAG documents found")
                return []
            
            # Extract text from matches
            documents = []
            for match in result.matches:
                text = match.metadata.get("chunk_content") or match.metadata.get("text", "")
                if text:
                    documents.append(text)
            
            logger.info(f"Retrieved {len(documents)} RAG documents")
            return documents
            
        except Exception as e:
            logger.error(f"Failed to query RAG documents: {e}")
            return []
    
    # ============================================
    # HEALTH CHECK
    # ============================================
    
    def health_check(self) -> dict:
        """
        Check the health of Pinecone connections.
        
        Returns:
            Dictionary with health status
        """
        status = {
            "rag_index": False,
            "memory_index": False,
            "initialized": self._initialized
        }
        
        try:
            # Check RAG index
            stats = self.rag_index.describe_index_stats()
            status["rag_index"] = True
            status["rag_vectors"] = stats.total_vector_count
        except Exception as e:
            logger.error(f"RAG index health check failed: {e}")
        
        try:
            # Check memory index
            stats = self.memory_index.describe_index_stats()
            status["memory_index"] = True
            status["memory_vectors"] = stats.total_vector_count
        except Exception as e:
            logger.error(f"Memory index health check failed: {e}")
        
        return status


# Singleton instance
pinecone_manager = PineconeManager()

__all__ = ["pinecone_manager", "PineconeManager"]
