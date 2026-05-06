CREATE TABLE IF NOT EXISTS affiliates (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT,
  affiliate_type    TEXT        NOT NULL,  -- 'Individual' | 'Organization'
  organization_name TEXT,
  website           TEXT,
  social_handle     TEXT,
  plan_to_help      TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending',  -- pending | approved | active | declined
  submitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS affiliates_status_idx ON affiliates (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS affiliates_email_idx  ON affiliates (email);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON affiliates
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "service_select" ON affiliates
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "service_update" ON affiliates
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_affiliates_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW EXECUTE FUNCTION set_affiliates_updated_at();
