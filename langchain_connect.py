# langchain_connect.py
from dotenv import load_dotenv
import os

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone

# Load environment
load_dotenv()

# Keys
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME       = os.getenv("TAMMY_INDEX_NAME", "tammy-books")
NAMESPACE        = os.getenv("TAMMY_NAMESPACE", "tammy-v1")

# Models
EMB_MODEL  = os.getenv("TAMMY_EMB_MODEL",  "text-embedding-3-small")
CHAT_MODEL = os.getenv("TAMMY_CHAT_MODEL", "gpt-4o-mini")

assert OPENAI_API_KEY, "OPENAI_API_KEY missing"
assert PINECONE_API_KEY, "PINECONE_API_KEY missing"

# LLM + Embeddings
llm = ChatOpenAI(model=CHAT_MODEL, temperature=0.2)
embeddings = OpenAIEmbeddings(model=EMB_MODEL)

# Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# Vectorstore wrapper
vectorstore = PineconeVectorStore(
    index=index,
    namespace=NAMESPACE,
    embedding=embeddings,
    text_key="chunk_content",
)

def get_retriever(k=10):
    return vectorstore.as_retriever(search_kwargs={"k": k})

def get_llm():
    return llm
