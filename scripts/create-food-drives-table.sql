-- Run this in the Supabase SQL editor to enable food drive form submissions.

CREATE TABLE IF NOT EXISTS food_drives (
  id               BIGSERIAL PRIMARY KEY,
  name             TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  phone            TEXT,
  drive_type       TEXT        NOT NULL,
  expected_date    DATE        NOT NULL,
  location         TEXT        NOT NULL,
  collection_type  TEXT        NOT NULL,
  needs_support    BOOLEAN     NOT NULL DEFAULT FALSE,
  notes            TEXT,
  status           TEXT        NOT NULL DEFAULT 'pending',  -- pending | confirmed | completed | cancelled
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries by status and date
CREATE INDEX IF NOT EXISTS food_drives_status_idx ON food_drives (status, submitted_at DESC);

-- RLS
ALTER TABLE food_drives ENABLE ROW LEVEL SECURITY;

-- Allow the API (service role) to insert
CREATE POLICY "service_insert" ON food_drives
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Only service role can read/update (admin use only)
CREATE POLICY "service_select" ON food_drives
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "service_update" ON food_drives
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER food_drives_updated_at
  BEFORE UPDATE ON food_drives
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
