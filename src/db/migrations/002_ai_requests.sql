-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 002_ai_requests
-- Phase B — AI request logging + token usage tracking
-- ─────────────────────────────────────────────────────────────────────────────

-- ── ai_requests ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_requests (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id      UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_message_id      UUID        REFERENCES messages(id) ON DELETE SET NULL,
  assistant_message_id UUID        REFERENCES messages(id) ON DELETE SET NULL,
  model                VARCHAR(100) NOT NULL,
  latency_ms           INTEGER     NOT NULL,
  status               VARCHAR(20) NOT NULL DEFAULT 'success'
                         CHECK (status IN ('success', 'timeout', 'error')),
  error_text           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_requests_conv_created ON ai_requests (conversation_id, created_at DESC);
CREATE INDEX idx_ai_requests_status       ON ai_requests (status);

-- ── ai_usage ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id        UUID        NOT NULL REFERENCES ai_requests(id) ON DELETE CASCADE,
  prompt_tokens     INTEGER     NOT NULL DEFAULT 0,
  completion_tokens INTEGER     NOT NULL DEFAULT 0,
  total_tokens      INTEGER     NOT NULL DEFAULT 0,
  cost              NUMERIC(12, 6),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_request_id ON ai_usage (request_id);
