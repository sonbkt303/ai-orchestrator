# Clever Dent AI — Monorepo

pnpm workspace for Clever Dent AI platform services:

| App | Path | Port | Role |
|-----|------|------|------|
| **public-site** | `apps/public-site` | 3000 | F4 — patient-facing homepage (Next.js) |
| **homepage-platform** | `apps/homepage-platform` | 3002 | F2/F3 — CMS API, publish, slug |
| **ai-orchestrator** | `apps/ai-orchestrator` | 4000 | F6 — AI gateway client, streaming |

Shared packages: `packages/shared-contracts` (Zod schemas), `packages/shared-utils` (slug helpers).

## Prerequisites

- Node.js 18.x or 22.x (LTS)
- pnpm 10.23.0+
- Docker & Docker Compose

## Quick Start (local dev)

```bash
pnpm install

cp apps/ai-orchestrator/.env.example apps/ai-orchestrator/.env
cp apps/homepage-platform/.env.example apps/homepage-platform/.env
cp apps/public-site/.env.example apps/public-site/.env

pnpm infra:up
pnpm db:migrate:ai
pnpm db:migrate:hp
pnpm dev:all
```

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Public site landing |
| http://localhost:3000/smile-dental | Published clinic homepage (path-based) |
| http://localhost:3002/v1/public/sites/smile-dental | Homepage Platform snapshot API |
| http://localhost:4000/health | AI Orchestrator health |
| http://localhost:4000/chat | AI chat playground |

**Hướng dẫn chi tiết:** [docs/local-development.md](docs/local-development.md) — setup env, chạy từng app, subdomain dev, troubleshooting.

## Infra commands

```bash
pnpm infra:up      # start PostgreSQL (5433, 5434) + Redis (6380)
pnpm infra:down    # stop infra
pnpm infra:reset   # stop + remove volumes
pnpm db:migrate:ai # ai-orchestrator migrations
pnpm db:migrate:hp # homepage-platform migrations
```

## Build

```bash
pnpm build
```

## AI Orchestrator (F6)

See [apps/ai-orchestrator](apps/ai-orchestrator) — set `AI_GATEWAY_URL`, `AI_API_KEY` in `.env`.

API:
- `POST /ai/chat` — non-streaming chat
- `POST /ai/chat/stream` — streaming chat (SSE)
- `GET /ai/conversations/:id` — conversation history
- `GET /health` — health check

## Deploy internal server (PoC)

Runbook: [docs/deploy-internal-server.md](docs/deploy-internal-server.md)

## Requirements

Business requirements and API contract: [requirements-analysis/clever-dent-ai/](requirements-analysis/clever-dent-ai/)
