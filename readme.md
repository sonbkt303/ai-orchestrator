# AI Orchestrator — Proof of Concept

Lightweight Node.js + Express backend demonstrating AI request lifecycle, streaming (SSE), prompt/context orchestration, and a simple AI gateway integration.

**Status:** PoC for learning and experimentation — not production-ready.

## Prerequisites

- Node.js 18.x or 22.x (LTS)
- pnpm 10.23.0+
- Docker & Docker Compose (PostgreSQL + Redis)
- `.env` from `.env.example` — set `AI_GATEWAY_URL`, `AI_API_KEY`

## Quick Start (local dev)

```bash
pnpm install
cp .env.example .env
pnpm run infra:up
pnpm run dev
# http://localhost:4000 (hoặc PORT trong .env)
```

Playground UI: mở `src/playground/index.html`

## API Reference

- `POST /ai/chat` — non-streaming chat
- `POST /ai/chat/stream` — streaming chat (SSE: `chunk`, `done`, `error`)
- `GET /ai/conversations/:id` — conversation history
- `GET /health` — health check

## Infra commands

```bash
pnpm run infra:up      # start PostgreSQL + Redis
pnpm run infra:down    # stop infra
pnpm run infra:reset   # stop + remove volumes
```

## Deploy internal server (PoC)

Mô hình đơn giản: **Docker Compose** (DB + Redis) + **app chạy manual** trên host (port **4000**).

```bash
# 1. Cài Docker, Node, pnpm (xem runbook)
# 2. Clone + cấu hình
git clone https://github.com/sonbkt303/ai-orchestrator.git
cd ai-orchestrator
cp .env.example .env   # chỉnh PORT, POSTGRES_*, AI_*

# 3. Infra
docker compose up -d

# 4. App
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

Runbook đầy đủ: [docs/deploy-internal-server.md](docs/deploy-internal-server.md)

## Notes

- Native `fetch` (Node 18+) cho AI gateway.
- PoC: không có auth, rate limit, hay process manager — app chạy thủ công.
