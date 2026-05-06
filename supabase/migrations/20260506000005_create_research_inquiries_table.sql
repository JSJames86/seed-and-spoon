CREATE TABLE IF NOT EXISTS research_inquiries (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  organization  TEXT        NOT NULL,
  role          TEXT        NOT NULL,
  research_area TEXT        NOT NULL,
  timeline      TEXT,
  message       TEXT        NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS research_inquiries_submitted_idx ON research_inquiries (submitted_at DESC);

ALTER TABLE research_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON research_inquiries
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "service_select" ON research_inquiries
  FOR SELECT USING (auth.role() = 'service_role');
