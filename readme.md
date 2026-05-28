# AI Orchestrator PoC

> Node.js · Express · SSE · Native Fetch · Node 18+

A backend PoC to understand AI request lifecycle, streaming, SSE, conversation flow, and AI gateway integration — before migrating to a production architecture (NestJS, RAG, etc.).

---

## Goals

**In scope**
- Understand AI request lifecycle
- Understand streaming & SSE end-to-end
- Understand conversation / context flow
- Understand how to integrate an AI Gateway
- Validate backend architecture patterns

**Out of scope**
- Enterprise-grade infrastructure
- Microservices
- Performance optimization
- Large-scale deployment

---

## Architecture

```
Frontend Playground
    │
    │  HTTP / SSE
    ▼
Node.js Express Backend
    │
    ├── AI Orchestration Layer
    │       ├── Prompt Builder
    │       ├── Context Builder
    │       ├── Conversation Manager
    │       └── Stream Handler
    │
    ├── AI Gateway Client
    │
    ├── Redis (Phase 7 — optional)
    │
    └── PostgreSQL (Future Phase A — out of scope)
    │
    ▼
AI / API Gateway
    │
    ▼
LLM Provider
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| HTTP Client | native `fetch` (Node 18+) |
| Streaming | SSE (Server-Sent Events) |
| Cache / State | Redis *(Phase 7)* |
| Database | PostgreSQL *(Future)* |
| Dev tooling | nodemon |
| Infrastructure | Docker Compose |

---

## Quick Start

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set AI_GATEWAY_URL and AI_API_KEY

# 3. Start infrastructure (Redis)
npm run infra:up

# 4. Start dev server
npm run dev
# → http://localhost:3000

# 5. Open playground
open src/playground/index.html
```

---

## API Reference

### `POST /ai/chat`
Non-streaming chat. Returns full response as JSON.

```json
// Request
{ "message": "Hello", "conversationId": "optional-uuid" }

// Response
{ "reply": { "text": "...", "conversationId": "uuid" }, "conversationId": "uuid" }
```

### `POST /ai/chat/stream`
Streaming chat via SSE. Connect with `EventSource` or `fetch` + `ReadableStream`.

SSE event types:
- `event: chunk` — `{ "text": "..." }`
- `event: done`  — `{ "conversationId": "uuid" }`
- `event: error` — `{ "error": "..." }`

### `GET /ai/conversations/:id`
Retrieve conversation history.

```json
{ "conversationId": "uuid", "messages": [{ "role": "user", "content": "..." }] }
```

### `GET /health`
Server health check.

```json
{ "status": "ok", "timestamp": "..." }
```

---

## Folder Structure

```
src/
├── server.js
├── config/
│     └── index.js
├── routes/
│     └── ai.routes.js
├── controllers/
│     └── ai.controller.js
├── services/
│     ├── ai.service.js               ← orchestration core
│     ├── gateway.service.js          ← AI Gateway HTTP client
│     ├── stream.service.js           ← SSE lifecycle helpers
│     ├── prompt-builder.service.js   ← prompt composition
│     ├── context-builder.service.js  ← context injection
│     └── conversation.service.js     ← in-memory conversation store
├── prompts/
│     ├── system.txt
│     └── templates/
├── utils/
└── playground/
      └── index.html                  ← dev chat UI
```

---

## Request Flow

```
POST /ai/chat / POST /ai/chat/stream
        ↓
  AI Controller        ← validate input, set SSE headers
        ↓
    AI Service         ← orchestration
        ↓
 Context Builder       ← inject metadata
        ↓
  Prompt Builder       ← compose messages[]
        ↓
 Gateway Service       ← HTTP call to AI Gateway
        ↓
   AI Gateway → LLM
```

### Streaming Flow

```
LLM chunks → Gateway Service (parse SSE)
                      ↓
             Stream Service (write SSE)
                      ↓
           Client (EventSource / fetch)
```

---

## Infrastructure

```bash
npm run infra:up      # start Redis + Redis Commander
npm run infra:down    # stop all containers
npm run infra:reset   # stop + remove all volumes (resets data)
```

| Service | URL |
|---|---|
| Redis | `localhost:6379` |
| Redis Commander | http://localhost:8081 |
| PostgreSQL *(commented out)* | `localhost:5432` |
| pgAdmin *(commented out)* | http://localhost:5050 |

---

## Implementation Phases

| Phase | Description | Status |
|---|---|---|
| **1** | Foundation — server, folder structure, health endpoint | ✅ Done |
| **2** | Core request flow — non-streaming chat | ✅ Done |
| **3** | Prompt & Context layer | ✅ Done |
| **4** | Streaming & SSE | ✅ Done |
| **5** | Conversation management (in-memory) | ✅ Done |
| **6** | Playground frontend | ✅ Done |
| **7** | Redis — externalize conversation state | ⏳ Optional |
| **Future A** | PostgreSQL — persist conversation history | 🔵 Out of scope |
| **Future B** | BullMQ — async job queue (RAG, file processing) | 🔵 Out of scope |

---

## SSE Headers

```js
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
```