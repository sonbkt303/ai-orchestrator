#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ai-orchestrator}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ai-orchestrator}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
CONTAINER="${POSTGRES_CONTAINER:-ai-orchestrator-postgres}"

if [[ -f "$APP_DIR/.env" ]]; then
  set -a
  source "$APP_DIR/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-ai_orchestrator}"

mkdir -p "$BACKUP_DIR"
OUTPUT="$BACKUP_DIR/${POSTGRES_DB}_${TIMESTAMP}.sql.gz"

echo "[backup] dumping $POSTGRES_DB from $CONTAINER..."
docker exec "$CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$OUTPUT"

echo "[backup] saved to $OUTPUT"
