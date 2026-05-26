# langchain_connect.py
"""
LangChain components with Pinecone vectorstore and OpenAI LLM.
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_anthropic import ChatAnthropic
from langchain_pinecone import PineconeVectorStore

from backend.config import config
from backend.logger import get_logger
from backend.db.pinecone_manager import pinecone_manager

logger = get_logger(__name__)

# ============================================
# LANGCHAIN COMPONENTS
# ============================================

# LLMs
openai_llm = ChatOpenAI(
    model=config.TAMMY_CHAT_MODEL,
    temperature=config.TAMMY_TEMPERATURE,
    api_key=config.OPENAI_API_KEY
)

anthropic_llm = ChatAnthropic(
    model=config.TAMMY_ANTHROPIC_MODEL,
    temperature=config.TAMMY_TEMPERATURE,
    api_key=config.ANTHROPIC_API_KEY
)

# Anthropic is primary, OpenAI is automatic fallback
llm = anthropic_llm.with_fallbacks([openai_llm])

# Embeddings
embeddings = OpenAIEmbeddings(
    model=config.TAMMY_EMB_MODEL,
    api_key=config.OPENAI_API_KEY
)

# Vectorstore wrapper using the unified pinecone_manager
if pinecone_manager.rag_index is not None:
    vectorstore = PineconeVectorStore(
        index=pinecone_manager.rag_index,
        namespace=config.TAMMY_NAMESPACE,
        embedding=embeddings,
        text_key="chunk_content",
    )
    
    def get_retriever():
        """
        Get LangChain retriever for RAG documents.
        Uses similarity_score_threshold to filter out low-relevance book chunks.
        Only chunks with cosine similarity >= 0.75 are returned, preventing
        the psychological/philosophical corpus from contaminating responses
        to messages with only loose thematic overlap.

        Returns:
            Configured retriever instance
        """
        return vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={
                "k": config.RAG_TOP_K,
                "score_threshold": 0.75,
            }
        )
else:
    vectorstore = None
    
    class DummyRetriever:
        def invoke(self, query):
            return []
            
    def get_retriever():
        """
        Get LangChain retriever for RAG documents.
        
        Returns:
            Configured retriever instance
        """
        return DummyRetriever()


def get_llm():
    """
    Get LangChain LLM instance.
    
    Returns:
        Configured ChatOpenAI instance
    """
    return llm


__all__ = ["get_retriever", "get_llm", "llm", "embeddings", "vectorstore"]
