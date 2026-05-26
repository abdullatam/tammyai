# Memory Engine

Tammy's memory system is designed to simulate human long-term recall without overloading context windows.

## 1. Extraction Pipeline
Conversations are asynchronously processed to extract discrete "facts" about the user.
- Entities (people, places, companies)
- Emotional triggers
- Preferences and explicit commands

## 2. Embedding
Facts are vectorized using OpenAI `text-embedding-3-small`.

## 3. Retrieval
When a user sends a message, a similarity search is executed against the Pinecone index scoped strictly to their `user_id`. The top N results are retrieved and injected into the system prompt's `[SEMANTIC_MEMORIES]` block.

## Vector Schema
- `id`: Unique hash of the memory text
- `values`: Float array (1536 dims)
- `metadata`:
  - `user_id`: str
  - `timestamp`: int
  - `type`: str (e.g., 'fact', 'preference')
