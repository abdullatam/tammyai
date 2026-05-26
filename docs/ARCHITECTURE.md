# Tammy AI Architecture

Tammy is a fast, decoupled real-time AI platform.

## Frontend
- Pure React components loaded via Babel standalone for rapid prototyping.
- Communicates via REST APIs and Server-Sent Events (SSE).

## Backend
- **FastAPI**: Asynchronous web framework.
- **Dependency Injection**: Resolves user authentication across all routes.
- **Event Loop Management**: Heavy blocking operations (Pinecone semantic search, Claude inference) run in threadpools or native async wrappers.

## Storage Layer
- **MongoDB**: Primary document store for user profiles, settings, projects, and active sessions.
- **Pinecone**: Semantic vector store containing dense embeddings of long-term memories.

## AI Layer
- **Anthropic Claude**: Core orchestration LLM due to its superior emotional reasoning and nuanced tone.
- **OpenAI**: Whisper for transcription, TTS for voice synthesis, and `text-embedding-3-small` for semantic indexing.
