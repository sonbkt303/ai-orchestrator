# AI Orchestrator — Proof of Concept

Lightweight Node.js + Express backend demonstrating AI request lifecycle, streaming (SSE), prompt/context orchestration, and a simple AI gateway integration.

**Status:** PoC for learning and experimentation — not production-ready.

**Prerequisites (Môi trường)**
- Node.js: 18.x or 22.x (LTS recommended)
- pnpm: 10.23.0+ (hoặc `npm` nếu bạn thích, nhưng repo dùng `pnpm` scripts)
- Optional: Docker & Docker Compose (để chạy Redis dev services)
- Environment variables: create a `.env` from `.env.example` and set at least:
    - `AI_GATEWAY_URL` — URL tới AI gateway
    - `AI_API_KEY` — API key (nếu gateway yêu cầu)
    - `AI_RESPONSE_DELAY_MS` — (tuỳ chọn) giả lập độ trễ đáp ứng

## Quick Start

```bash
# 1. Install
pnpm install

# 2. Copy env file and edit
cp .env.example .env
# chỉnh `AI_GATEWAY_URL` và `AI_API_KEY` trong .env

# 3. (Optional) Start infra for Redis (docker-compose)
pnpm run infra:up

# 4. Start dev server
pnpm run dev
# Server: http://localhost:3000

# 5. Open playground (dev UI)
open src/playground/index.html
```

## API Reference (tổng quan)

- `POST /ai/chat` — non-streaming chat; trả về JSON với reply và conversationId.
- `POST /ai/chat/stream` — streaming chat via SSE. Sự kiện SSE:
    - `event: chunk` — payload: `{ "text": "..." }`
    - `event: done`  — payload: `{ "conversationId": "uuid" }`
    - `event: error` — payload: `{ "error": "..." }`
- `GET /ai/conversations/:id` — lấy lịch sử cuộc hội thoại
- `GET /health` — health check

## Cấu trúc thư mục (tóm tắt)

src/
- `server.ts` — entry point
- `config/` — cấu hình môi trường
- `routes/` — route definitions
- `controllers/` — HTTP controllers
- `services/` — core orchestration (ai.service, gateway, stream, prompt/context builders)
- `db/` — migration & repositories (Postgres future)
- `playground/` — dev UI

## Triển khai & Luồng yêu cầu (tóm tắt)

1. Client → `POST /ai/chat` or `POST /ai/chat/stream`
2. `ai.controller` validates input and (nếu stream) sets SSE headers
3. `ai.service` xây dựng context + prompt
4. `gateway.service` gọi AI Gateway và trả về response (có thể stream)
5. `stream.service` chuyển các chunk tới client (SSE)

## Infra commands

```bash
pnpm run infra:up      # start Redis + Redis Commander
pnpm run infra:down    # stop infra
pnpm run infra:reset   # stop + remove volumes
```

## Notes
- Repo dùng native `fetch` (Node 18+) để gọi AI gateway.
- Đây là PoC: không có bảo mật, kiểm soát truy cập, hoặc xử lý tải sản xuất.

---
If you want, I can also:
- Add example `.env.example` contents to the README
- Translate sections to full English or Vietnamese

(File updated with prerequisites and cleaned format.)