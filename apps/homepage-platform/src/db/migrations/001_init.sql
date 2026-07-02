CREATE TABLE IF NOT EXISTS slug_registry (
  slug TEXT PRIMARY KEY,
  clinic_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS published_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  slug TEXT NOT NULL REFERENCES slug_registry(slug),
  snapshot JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_slug ON published_snapshots(slug, published_at DESC);
