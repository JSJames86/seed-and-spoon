CREATE TABLE IF NOT EXISTS community_partners (
  id                      BIGSERIAL PRIMARY KEY,
  organization_name       TEXT        NOT NULL,
  organization_type       TEXT        NOT NULL,  -- 'Church / Faith community' | 'Community center' | 'Youth group' | 'Social / Civic group' | 'Educational institution' | 'Other'
  organization_type_other TEXT,
  contact_name            TEXT        NOT NULL,
  email                   TEXT        NOT NULL,
  phone                   TEXT,
  city                    TEXT,
  zip                     TEXT,
  partnership_interests   TEXT[]      NOT NULL DEFAULT '{}',
  notes                   TEXT,
  website                 TEXT,
  consent                 BOOLEAN     NOT NULL DEFAULT FALSE,
  status                  TEXT        NOT NULL DEFAULT 'new',  -- new | contacted | active | declined
  source                  TEXT        NOT NULL DEFAULT 'community_partner_form',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_partners_status_idx ON community_partners (status, created_at DESC);
CREATE INDEX IF NOT EXISTS community_partners_email_idx  ON community_partners (email);

ALTER TABLE community_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert" ON community_partners
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "service_select" ON community_partners
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "service_update" ON community_partners
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION set_community_partners_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER community_partners_updated_at
  BEFORE UPDATE ON community_partners
  FOR EACH ROW EXECUTE FUNCTION set_community_partners_updated_at();
