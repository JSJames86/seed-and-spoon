-- Run this in the Supabase SQL editor to enable live data on the Impact Dashboard.
-- After running, the /api/impact/summary and /api/impact/meals-over-time endpoints
-- will automatically switch from sample data to live data.

CREATE TABLE IF NOT EXISTS impact_meals (
  id          UUID       DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE       NOT NULL DEFAULT CURRENT_DATE,
  quantity    INTEGER    NOT NULL CHECK (quantity > 0),
  location    TEXT,
  notes       TEXT,
  is_deleted  BOOLEAN    DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS impact_volunteers (
  id          UUID       DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT       NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  active      BOOLEAN    DEFAULT true
);

CREATE TABLE IF NOT EXISTS impact_donations (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  amount            NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  date              DATE        NOT NULL DEFAULT CURRENT_DATE,
  source            TEXT        DEFAULT 'unknown',
  stripe_payment_id TEXT        UNIQUE,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Enable row-level security
ALTER TABLE impact_meals       ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_volunteers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_donations   ENABLE ROW LEVEL SECURITY;

-- Public can read meal counts and volunteer counts (no PII exposed)
CREATE POLICY "public_read_meals"
  ON impact_meals FOR SELECT USING (is_deleted = false);

CREATE POLICY "public_read_active_volunteers"
  ON impact_volunteers FOR SELECT USING (active = true);

-- Donations are private — only service role reads/writes
CREATE POLICY "service_role_manages_donations"
  ON impact_donations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_manages_meals"
  ON impact_meals FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_manages_volunteers"
  ON impact_volunteers FOR ALL USING (auth.role() = 'service_role');

-- Useful index for the 12-month chart query
CREATE INDEX IF NOT EXISTS idx_impact_meals_date ON impact_meals (date DESC);
