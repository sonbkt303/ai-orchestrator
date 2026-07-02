# Hướng dẫn chạy project (Local Development)

Tài liệu này mô tả cách setup và chạy monorepo **Clever Dent AI** trên máy local.

## Tổng quan

Monorepo gồm 3 app và 2 package dùng chung:

| Thành phần | Đường dẫn | Port mặc định | Vai trò |
|------------|-----------|---------------|---------|
| **public-site** | `apps/public-site` | 3000 | Trang homepage bệnh nhân (Next.js) |
| **homepage-platform** | `apps/homepage-platform` | 3002 | CMS API, publish, slug registry |
| **ai-orchestrator** | `apps/ai-orchestrator` | 4000 | AI gateway, streaming chat |
| shared-contracts | `packages/shared-contracts` | — | Zod schemas dùng chung |
| shared-utils | `packages/shared-utils` | — | Slug validate/suggest |

Infra chạy bằng Docker Compose (`infra/docker-compose.yml`):

| Service | Port host | Mục đích |
|---------|-----------|----------|
| postgres (AI) | 5433 | DB cho ai-orchestrator |
| postgres-hp | 5434 | DB cho homepage-platform |
| redis | 6380 | Cache / queue (Phase sau) |

---

## Yêu cầu hệ thống

- **Node.js** 18.x hoặc 22.x (LTS khuyến nghị)
- **pnpm** 10.23.0+ (repo dùng `packageManager: pnpm@10.23.0`)
- **Docker Desktop** + Docker Compose (cho Postgres, Redis)

Kiểm tra nhanh:

```bash
node -v
pnpm -v
docker compose version
```

Cài pnpm nếu chưa có:

```bash
npm install -g pnpm@10.23.0
```

---

## Bước 1 — Clone và cài dependencies

Tại thư mục gốc repo:

```bash
pnpm install
```

Lệnh này cài dependencies cho toàn bộ workspace (`apps/*`, `packages/*`).

---

## Bước 2 — Cấu hình biến môi trường

Mỗi app có file `.env` riêng. Copy từ `.env.example`:

```bash
cp apps/ai-orchestrator/.env.example apps/ai-orchestrator/.env
cp apps/homepage-platform/.env.example apps/homepage-platform/.env
cp apps/public-site/.env.example apps/public-site/.env
```

### ai-orchestrator (`apps/ai-orchestrator/.env`)

| Biến | Mặc định | Ghi chú |
|------|----------|---------|
| `PORT` | `4000` | **Bắt buộc** giữ `4000` để khớp với các app khác |
| `AI_GATEWAY_URL` | OpenAI URL | URL gateway AI (OpenAI-compatible) |
| `AI_API_KEY` | — | API key thật để test chat |
| `POSTGRES_*` | localhost:5433 | Khớp với docker-compose |

### homepage-platform (`apps/homepage-platform/.env`)

| Biến | Mặc định | Ghi chú |
|------|----------|---------|
| `PORT` | `3002` | API CMS |
| `POSTGRES_*` | localhost:5434 | DB riêng cho homepage |
| `AI_ORCHESTRATOR_URL` | `http://localhost:4000` | Gọi sang AI orchestrator |
| `PUBLIC_SITE_URL` | `http://localhost:3000` | URL public site (revalidate) |
| `PUBLIC_BASE_DOMAIN` | `local.cleverdent.ai` | Domain subdomain sau publish |
| `PUBLIC_SITE_PROTOCOL` | `http` | Protocol cho `publishedUrl` |
| `PUBLIC_SITE_PORT` | `3000` | Port append khi dev |
| `REVALIDATE_SECRET` | `dev-secret` | Secret gọi revalidate cache |

### public-site (`apps/public-site/.env`)

| Biến | Mặc định | Ghi chú |
|------|----------|---------|
| `HOMEPAGE_API_URL` | `http://localhost:3002` | Lấy snapshot đã publish |
| `PUBLIC_BASE_DOMAIN` | `local.cleverdent.ai` | Subdomain rewrite trong middleware |
| `REVALIDATE_SECRET` | `dev-secret` | Phải khớp với homepage-platform |

> **Lưu ý:** Không commit file `.env`. Các file này đã nằm trong `.gitignore`.

---

## Bước 3 — Khởi động infrastructure (Docker)

```bash
pnpm infra:up
```

Chờ vài giây để Postgres và Redis healthy. Kiểm tra:

```bash
docker ps
```

Kỳ vọng thấy 3 container: `ai-orchestrator-postgres`, `homepage-platform-postgres`, `ai-orchestrator-redis`.

Dừng infra:

```bash
pnpm infra:down
```

Xóa cả dữ liệu (reset DB):

```bash
pnpm infra:reset
```

---

## Bước 4 — Chạy database migration

Sau khi infra đã up:

```bash
pnpm db:migrate:ai   # ai-orchestrator → postgres :5433
pnpm db:migrate:hp   # homepage-platform → postgres-hp :5434
```

Chạy lại migration khi có file SQL mới trong `apps/*/src/db/migrations/`.

---

## Bước 5 — Chạy ứng dụng

### Chạy tất cả app (khuyến nghị)

Tại thư mục gốc:

```bash
pnpm dev:all
```

Turbo sẽ chạy song song:

- `public-site` → http://localhost:3000
- `homepage-platform` → http://localhost:3002
- `ai-orchestrator` → http://localhost:4000

### Chạy từng app riêng

```bash
# Chỉ public site
pnpm --filter public-site dev

# Chỉ homepage platform API
pnpm --filter homepage-platform dev

# Chỉ AI orchestrator
pnpm --filter ai-orchestrator dev
```

### Build production (kiểm tra compile)

```bash
pnpm build
```

Build từng package:

```bash
pnpm --filter @clever-dent/shared-contracts build
pnpm --filter @clever-dent/shared-utils build
pnpm --filter ai-orchestrator build
pnpm --filter homepage-platform build
pnpm --filter public-site build
```

---

## Kiểm tra sau khi chạy

### Health check

```bash
curl http://localhost:4000/health
curl http://localhost:3002/health
```

### Public site — homepage phòng khám (path-based)

Mở trình duyệt:

- http://localhost:3000 — Landing
- http://localhost:3000/smile-dental — Trang clinic demo (7 sections)

Nếu homepage-platform chưa chạy, public-site vẫn hiển thị được nhờ **fixture fallback** (`fixtures/mock-snapshot.json`) cho slug `smile-dental`.

### Homepage Platform — snapshot API

```bash
curl http://localhost:3002/v1/public/sites/smile-dental
```

Trả về JSON `PublishedSnapshot` (Phase 0: mock data).

### AI Orchestrator — chat playground

- http://localhost:4000/chat — UI test chat
- `POST http://localhost:4000/ai/chat` — Chat không stream
- `POST http://localhost:4000/ai/chat/stream` — Chat SSE stream
- `GET http://localhost:4000/ai/conversations/:id` — Lịch sử hội thoại

Cần cấu hình `AI_API_KEY` hợp lệ trong `.env` để gọi AI thật.

### On-demand revalidate (stub)

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: dev-secret" \
  -d '{"slug":"smile-dental"}'
```

---

## Auto-gen homepage → Publish → Subdomain (E2E)

Luồng đầy đủ: AI sinh nội dung → lưu draft → publish snapshot → site live qua subdomain.

**Yêu cầu:** `ai-orchestrator`, `homepage-platform`, `public-site` đang chạy; `AI_API_KEY` hợp lệ trong `apps/ai-orchestrator/.env`.

### 1. Generate draft

Từ thư mục gốc repo:

```bash
curl -X POST http://localhost:3002/v1/admin/homepage/generate \
  -H "Content-Type: application/json" \
  -d @apps/homepage-platform/src/fixtures/clinic-input.json
```

Response gồm `draft` (status `draft`) và có thể có `suggestedSlugs` nếu slug bị conflict.

### 2. Publish

```bash
curl -X POST http://localhost:3002/v1/admin/homepage/publish \
  -H "Content-Type: application/json" \
  -d '{"slug":"smile-dental"}'
```

Response ví dụ:

```json
{
  "publishedUrl": "http://smile-dental.local.cleverdent.ai:3000",
  "publishedAt": "2026-07-01T12:00:00.000Z"
}
```

### 3. Verify public API

```bash
curl http://localhost:3002/v1/public/sites/smile-dental
```

### 4. Verify public site

Path-based:

```bash
curl http://localhost:3000/smile-dental
```

Subdomain (cần thêm hosts — xem mục Subdomain dev):

```bash
curl http://smile-dental.local.cleverdent.ai:3000
```

### Admin API khác

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/v1/admin/homepage/:clinicId/draft` | Lấy draft |
| PATCH | `/v1/admin/homepage/:clinicId/draft` | Sửa draft trước publish |
| GET | `/v1/admin/slugs/suggest?name=Smile+Dental&city=Seoul` | Gợi ý slug |

AI endpoint trực tiếp (debug):

```bash
curl -X POST http://localhost:4000/ai/homepage/generate \
  -H "Content-Type: application/json" \
  -d @apps/homepage-platform/src/fixtures/clinic-input.json
```

---

## Subdomain dev (tùy chọn)

Public site hỗ trợ rewrite subdomain → path slug qua `middleware.ts`.

### Windows — chỉnh file hosts

Mở **Notepad as Administrator**, sửa:

```
C:\Windows\System32\drivers\etc\hosts
```

Thêm dòng:

```
127.0.0.1 smile-dental.local.cleverdent.ai
```

### macOS / Linux

```bash
sudo nano /etc/hosts
```

Thêm:

```
127.0.0.1 smile-dental.local.cleverdent.ai
```

### Truy cập

http://smile-dental.local.cleverdent.ai:3000

Middleware sẽ rewrite thành `/smile-dental` nội bộ.

---

## Sơ đồ luồng dev

```
Admin/curl
   │
   ├─► POST /v1/admin/homepage/generate ──► homepage-platform :3002
   │       └─► POST /ai/homepage/generate ──► ai-orchestrator :4000
   │
   ├─► POST /v1/admin/homepage/publish ──► homepage-platform :3002
   │       ├─► postgres-hp (published_snapshots)
   │       └─► POST /api/revalidate ──► public-site :3000
   │
Browser
   │
   ├─► public-site :3000  (path hoặc subdomain)
   │       └─► GET /v1/public/sites/:slug ──► homepage-platform :3002
   │
   └─► ai-orchestrator :4000/ai/*  (chat, streaming)

homepage-platform :3002 ──► postgres-hp :5434
ai-orchestrator   :4000 ──► postgres-ai :5433, redis :6380
```

---

## Xử lý sự cố thường gặp

### Port bị chiếm

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `EADDRINUSE` port 3000/3002/4000 | Tắt process đang dùng port hoặc đổi `PORT` trong `.env` tương ứng |
| AI orchestrator chạy sai port | Kiểm tra `apps/ai-orchestrator/.env` — đặt `PORT=4000` |

### Docker không start

- Bật Docker Desktop
- Chạy `docker ps` xem container có healthy không
- Port 5433/5434/6380 conflict → dừng service khác hoặc đổi mapping trong `infra/docker-compose.yml`

### Migration lỗi connection refused

- Chạy `pnpm infra:up` trước khi migrate
- Kiểm tra `POSTGRES_PORT` trong `.env` khớp docker (5433 cho AI, 5434 cho HP)

### Public site không lấy được API

- Kiểm tra `homepage-platform` đang chạy: `curl http://localhost:3002/health`
- Kiểm tra `HOMEPAGE_API_URL` trong `apps/public-site/.env`
- Slug `smile-dental` vẫn có fallback fixture nếu API down

### pnpm install lỗi workspace

- Dùng đúng pnpm 10.x: `corepack enable && corepack prepare pnpm@10.23.0 --activate`
- Xóa `node_modules` và chạy lại `pnpm install` tại root

---

## Scripts tham khảo (root `package.json`)

| Script | Mô tả |
|--------|-------|
| `pnpm dev:all` | Chạy dev tất cả app |
| `pnpm dev` | Chạy dev qua turbo (tương tự) |
| `pnpm build` | Build toàn monorepo |
| `pnpm lint` | Lint tất cả app |
| `pnpm infra:up` | Start Docker infra |
| `pnpm infra:down` | Stop Docker infra |
| `pnpm infra:reset` | Stop + xóa volumes DB |
| `pnpm db:migrate:ai` | Migration ai-orchestrator |
| `pnpm db:migrate:hp` | Migration homepage-platform |

---

## Tài liệu liên quan

- [README](../readme.md) — Tổng quan monorepo
- [Deploy internal server](./deploy-internal-server.md) — PoC deploy server nội bộ
- [Requirements](../requirements-analysis/clever-dent-ai/) — Nghiệp vụ & API contract
