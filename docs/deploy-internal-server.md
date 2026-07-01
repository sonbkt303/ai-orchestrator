# Deploy AI Orchestrator — Internal Server (PoC)

Runbook đơn giản cho server nội bộ: **Docker Compose** chạy PostgreSQL + Redis, **Node.js app chạy thủ công** trên host.

| Thành phần | Cách chạy | Port |
|---|---|---|
| PostgreSQL | Docker Compose | 5433 (LAN) |
| Redis | Docker Compose | 6380 (localhost only) |
| Node.js API | Manual (`pnpm start`) | 4000 (LAN) |

```mermaid
flowchart LR
  subgraph lan [LAN]
    Client[Client]
    DBTool[DB_Tool]
  end
  subgraph server [Server]
    App[Node_API_4000]
    subgraph docker [Docker_Compose]
      PG[(PostgreSQL_5433)]
      Redis[(Redis_6380)]
    end
  end
  Client --> App
  DBTool --> PG
  App --> PG
  App --> Redis
```

---

## 1. Cài dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# Docker + Docker Compose v2
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Logout/login lại để group docker có hiệu lực

# Node.js 22 LTS (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# pnpm
corepack enable
corepack prepare pnpm@10.23.0 --activate
```

Kiểm tra:

```bash
docker compose version
node -v
pnpm -v
```

---

## 2. Clone repo

### HTTPS + Fine-grained PAT (khuyến nghị)

```bash
git config --global credential.helper store

git clone https://github.com/sonbkt303/ai-orchestrator.git
cd ai-orchestrator
```

Nhập **một lần** khi được hỏi:
- Username: GitHub username
- Password: PAT (không phải password GitHub)

```bash
chmod 600 ~/.git-credentials
```

---

## 3. Cấu hình `.env`

```bash
cp .env.example .env
nano .env
```

Giá trị tối thiểu:

```env
PORT=4000
NODE_ENV=production

POSTGRES_HOST=localhost
POSTGRES_PORT=5433
REDIS_HOST=localhost
REDIS_PORT=6380

POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=ai_orchestrator

AI_GATEWAY_URL=https://api.openai.com/v1
AI_API_KEY=<your-api-key>
```

---

## 4. Khởi động infra

```bash
docker compose up -d
docker compose ps
```

Kiểm tra:

```bash
docker compose exec postgres pg_isready -U postgres
docker compose exec redis redis-cli ping
# PONG
```

Hoặc dùng script:

```bash
pnpm run infra:up
```

---

## 5. Build và chạy app (manual)

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm start
```

App lắng nghe tại **http://0.0.0.0:4000**. Dừng app: `Ctrl+C`.

Chạy nền tạm thời (tuỳ chọn):

```bash
nohup pnpm start > app.log 2>&1 &
tail -f app.log
```

---

## 6. Verify

```bash
# Trên server
curl http://127.0.0.1:4000/health

# Từ máy khác trong LAN (thay IP server)
curl http://<SERVER_IP>:4000/health

# PostgreSQL từ LAN
psql "postgresql://postgres:<password>@<SERVER_IP>:5433/ai_orchestrator" -c "SELECT 1"
```

---

## 7. Cập nhật code

```bash
cd ai-orchestrator
git pull --ff-only
pnpm install --frozen-lockfile
pnpm run build
# Dừng app cũ (Ctrl+C hoặc kill process) rồi chạy lại:
pnpm start
```

---

## 8. Vận hành

### Infra (Docker)

```bash
docker compose ps
docker compose logs -f postgres
docker compose logs -f redis
docker compose down          # dừng
docker compose up -d         # bật lại
pnpm run infra:down          # hoặc dùng script
pnpm run infra:reset         # dừng + xóa volumes
```

### App

| Hành động | Lệnh |
|---|---|
| Chạy | `pnpm start` |
| Dev (hot reload) | `pnpm run dev` |
| Build | `pnpm run build` |
| Dừng | `Ctrl+C` |

---

## 9. Troubleshooting

| Triệu chứng | Cách xử lý |
|---|---|
| `pnpm: command not found` | `source ~/.bashrc`, kiểm tra `nvm use 22` |
| `permission denied` khi docker | Logout/login sau `usermod -aG docker` |
| App không kết nối DB | Kiểm tra `docker compose ps`, `.env` POSTGRES_* |
| Redis error | `.env`: `REDIS_HOST=localhost`, `REDIS_PORT=6380` |
| LAN không vào :4000 / :5433 | Kiểm tra firewall server, mở port nếu cần |

```bash
docker compose ps
docker compose logs postgres --tail 30
ss -tlnp | grep -E '4000|5433|6380'
```

---

## 10. Port reference

| Service | Port | Ghi chú |
|---|---|---|
| API | 4000 | App Node.js |
| PostgreSQL | 5433 | Expose LAN (docker-compose) |
| Redis | 6380 | Chỉ localhost (`127.0.0.1`) |
