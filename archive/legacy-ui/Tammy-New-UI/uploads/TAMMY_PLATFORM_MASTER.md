# TAMMY AI — PLATFORM MASTER DOCUMENT
### Architecture · Features · Database Schema · Integration Map
> Version 1.0 — April 2026
> Built by: Tamer Masri · Abdullah Tamimi · Omar
> Status Key: ✅ Built · 🔲 To Build · 🔗 Integration Required

---

## WHAT TAMMY IS

Tammy is a Cultural Operating System — an emotionally intelligent Digital Co-Founder. Not a chatbot. Not a productivity tool. Not a therapist. A sharp friend who tells the truth, tracks your growth across time, connects your emotional patterns to your business performance, and holds you accountable to the commitments you make in conversation.

**The core loop:**
User talks to Tammy → Tammy reads the emotional arc + business context → surfaces what the user can't see themselves → extracts insights, tags decisions, tracks patterns → connects everything to real work via ClickUp → holds the thread across every session, forever.

**What makes Tammy different from every other AI:**
- She remembers. Not just facts — emotional trajectories, contradictions, avoidance patterns.
- She challenges. Response pattern is always Insight → Tension → Question. Never empathy → validation → soft question.
- She connects. Emotional state connected to business performance. Overdue tasks connected to unresolved decisions. Patterns connected to outcomes.
- She speaks. Bilingual Arabic/English, voice-first option, feels like a real conversation.

---

## CURRENT BACKEND — WHAT IS ALREADY BUILT

The intelligence layer is complete. The platform is the build.

```
tammy/
├── tammy_core.py         — V2 Orchestrator (146 lines)
├── tammy_rag.py          — RAG Pipeline + System Prompt V10 (603 lines)
├── server.py             — FastAPI backend, SSE streaming (104 lines)
├── tammy_cli.py          — Terminal CLI, auth, voice flag (269 lines)
├── static/index.html     — Basic web UI, vanilla JS/CSS (517 lines)
├── memory_manager.py     — Unified memory interface (417 lines)
├── memory_router.py      — Query classifier (90 lines)
├── context_builder.py    — Prompt assembler ≤7000 tokens (84 lines)
├── llm_client.py         — Anthropic primary → OpenAI fallback (125 lines)
├── langchain_connect.py  — LangChain wiring (92 lines)
├── pinecone_manager.py   — Semantic memory + RAG (199 lines)
├── redis_client.py       — Redis singleton (85 lines)
├── mongodb_client.py     — MongoDB singleton (91 lines)
├── auth.py               — bcrypt register/login (96 lines)
├── identity.py           — Session identity state (37 lines)
├── save_session.py       — Session persistence (151 lines)
├── voice_input.py        — Speechmatics STT push-to-talk (221 lines)
├── voice_output.py       — OpenAI TTS streaming PCM (103 lines)
├── config.py             — Centralized env config (72 lines)
├── constants.py          — App constants (78 lines)
└── logger.py             — Logging setup (~50 lines)
```

---

## INFRASTRUCTURE

| Service | Provider | Purpose | Status |
|---------|----------|---------|--------|
| Primary LLM | Anthropic Claude Sonnet 4 | Tammy's brain | ✅ |
| Fallback LLM | OpenAI GPT-4o-mini | Automatic fallback | ✅ |
| Embeddings | OpenAI text-embedding-3-small | Semantic search | ✅ |
| Short-term memory | Redis Cloud | Last 6 messages + response cache | ✅ |
| Long-term memory | MongoDB Atlas | Users, sessions, conversations | ✅ |
| Semantic memory | Pinecone (tammy-memories) | 115 records, cosine similarity | ✅ |
| Knowledge base | Pinecone (tammy-books) | 19 books, 2592 records | ✅ |
| STT | Speechmatics Batch API | Arabic + English auto-detect | ✅ |
| TTS | OpenAI tts-1 nova | Streaming PCM output | ✅ |
| ClickUp | OAuth API | Task read/write integration | 🔲 |
| Push notifications | TBD (Firebase recommended) | Mobile + web alerts | 🔲 |
| Email | TBD (SendGrid recommended) | Weekly digests | 🔲 |
| Payments | Stripe | Subscription management | 🔲 |

---

## REQUEST PIPELINE (V2)

Every message Tammy receives goes through this exact sequence:

```
User sends message
        ↓
0. Cache check — Redis MD5 lookup (5 min TTL)
   Hit → return cached response immediately
        ↓
1. Classify query type
   memory / knowledge / planning / general
        ↓
2. Save user message to Redis (short-term)
        ↓
3. Parallel memory fetch (4 workers, ThreadPoolExecutor)
   ├── Redis      → last 6 messages
   ├── MongoDB    → session summaries + user profile
   ├── Pinecone   → semantic memories filtered by user_id
   └── Pinecone   → RAG knowledge from 19 books
        ↓
4. Build context ≤7000 tokens
   Profile + short-term + long-term + semantic + RAG
   + ClickUp task context (when connected) [🔲 to build]
        ↓
5. Stream LLM response token by token
   Anthropic Claude Sonnet 4 → OpenAI fallback
        ↓
6. Persist response
   ├── Save to Redis
   ├── Cache response (5 min)
   ├── Save to MongoDB (conversations + sessions)
   ├── Extract facts via LLM → update MongoDB profile
   ├── Upsert semantic memory to Pinecone
   ├── Tag emotional state → save to session [🔲 to build]
   └── Detect + log decisions [🔲 to build]
```

---

## MEMORY ARCHITECTURE (3-TIER)

### Tier 1 — Short-Term (Redis Cloud)
- Last 6 messages per session
- TTL: 2 hours
- Key: `tammy:chat:{user_id}:{session_id}`
- Response cache TTL: 5 minutes
- Key: `tammy:cache:{md5}`

### Tier 2 — Long-Term (MongoDB Atlas)

Current collections:
- `users` — profiles, goals, bcrypt password hashes
- `sessions` — summaries, timestamps, session metadata
- `conversations` — full message logs
- `user_profile` — V1 legacy rich data

Platform collections to add:
- `integrations` — ClickUp + future OAuth tokens
- `decisions` — tagged decisions extracted from conversations
- `insights` — key moments flagged by Tammy or user
- `milestones` — breakthrough moments on growth timeline
- `emotional_states` — per-session emotional tags
- `blind_spot_reports` — weekly generated reports
- `growth_reports` — monthly generated summaries
- `subscriptions` — plan, status, Stripe data
- `notifications` — scheduled check-ins and alerts

### Tier 3 — Semantic (Pinecone)
- `tammy-memories` index — 115 records, user memories with embeddings, filter by user_id
- `tammy-books` index — 2592 records, 19 book chunks, RAG knowledge retrieval
- Priority: Recent Conversation > Relevant Memories > Past Sessions > Knowledge Base

### Memory Routing Table

| Query Type | Sources Loaded | Triggers |
|-----------|---------------|---------|
| memory | Redis + MongoDB + Pinecone Memory | "remember", "last time", "my name" |
| knowledge | Pinecone RAG books | "how to", "framework", "EGG method" |
| planning | Redis + MongoDB + Pinecone Memory | "plan", "should I", "next step" |
| general | Redis + Pinecone Memory | Everything else |

### Time-Aware Memory Labels
Every memory carries a timestamp converted to human-readable label:
`[today]` · `[yesterday]` · `[3 days ago]` · `[2 weeks ago]` · `[1 month ago]`

Resolution windows auto-expire stale states:
- illness: 14 days
- stress: 7 days
- grief: 90 days
- excitement: 3 days
- decision_pending: 7 days

---

## TAMMY'S INTELLIGENCE LAYER

### System Prompt — V10 (Current Production)
- ~4500 tokens
- Core mandate: Tammy exists to protect the user's growth, not their feelings
- Response architecture: Insight → Tension → Question (never empathy → reflection → soft question)
- Five moves: Name the hidden tension / Reframe the emotion / Introduce the decision edge / Surface the real fear / Precision questions

### Emotional Models Integrated
- GoEmotions (Demszky 2020) — 27 emotion categories, intensity spectrums
- EmotionLines (Chen 2018) — arc tracking, 67% neutral baseline
- ERC Survey (Fu 2023) — PAD 3D model: Arousal × Valence × Dominance
- Arousal calibration: high arousal positive = match energy · low arousal negative = approach slowly

### Voice Identity
- No markdown, no bold, no headers — plain prose always
- Contractions always
- One question per response — never two
- Banned phrases: "Of course", "Absolutely", "Great question", "That's beautiful", "Give yourself permission", "What small step can you take today"

### V11 Prompt — To Build
- Memory hallucination guard — undated memory = background context not recent event
- Fact extraction poisoning guard — trust time label over memory text
- First message discipline — one thread, not full memory dump
- Greeting calibration by gap length
- Response length constraints — 8 sentence ceiling
- Claude anti-patterns list — em-dash overuse, word mirroring, vague "something"
- Permission to be brief — sometimes "Yeah, I see it." is the right move

---

## COMPLETE FEATURE LIST

---

### 01 · CONVERSATION ENGINE

**Text Chat**
- ✅ Terminal CLI streaming — token by token
- ✅ FastAPI web SSE streaming — real-time to browser
- 🔲 Next.js web conversation UI — replace index.html
- 🔲 React Native mobile conversation UI

**Voice**
- ✅ Push-to-talk — hold SPACE on CLI, records via sounddevice 16kHz
- ✅ Speechmatics Batch API — language auto-detection, Arabic + English + any language
- ✅ OpenAI TTS tts-1 nova — streaming PCM chunks via PyAudio
- ✅ Interrupt playback — press SPACE during TTS stops audio immediately
- ✅ Fallback to text — voice failure automatically drops to keyboard input
- ✅ Visual indicators — 🎤 Listening · ⏳ Transcribing · ⏳ Thinking · 🔊 Speaking
- 🔲 Push-to-talk web — hold button in browser UI
- 🔲 Push-to-talk mobile — hold button in React Native
- 🔲 Auto-detect mode option — user toggles in settings
- 🔲 Voice-only mode mobile — no screen needed
- 🔲 Background audio mobile — Tammy keeps speaking when app is backgrounded

**Bilingual**
- ✅ Arabic + English auto-detection — Speechmatics handles mid-conversation switches
- ✅ No hardcoded language — fully dynamic
- 🔲 RTL layout support — Arabic text direction in web and mobile UI

**Resilience**
- ✅ Redis unavailable → continues without short-term memory
- ✅ MongoDB unavailable → continues without long-term memory
- ✅ Pinecone unavailable → continues without semantic memory and RAG
- ✅ Anthropic fails → automatic fallback to OpenAI GPT-4o-mini
- ✅ Both LLMs fail → user-facing error message
- ✅ Voice fails → automatic fallback to text input
- 🔲 ClickUp unavailable → silent fail, conversation continues without task context

**Connection to Architecture:**
Every message enters `tammy_core.py` → classified by `memory_router.py` → context assembled by `context_builder.py` including ClickUp data when connected → streamed via `llm_client.py` → saved across all three memory tiers.

---

### 02 · MEMORY SYSTEM

**Cross-Session Memory**
- ✅ Redis stores last 6 messages per session (2hr TTL)
- ✅ MongoDB stores full conversation logs and session summaries
- ✅ Pinecone stores semantic embeddings, filtered by user_id, cosine similarity
- ✅ Fact extraction — LLM extracts facts after every conversation, upserts to Pinecone

**Time-Aware Memory**
- ✅ Timestamps on every memory
- ✅ Human-readable labels calculated dynamically at retrieval time
- ✅ Resolution windows for stale emotional states

**User Memory Control**
- 🔲 Memory view — user browses what Tammy remembers about them
- 🔲 Memory delete — user removes specific memories (backend exists, needs UI)
- 🔲 Memory correction — user marks a memory as wrong, submits correction
- 🔲 Memory export — user downloads all their stored memories as JSON

**Connection to Architecture:**
`memory_manager.py` is the unified interface for all three tiers. `context_builder.py` assembles memories into ≤7000 token context. `save_session.py` persists to MongoDB + Pinecone. `pinecone_manager.py` handles semantic upserts and queries.

---

### 03 · ONBOARDING

**Conversation Onboarding — No Forms**
- 🔲 First session is a structured conversation — Tammy asks questions, user answers naturally
- 🔲 Captures during onboarding:
  - Name and language preference
  - Current venture — what they're building
  - Current challenge — what they're stuck on
  - Communication style — how direct they want Tammy
  - Emotional baseline — how they're feeling about their work right now
  - Short and long term goals
- 🔲 Language auto-detected from first message — no dropdown
- 🔲 ClickUp connection offered at end of onboarding — "Want me to see your tasks?"
- 🔲 Onboarding flag on user document — `onboarding_complete: bool`
- 🔲 If user skips onboarding questions — Tammy fills profile naturally over first 3-5 sessions

**Connection to Architecture:**
Onboarding data feeds `users` and `user_profile` collections in MongoDB. Gets injected into every subsequent conversation via `context_builder.py`. Venture context always present in Tammy's context from session 2 onward.

---

### 04 · EMOTIONAL INTELLIGENCE

**Emotional Tracking**
- ✅ PAD 3D model in system prompt — Arousal × Valence × Dominance tracked conversationally
- ✅ 27 GoEmotions categories in system prompt
- ✅ Dangerous quiet detection — low arousal negative flagged gently
- ✅ Arc suppression reading — "I'm fine" not taken at face value
- 🔲 Emotional state tag saved per session — `emotional_state` field on `sessions` document
  - Primary emotion (from 27 categories)
  - Arousal level: high / medium / low
  - Valence: positive / negative / neutral
  - Dominance: in control / neutral / overwhelmed
- 🔲 Emotional arc visualization — chart of emotional trajectory over 30/60/90 days
- 🔲 Emotional baseline comparison — onboarding state vs current state, delta surfaced

**Blind Spot Engine**
- ✅ Contradiction surfacing — in system prompt V10
- ✅ Self-sabotage pattern detection — in system prompt V10
- 🔲 Weekly blind spot report — background job runs every Sunday
  - Scans last 30 days of conversations
  - Sends prompt to LLM: "Based on these conversations, identify 2-3 patterns this user keeps circling or avoiding"
  - Saves generated report to `blind_spot_reports` MongoDB collection
  - Displayed in platform + sent as notification
- 🔲 Blind spot report UI — user reads this week's report in platform

**Reflection Tools**
- 🔲 Weekly emotional summary — Tammy generates written reflection every week
- 🔲 Morning intention prompt — optional, user sets preferred time
- 🔲 Evening reflection prompt — optional, user sets preferred time
- 🔲 Check-in frequency — user controls: daily / weekly / let Tammy decide

**Connection to Architecture:**
Emotional tags stored on every `sessions` document → aggregated for arc visualization. Blind spot background job queries `conversations` collection via MongoDB. Reports stored in `blind_spot_reports` collection.

---

### 05 · ENTREPRENEURSHIP LAYER

**Venture Context**
- ✅ User profile exists in MongoDB — partial context stored
- 🔲 Structured venture context fields on user profile:
  - `venture_name: string`
  - `venture_description: string` (one sentence)
  - `stage: enum` — idea / building / launched / scaling
  - `team_size: number`
  - `current_challenge: string`
- 🔲 Venture context injected into every conversation via `context_builder.py`
- 🔲 User updates venture context anytime from profile UI
- 🔲 Tammy connects emotional patterns to business context automatically in conversation

**Decision Tracking**
- 🔲 Decision detection — after every conversation, LLM scan identifies if a major decision was discussed
- 🔲 Decision document created in MongoDB `decisions` collection:
  - `decision_text: string`
  - `context: string`
  - `status: enum` — pending / made / reversed / cancelled
  - `session_id: ref`
  - `created_at: timestamp`
  - `follow_up_at: timestamp` (7 days after creation)
  - `outcome: string` (filled when Tammy follows up)
- 🔲 Decision log UI — user browses all past decisions
- 🔲 Decision follow-up — Tammy checks back 7 days later: "It's been a week, how did that land?"
- 🔲 Decision patterns — cross-decision analysis: "You tend to delay decisions involving people"

**Growth Tracking**
- ✅ Session summaries stored in MongoDB — foundation exists
- ✅ Pinecone semantic backup of all messages — searchable
- 🔲 Milestone moments — user or Tammy flags a conversation moment as breakthrough
  - Stored in `milestones` MongoDB collection
  - Referenced to session and message
- 🔲 Growth timeline UI — chronological visual of milestones and key decisions
- 🔲 Monthly growth report — generated first day of each month
  - LLM scans session summaries + decision log + insights
  - "What shifted this month emotionally and strategically"
  - Stored in `growth_reports` collection
- 🔲 Progress delta — compare emotional baseline at onboarding vs today
  - Tammy surfaces this in conversation: "When you started you described paralysis. In the last 3 weeks you've made 4 decisions without mentioning it."

**Insights Engine**
- ✅ Fact extraction after every conversation — running, stored in Pinecone
- 🔲 Insight classification — distinguish insights from regular facts
  - Regular fact: "User lives in Amman"
  - Insight: "User realizes their avoidance of investor calls is fear of rejection not lack of readiness"
- 🔲 `insights` MongoDB collection:
  - `insight_text: string`
  - `type: enum` — emotional / strategic / pattern / breakthrough
  - `session_id: ref`
  - `flagged_by: enum` — tammy / user
  - `saved: bool`
  - `created_at: timestamp`
- 🔲 Insight feed UI — timeline of most important things Tammy has surfaced
- 🔲 User saves breakthrough moments — flag on conversation message
- 🔲 Insight search — full-text search across all past insights

**Connection to Architecture:**
Venture context flows from MongoDB `users` collection into `context_builder.py`. Decision detection runs as a post-conversation job after `save_session.py`. Insights extracted alongside existing fact extraction in `tammy_core.py` step 6. Growth reports generated by a scheduled background job.

---

### 06 · CLICKUP INTEGRATION

**OAuth Setup — One Time (Developer)**
- 🔲 Register Tammy as ClickUp OAuth app
- 🔲 Set redirect URI: `https://tammy.ai/integrations/clickup/callback`
- 🔲 Store CLIENT_ID and CLIENT_SECRET in `.env`

**User Authorization Flow**
- 🔲 User clicks "Connect ClickUp" in settings
- 🔲 Redirect to ClickUp authorization URL with CLIENT_ID
- 🔲 User approves permissions
- 🔲 ClickUp redirects back with auth code
- 🔲 Backend exchanges code for access token via POST to ClickUp OAuth endpoint
- 🔲 Access token stored encrypted in MongoDB `integrations` collection:
  - `user_id: ref`
  - `type: "clickup"`
  - `access_token: encrypted string`
  - `connected_at: timestamp`
  - `workspace_id: string`
  - `default_list_id: string`

**Reading — Every Session Start**
- 🔲 `get_clickup_context()` function in `context_builder.py`
  - Checks for token → if none, returns empty string
  - Fetches today's tasks (due today, not closed)
  - Fetches overdue tasks (due before today, not closed)
  - Fetches completed tasks this week
  - Formats as natural language block injected into context
- 🔲 Context injection format:
  ```
  CLICKUP CONTEXT (use as insight only, never list as dashboard):
  Today's tasks (N): [task names]
  Overdue (N): [task names + days overdue]
  Completed this week (N): [task names]
  ```
- 🔲 Tammy uses task data to surface patterns, never to report tasks
- 🔲 Silent fail — if ClickUp API unavailable, conversation continues without it

**Writing — Explicit User Statement Only**
- 🔲 Commitment detection — Tammy detects when user commits to something in conversation
- 🔲 Create task — always confirms: "You just committed to X — want me to add that to ClickUp?"
  - POST `/api/v2/list/{list_id}/task`
- 🔲 Mark complete — "You said X is done — want me to mark it off?"
  - PUT `/api/v2/task/{task_id}` with `status: complete`
- 🔲 Move due date — "You said you're pushing X — want me to move the date?"
  - PUT `/api/v2/task/{task_id}` with new `due_date`
- 🔲 Cancel task — "You said you're killing X — want me to remove it?"
  - PUT `/api/v2/task/{task_id}` with `status: cancelled`
- 🔲 Never silent — always one confirmation step before any write

**Token Management**
- 🔲 ClickUp tokens don't expire — store once, use forever
- 🔲 401 response detection → prompt user to reconnect
- 🔲 Reconnect flow same as initial OAuth setup

**New file: `clickup_client.py`**
- `get_tasks(access_token)` → today, overdue, completed
- `create_task(access_token, list_id, name, due_date)` → new task
- `update_task(access_token, task_id, updates)` → status, due date
- `format_for_context(tasks)` → natural language string for context builder

**Connection to Architecture:**
`clickup_client.py` called inside `context_builder.py` at context assembly time. Token retrieved from MongoDB `integrations` collection. Write operations triggered from `tammy_core.py` after LLM response contains commitment confirmation.

---

### 07 · PERSONAL PROFILE

- ✅ Basic user profile — name, password hash in MongoDB `users`
- ✅ Legacy rich profile data — MongoDB `user_profile` collection
- 🔲 Expanded profile schema on `users` document:
  - `language_preference: enum` — en / ar / auto
  - `timezone: string`
  - `communication_style: enum` — very_direct / direct / balanced / gentle
  - `emotional_baseline: object` — set at onboarding
  - `goals_short_term: string`
  - `goals_long_term: string`
  - `onboarding_complete: bool`
  - `subscription_tier: enum` — free / pro
  - `clickup_connected: bool`
  - `voice_mode: enum` — push_to_talk / auto_detect / off`
  - `check_in_frequency: enum` — daily / weekly / tammy_decides`
  - `created_at: timestamp`
  - `last_active: timestamp`
- 🔲 Profile UI — user views and edits all fields
- 🔲 Venture context UI — dedicated section in profile

---

### 08 · NOTIFICATIONS & CHECK-INS

- 🔲 Tammy-initiated check-ins triggered by:
  - Decision pending for 7+ days without follow-up
  - Emotional pattern: 3+ consecutive low-dominance sessions
  - ClickUp task overdue 10+ days connected to unresolved decision
  - User hasn't opened Tammy in 5+ days
- 🔲 Notification types:
  - Push notification — mobile (Firebase)
  - In-app notification — web
  - Email digest — weekly growth and emotional summary (SendGrid)
- 🔲 User controls:
  - Frequency: daily / weekly / Tammy decides
  - Types: push on/off · email on/off · in-app on/off
  - Quiet hours: time window with no notifications
- 🔲 `notifications` MongoDB collection:
  - `user_id: ref`
  - `type: enum` — check_in / decision_follow_up / blind_spot / growth_report / weekly_digest
  - `content: string`
  - `sent_at: timestamp`
  - `read: bool`
  - `triggered_by: string` — what caused this notification

---

### 09 · SAVED CONVERSATIONS

- ✅ Full conversation history — `conversations` MongoDB collection
- ✅ Session summaries — `sessions` MongoDB collection
- ✅ Semantic backup — Pinecone raw message backup
- 🔲 Conversation history UI — browse all past sessions by date
- 🔲 Session search — full-text search across all past conversations
- 🔲 Star important moments — flag on individual messages
- 🔲 Export conversation — PDF or plain text download
- 🔲 Starred moments feed — quick view of all flagged messages across sessions

---

### 10 · SUBSCRIPTION

**Free Tier**
- 🔲 10 conversations per month
- 🔲 No voice
- 🔲 Memory persistence: 7 days only
- 🔲 No ClickUp integration
- 🔲 No growth tracking or weekly reports
- 🔲 No emotional arc visualization

**Pro Tier**
- 🔲 Unlimited conversations
- 🔲 Full voice (STT + TTS)
- 🔲 Permanent memory
- 🔲 ClickUp integration — full read and write
- 🔲 Full emotional tracking + arc visualization
- 🔲 Decision log + growth timeline
- 🔲 Weekly blind spot reports + monthly growth reports
- 🔲 Priority response speed

**Infrastructure**
- 🔲 Stripe integration — subscription creation, webhooks, cancellation
- 🔲 Feature gating middleware on FastAPI routes — checks `subscription_tier` before serving
- 🔲 Usage dashboard — conversations this month, insights generated, decisions tracked
- 🔲 `subscriptions` MongoDB collection:
  - `user_id: ref`
  - `tier: enum` — free / pro
  - `stripe_customer_id: string`
  - `stripe_subscription_id: string`
  - `status: enum` — active / cancelled / past_due
  - `current_period_end: timestamp`

---

### 11 · WEB PLATFORM

- ✅ FastAPI backend — `/chat/stream` · `/memory/clear` · `/health`
- ✅ Basic web UI — index.html vanilla JS/CSS dark theme, SSE streaming
- 🔲 Next.js frontend — replaces index.html entirely
- 🔲 Pages:
  - `/` — landing / login
  - `/onboarding` — conversation onboarding flow
  - `/chat` — main conversation UI
  - `/dashboard` — emotional arc + growth timeline + insight feed
  - `/decisions` — decision log
  - `/memories` — what Tammy remembers
  - `/conversations` — saved conversation history
  - `/profile` — user profile + venture context
  - `/settings` — voice, notifications, ClickUp, subscription
- 🔲 Design system — single branded theme (dark, warm, Arabic/English RTL+LTR support)
- 🔲 Voice button in web UI — hold to record
- 🔲 RTL layout support for Arabic

---

### 12 · MOBILE (REACT NATIVE)

- 🔲 React Native app — same FastAPI backend, shared API layer
- 🔲 All web features mirrored
- 🔲 Push notifications — Firebase Cloud Messaging
- 🔲 Home screen widget — tap to start voice session instantly
- 🔲 Offline mode — view past conversations without connection
- 🔲 Background audio — Tammy keeps speaking when app is backgrounded
- 🔲 Hold-to-speak button — mobile push-to-talk

---

### 13 · SETTINGS & CONTROL

- 🔲 Voice — on/off + mode (push-to-talk / auto-detect)
- 🔲 Language preference — English / Arabic / Auto
- 🔲 Communication style — how direct Tammy should be
- 🔲 Memory — on/off toggle
- 🔲 Notifications — push / email / in-app, frequency, quiet hours
- 🔲 ClickUp — connect / disconnect
- 🔲 Subscription — current plan, upgrade, manage billing
- 🔲 Export all my data — JSON download of everything
- 🔲 Delete account — hard delete all memories, conversations, profile
- 🔲 Dark/light mode

---

## DATABASE SCHEMA — COMPLETE

### users
```
{
  _id: ObjectId,
  username: string (unique),
  email: string (unique),
  password_hash: string (bcrypt),
  name: string,
  language_preference: "en" | "ar" | "auto",
  timezone: string,
  communication_style: "very_direct" | "direct" | "balanced" | "gentle",
  emotional_baseline: {
    primary_emotion: string,
    energy_level: "high" | "medium" | "low",
    overall_state: string
  },
  goals_short_term: string,
  goals_long_term: string,
  venture: {
    name: string,
    description: string,
    stage: "idea" | "building" | "launched" | "scaling",
    team_size: number,
    current_challenge: string
  },
  onboarding_complete: bool,
  subscription_tier: "free" | "pro",
  clickup_connected: bool,
  voice_mode: "push_to_talk" | "auto_detect" | "off",
  check_in_frequency: "daily" | "weekly" | "tammy_decides",
  created_at: timestamp,
  last_active: timestamp,
  last_login: timestamp
}
```

### sessions
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_name: string,
  summary: string,
  emotional_state: {
    primary_emotion: string,
    arousal: "high" | "medium" | "low",
    valence: "positive" | "negative" | "neutral",
    dominance: "in_control" | "neutral" | "overwhelmed"
  },
  message_count: number,
  created_at: timestamp,
  last_message_at: timestamp
}
```

### conversations
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_id: ref → sessions,
  role: "user" | "tammy",
  content: string,
  starred: bool,
  is_milestone: bool,
  is_insight: bool,
  timestamp: timestamp
}
```

### decisions
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_id: ref → sessions,
  decision_text: string,
  context: string,
  status: "pending" | "made" | "reversed" | "cancelled",
  follow_up_at: timestamp,
  outcome: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### insights
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_id: ref → sessions,
  insight_text: string,
  type: "emotional" | "strategic" | "pattern" | "breakthrough",
  flagged_by: "tammy" | "user",
  saved: bool,
  created_at: timestamp
}
```

### milestones
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_id: ref → sessions,
  conversation_id: ref → conversations,
  title: string,
  description: string,
  flagged_by: "tammy" | "user",
  created_at: timestamp
}
```

### emotional_states (aggregated per session)
```
{
  _id: ObjectId,
  user_id: ref → users,
  session_id: ref → sessions,
  primary_emotion: string,
  arousal: "high" | "medium" | "low",
  valence: "positive" | "negative" | "neutral",
  dominance: "in_control" | "neutral" | "overwhelmed",
  recorded_at: timestamp
}
```

### blind_spot_reports
```
{
  _id: ObjectId,
  user_id: ref → users,
  patterns: [string],
  week_start: timestamp,
  week_end: timestamp,
  generated_at: timestamp,
  read: bool
}
```

### growth_reports
```
{
  _id: ObjectId,
  user_id: ref → users,
  report_text: string,
  month: number,
  year: number,
  decisions_count: number,
  milestones_count: number,
  emotional_arc_summary: string,
  generated_at: timestamp,
  read: bool
}
```

### integrations
```
{
  _id: ObjectId,
  user_id: ref → users,
  type: "clickup",
  access_token: string (encrypted),
  workspace_id: string,
  default_list_id: string,
  connected_at: timestamp,
  last_used: timestamp,
  status: "active" | "revoked"
}
```

### subscriptions
```
{
  _id: ObjectId,
  user_id: ref → users,
  tier: "free" | "pro",
  stripe_customer_id: string,
  stripe_subscription_id: string,
  status: "active" | "cancelled" | "past_due",
  current_period_start: timestamp,
  current_period_end: timestamp,
  created_at: timestamp,
  updated_at: timestamp
}
```

### notifications
```
{
  _id: ObjectId,
  user_id: ref → users,
  type: "check_in" | "decision_follow_up" | "blind_spot" | "growth_report" | "weekly_digest",
  content: string,
  triggered_by: string,
  sent_at: timestamp,
  read: bool,
  channels_sent: ["push", "email", "in_app"]
}
```

---

## BUILD PRIORITY ORDER

### Month 1 — Core Platform

**Week 1-2**
- V11 system prompt — all improvements from agent analysis
- Next.js project setup — auth pages, conversation UI
- MongoDB schema migration — add all new collections
- Venture context injection into context_builder.py
- Emotional state tagging on session save

**Week 3-4**
- ClickUp OAuth + token storage
- ClickUp task fetching + context injection
- ClickUp write operations (create, complete, move, cancel)
- Decision detection + decision log
- Decision follow-up scheduler

### Month 2 — Growth Layer + Platform

**Week 5-6**
- Insight classification engine
- Insight feed UI
- Growth timeline UI
- Milestone flagging
- Blind spot weekly background job

**Week 7-8**
- Monthly growth report generation
- Emotional arc visualization
- Memory view + edit + delete UI
- Subscription (Stripe) + feature gating
- Notification system

**Week 7-8 parallel — Mobile**
- React Native project setup
- Core conversation UI
- Voice on mobile
- Push notifications
- Home screen widget

---

## FEATURE COUNT SUMMARY

| Layer | Built ✅ | To Build 🔲 | Total |
|-------|---------|------------|-------|
| Conversation Engine | 12 | 6 | 18 |
| Memory System | 5 | 4 | 9 |
| Onboarding | 1 | 5 | 6 |
| Emotional Intelligence | 4 | 8 | 12 |
| Entrepreneurship Layer | 1 | 16 | 17 |
| ClickUp Integration | 0 | 14 | 14 |
| Personal Profile | 2 | 12 | 14 |
| Notifications | 0 | 8 | 8 |
| Saved Conversations | 3 | 5 | 8 |
| Subscription | 0 | 8 | 8 |
| Web Platform | 2 | 10 | 12 |
| Mobile | 0 | 8 | 8 |
| Settings | 0 | 10 | 10 |
| **Total** | **30** | **114** | **144** |

---

*This document is the single source of truth for Tammy V1 platform development.*
*Update it as features are completed, schema changes, or architecture evolves.*
