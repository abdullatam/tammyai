# pinecone_client.py
import os
from dotenv import load_dotenv, find_dotenv
from pinecone import Pinecone

load_dotenv(find_dotenv(), override=True)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY not set in environment.")

# Use your existing index. For you it's "tammy-books".
# You can override with TAMMY_MEMORY_INDEX_NAME if you create another one.
MEMORY_INDEX_NAME = os.getenv("TAMMY_MEMORY_INDEX_NAME", os.getenv("TAMMY_INDEX_NAME", "tammy-books"))

_pc = Pinecone(api_key=PINECONE_API_KEY)
_index = _pc.Index(MEMORY_INDEX_NAME)


def get_memory_index():
    """
    Return the Pinecone index used for Tammy's semantic memory.
    """
    return _index
