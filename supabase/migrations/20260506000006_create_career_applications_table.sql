CREATE TABLE IF NOT EXISTS career_applications (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  phone         TEXT,
  position      TEXT        NOT NULL,
  portfolio_url TEXT,
  message       TEXT        NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS career_applications_submitted_idx ON career_applications (submitted_at DESC);

ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON career_applications
  FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "service_select" ON career_applications
  FOR SELECT USING (auth.role() = 'service_role');
