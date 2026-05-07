-- SpoonAssist price tables
-- ingredient_mappings: server-managed cache of normalised ingredient prices
-- price_points: community-submitted store price observations

CREATE TABLE IF NOT EXISTS ingredient_mappings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_name TEXT UNIQUE NOT NULL,
  pkg_price      DECIMAL(10, 2) NOT NULL,
  pkg_qty        DECIMAL(10, 3) NOT NULL,
  pkg_unit       TEXT NOT NULL,        -- 'oz', 'lb', 'each', 'cup'
  confidence     TEXT DEFAULT 'usda', -- 'usda' | 'instacart' | 'manual'
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_points (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient  TEXT NOT NULL,
  store_name  TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  pkg_qty     DECIMAL(10, 3) NOT NULL,
  pkg_unit    TEXT NOT NULL DEFAULT 'oz',
  zip_prefix  TEXT,  -- first 3 digits of ZIP for regional queries
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingredient_mappings_name ON ingredient_mappings (normalized_name);
CREATE INDEX IF NOT EXISTS idx_price_points_ingredient  ON price_points (ingredient);
CREATE INDEX IF NOT EXISTS idx_price_points_zip         ON price_points (zip_prefix);

-- Auto-update updated_at on ingredient_mappings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ingredient_mappings_updated_at
  BEFORE UPDATE ON ingredient_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE ingredient_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_points         ENABLE ROW LEVEL SECURITY;

-- ingredient_mappings: public read, service-role write
CREATE POLICY "Public read ingredient_mappings"
  ON ingredient_mappings FOR SELECT USING (true);

CREATE POLICY "Service role insert ingredient_mappings"
  ON ingredient_mappings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update ingredient_mappings"
  ON ingredient_mappings FOR UPDATE
  USING (auth.role() = 'service_role');

-- price_points: public read + insert (community submissions), service-role manage
CREATE POLICY "Public read price_points"
  ON price_points FOR SELECT USING (true);

CREATE POLICY "Public insert price_points"
  ON price_points FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role delete price_points"
  ON price_points FOR DELETE
  USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Seed: 25 NJ regional baseline prices (mirrors USDA_BASELINE in priceEngine)
-- ---------------------------------------------------------------------------
INSERT INTO ingredient_mappings (normalized_name, pkg_price, pkg_qty, pkg_unit, confidence) VALUES
  ('cranberry',           3.49,  12.000, 'oz',   'usda'),
  ('butter',              5.99,  16.000, 'oz',   'usda'),
  ('sugar',               2.99,  32.000, 'oz',   'usda'),
  ('brown sugar',         2.49,  32.000, 'oz',   'usda'),
  ('orange juice',        3.49,  52.000, 'oz',   'usda'),
  ('cinnamon',            2.99,   2.370, 'oz',   'usda'),
  ('sausage',             4.99,  16.000, 'oz',   'usda'),
  ('apple',               1.49,  16.000, 'oz',   'usda'),
  ('onion',               0.99,   1.000, 'each', 'usda'),
  ('celery',              1.99,   1.000, 'each', 'usda'),
  ('chicken broth',       2.49,  32.000, 'oz',   'usda'),
  ('egg',                 3.99,  12.000, 'each', 'usda'),
  ('turkey',              1.49,  16.000, 'oz',   'usda'),
  ('hot sauce',           3.49,  12.000, 'oz',   'usda'),
  ('worcestershire sauce',2.99,  10.000, 'oz',   'usda'),
  ('garlic powder',       2.99,   3.120, 'oz',   'usda'),
  ('onion powder',        2.99,   2.620, 'oz',   'usda'),
  ('paprika',             2.99,   2.120, 'oz',   'usda'),
  ('oregano',             2.99,   0.750, 'oz',   'usda'),
  ('thyme',               2.99,   0.750, 'oz',   'usda'),
  ('potato',              3.99,  80.000, 'oz',   'usda'),
  ('sweet potato',        1.29,  16.000, 'oz',   'usda'),
  ('green bean',          1.99,  16.000, 'oz',   'usda'),
  ('pecan',               6.99,  16.000, 'oz',   'usda'),
  ('corn syrup',          3.49,  16.000, 'oz',   'usda')
ON CONFLICT (normalized_name) DO NOTHING;
