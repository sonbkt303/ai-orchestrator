CREATE TABLE IF NOT EXISTS homepage_drafts (
  clinic_id UUID PRIMARY KEY,
  slug TEXT NOT NULL,
  draft JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_slug ON homepage_drafts(slug);
