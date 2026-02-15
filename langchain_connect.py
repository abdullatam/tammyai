# langchain_connect.py
"""
LangChain components with Pinecone vectorstore and OpenAI LLM.
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

from config import config
from logger import get_logger
from pinecone_manager import pinecone_manager

logger = get_logger(__name__)

# ============================================
# LANGCHAIN COMPONENTS
# ============================================

# LLM
llm = ChatOpenAI(
    model=config.TAMMY_CHAT_MODEL,
    temperature=config.TAMMY_TEMPERATURE,
    api_key=config.OPENAI_API_KEY
)

# Embeddings
embeddings = OpenAIEmbeddings(
    model=config.TAMMY_EMB_MODEL,
    api_key=config.OPENAI_API_KEY
)

# Vectorstore wrapper using the unified pinecone_manager
vectorstore = PineconeVectorStore(
    index=pinecone_manager.rag_index,
    namespace=config.TAMMY_NAMESPACE,
    embedding=embeddings,
    text_key="chunk_content",
)

logger.info("✅ LangChain components initialized")


def get_retriever():
    """
    Get LangChain retriever for RAG documents.
    
    Returns:
        Configured retriever instance
    """
    return vectorstore.as_retriever(
        search_kwargs={
            "k": config.RAG_TOP_K,
            "fetch_k": config.RAG_FETCH_K
        }
    )


def get_llm():
    """
    Get LangChain LLM instance.
    
    Returns:
        Configured ChatOpenAI instance
    """
    return llm


__all__ = ["get_retriever", "get_llm", "llm", "embeddings", "vectorstore"]
