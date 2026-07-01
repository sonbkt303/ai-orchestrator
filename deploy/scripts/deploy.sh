#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ai-orchestrator}"
SERVICE_NAME="${SERVICE_NAME:-ai-orchestrator}"

cd "$APP_DIR"

echo "[deploy] pulling latest code..."
git pull --ff-only

echo "[deploy] installing dependencies..."
pnpm install --frozen-lockfile

echo "[deploy] building..."
pnpm run build

echo "[deploy] running migrations..."
pnpm run db:migrate:prod

echo "[deploy] restarting service..."
sudo systemctl restart "$SERVICE_NAME"

echo "[deploy] checking health..."
sleep 2
curl -sf "http://127.0.0.1:${PORT:-4000}/health" && echo

echo "[deploy] done"
