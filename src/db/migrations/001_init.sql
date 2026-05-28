-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 001_init
-- Phase A — conversations + messages
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- normalize accents for FTS

-- ── Helper: auto-update updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── conversations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'archived', 'deleted')),
  metadata    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_conversations_updated_at ON conversations (updated_at DESC);
CREATE INDEX idx_conversations_status     ON conversations (status);

-- ── messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content         TEXT        NOT NULL,
  language        VARCHAR(10) NOT NULL DEFAULT 'simple',
  search_vector   TSVECTOR,
  seq             INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_messages_conv_seq UNIQUE (conversation_id, seq)
);

-- Auto-populate search_vector from content using the stored language config
CREATE OR REPLACE FUNCTION set_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector(
    COALESCE(NEW.language, 'simple')::REGCONFIG,
    unaccent(COALESCE(NEW.content, ''))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_search_vector
BEFORE INSERT OR UPDATE OF content, language ON messages
FOR EACH ROW EXECUTE FUNCTION set_message_search_vector();

-- ── Indexes on messages ───────────────────────────────────────────────────────
CREATE INDEX idx_messages_conv_seq      ON messages (conversation_id, seq);
CREATE INDEX idx_messages_created_at    ON messages (created_at DESC);
CREATE INDEX idx_messages_search_vector ON messages USING GIN (search_vector);
