<div align="center">
  <img src="frontend/web/public/tammy_logo.png" alt="Tammy AI Logo" width="120" />
  <h1>Tammy AI Infrastructure</h1>
  <p><strong>The Real-Time, Emotionally Intelligent Co-Founder Architecture</strong></p>

  <p>
    <a href="https://github.com/abdullatam/tammyai/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg" alt="Build Status"></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.100.0-009688.svg?logo=fastapi" alt="FastAPI"></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.0-61DAFB.svg?logo=react" alt="React"></a>
    <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/MongoDB-Active-47A248.svg?logo=mongodb" alt="MongoDB"></a>
    <a href="https://www.anthropic.com/"><img src="https://img.shields.io/badge/Claude-3.5_Sonnet-D97757.svg?logo=anthropic" alt="Claude"></a>
    <a href="https://www.speechmatics.com/"><img src="https://img.shields.io/badge/Speechmatics-RealTime-blue.svg?logo=webrtc" alt="Speechmatics"></a>
  </p>

  <p>
    <em>A masterclass in low-latency AI orchestration, semantic memory persistence, and asynchronous emotional state-machine management.</em>
  </p>
</div>

---

## 🌌 System Architecture

Tammy is a decoupled, event-driven platform designed to simulate fluid, human-like intelligence. The system relies on a heavily optimized FastAPI event loop, parallel worker pipelines, and streaming modalities to achieve sub-1.5 second conversational latency.

```mermaid
graph TD
    Client[Web/Mobile Client] -->|WebSockets/SSE| FastAPI[FastAPI Backend]
    
    subgraph Data Layer
        FastAPI -->|State Management| MongoDB[(MongoDB Atlas)]
        FastAPI -->|Semantic Search| Pinecone[(Pinecone Vector DB)]
        FastAPI -->|Short-term Cache| Redis[(Redis)]
    end
    
    subgraph Orchestration Layer
        FastAPI -->|Inference| Claude[Anthropic Claude 3.5]
        FastAPI -->|Background Tasks| EmotionalEngine[Emotional Thread Manager]
        FastAPI -->|Profiling| DNAEngine[Founder DNA Engine]
    end
    
    subgraph Modalities
        FastAPI -->|Streaming TTS| ElevenLabs[ElevenLabs Turbo 2.5]
        Client -->|Streaming STT| Speechmatics[Speechmatics WebSocket]
    end
```

---

## 🎙️ The Voice Pipeline: Deep Dive

Tammy’s voice architecture is built for **human-level real-time responsiveness**. We bypass traditional monolithic request/response cycles in favor of aggressively overlapped streaming chunks. 

Our target latency (End of user speech to start of AI audio playback) is **~1.0–1.5 seconds**.

### 1. Voice Architecture Overview
The voice system uses a decoupled frontend-backend WebSocket mesh. The client streams raw audio directly to our STT provider, the backend captures the text, injects RAG/Memory context in parallel, streams tokens from Claude Haiku, and pipes those tokens immediately into ElevenLabs chunk streaming.

### 2. Real-Time Streaming Pipeline
```mermaid
sequenceDiagram
    participant User
    participant STT as Speechmatics (STT)
    participant Backend as FastAPI
    participant Pinecone as Pinecone (RAG)
    participant LLM as Claude Haiku
    participant TTS as ElevenLabs (TTS)
    
    User->>STT: Speak (Audio Stream)
    STT-->>Backend: Final Transcript + Lang Detection
    par Parallel Retrieval
        Backend->>Pinecone: Fetch Semantic Memories
        Backend->>Backend: Fetch Emotional State
    end
    Backend->>LLM: Stream Inference (Transcript + Context)
    LLM-->>Backend: Yield Tokens (Chunking)
    Backend->>TTS: Yield Token Chunks
    TTS-->>User: Stream Audio Byte Chunks
    Note over User,TTS: Audio plays while generation is still happening.
```

### 3. STT Layer (Speechmatics)
We utilize **Speechmatics Real-Time WebSockets** for Speech-to-Text because of its superior performance with rapid bilingual switching (Arabic/English) and low-latency chunking.

### 4. LLM Streaming Layer
For voice, we route through **Claude Haiku** (or equivalent ultra-low latency models) instead of Sonnet. The model is specifically prompted to generate conversational, un-bulleted, concise text optimized for human speech.

### 5. Memory Injection Timing
The moment the STT transcript triggers the "End of Utterance" flag, the backend fires an asynchronous `asyncio.gather()` task to fetch Pinecone vectors. This happens in **< 80ms** before the LLM prompt is assembled.

### 6. RAG Parallel Retrieval
If a query requires deep knowledge (e.g., "What did my investor say last week?"), the RAG pipeline fires in parallel to the short-term memory fetch, ensuring zero blocking on the main event loop.

### 7. TTS Chunk Streaming
We utilize **ElevenLabs Turbo v2.5**. Rather than waiting for the LLM to finish its entire response, the backend aggregates LLM tokens until it hits a natural punctuation mark (comma, period), and sends that chunk to ElevenLabs via WebSockets. 

### 8. Audio Playback Engine
The frontend uses the Web Audio API to queue and decode MP3 byte streams the moment they arrive via SSE. This reduces perceived latency to near zero.

### 9. Interrupt Handling
The client maintains a local `isSpeaking` state. If the user begins speaking while Tammy is playing audio, the frontend instantly kills the AudioContext queue and sends an `INTERRUPT` flag to the backend to kill the active generator.

### 10. Silence Detection Optimization
To prevent awkward pauses, the STT layer uses a dynamic silence threshold (VAD). If the user pauses for `0.8s` but the sentence is syntactically incomplete, the system waits. If syntactically complete, it fires immediately.

### 11. Latency Breakdown
| Stage | Tech Stack | Latency Target |
|-------|------------|----------------|
| VAD & End of Speech | Speechmatics | `~300ms` |
| RAG & Context Fetch | Pinecone / Mongo | `~80ms` (Parallel) |
| TTFT (Time to First Token) | Claude Haiku | `~400ms` |
| Text to First Audio Byte | ElevenLabs Turbo | `~300ms` |
| **Total Perceived Latency** | | **~1,080ms** |

### 12. Arabic/English Auto Detection
Speechmatics automatically tags the detected language. Tammy dynamically adjusts her ElevenLabs voice model and LLM prompt to respond in the native tongue of the user seamlessly.

### 13. WebSocket Lifecycle
1. Frontend initializes STT websocket.
2. Frontend opens an SSE connection to FastAPI `/api/voice/stream`.
3. Heartbeats keep the connection alive.
4. On interruption, the SSE channel is aggressively closed and recycled.

### 14. Parallel Worker Architecture
To prevent the FastAPI event loop from starving during heavy audio chunk processing, TTS socket handling is offloaded to a dedicated ThreadPoolExecutor.

### 15. Performance Optimization
- **Redis Caching:** RAG embeddings are cached via LRU in Redis.
- **Connection Pooling:** MongoDB and Pinecone utilize persistent HTTP/TCP pools.

### 16. Failure Recovery
If the SSE stream dies, the frontend falls back to standard HTTP chunked polling. If ElevenLabs rate-limits, we seamlessly fallback to OpenAI TTS `tts-1` model.

### 17. Future Voice Roadmap
- Transitioning to WebRTC for bi-directional audio to shave off 200ms of TCP overhead.
- Integrating native GPT-4o real-time voice APIs once natively available for our specific emotional tone parameters.

---

## ❤️ Emotional Intelligence Engine

Tammy does not view conversations linearly. She views them as **Emotional Threads**.

```mermaid
stateDiagram-v2
    [*] --> Triggered
    Triggered --> Analyzing: Emotion Detected
    Analyzing --> Active: Valence/Arousal Logged
    Active --> Resolved: Conclusion Reached
    Active --> Avoiding: User changes subject
    Avoiding --> TheMirrorMoment: Threshold exceeded
```

### The Mirror Moment
A completely automated, asynchronous cron job evaluates `Avoiding` threads. If avoidance patterns emerge (e.g., dodging questions about runway), Tammy orchestrates a "Hard Truth" summary designed to therapeutically confront the founder.

---

## 🗄️ Database Relationships

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : creates
    USERS ||--o{ MEMORIES : generates
    USERS {
        string _id
        object founder_dna
        string current_project
    }
    SESSIONS {
        string session_id
        object emotional_state
        array messages
    }
    MEMORIES {
        string pinecone_vector_id
        string semantic_text
        float valence
    }
```

---

## 🚀 Getting Started

1. **Clone the repository:** `git clone https://github.com/abdullatam/tammyai.git`
2. **Set up virtual environment:** `python3 -m venv .venv && source .venv/bin/activate`
3. **Configure Environment:** Copy `.env.example` to `.env` and insert your API keys.
4. **Boot Backend:** `./run_tammy.sh` (Starts FastAPI on `http://localhost:7861`)

---

## 🤝 Contributing
Please read our [CONTRIBUTING.md](docs/CONTRIBUTING.md) to understand our architectural principles. PRs should target `develop`.

---
*Tammy AI is proprietary software.*
