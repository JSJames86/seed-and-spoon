-- ============================================================================
-- Pricing Provider Abstraction (Phase 1) -- price_quotes
-- ============================================================================
-- Write-through cache for lib/pricing/*: every quote a live/authoritative
-- provider (KrogerProvider, UsdaEstimateProvider) actually returns is cached
-- here, so cachedQuoteProvider (lib/pricing/providers/cachedQuote.ts) can
-- still answer when that provider is slow or down. It's also the single
-- landing table for community/scraper sources -- Phase 3's receipt pipeline
-- and any future scraper just INSERT here; no resolver changes needed.
--
-- product_id is TEXT, not a FK to a `products` table -- this repo has no
-- product catalog table. It's the same normalized-ingredient-name key
-- ingredient_mappings.normalized_name / price_points.ingredient already use
-- (see lib/spoonassist/priceEngine.js normalizeIngredient()).
--
-- price/unit store a PER-UNIT rate ($/oz, or $/each when the ingredient's
-- unit doesn't convert to oz), not a price scoped to one recipe's quantity --
-- see lib/pricing/cache.ts toUnitPriceRow()/fromUnitPriceRow() for the
-- conversion. This is what makes a cached row reusable across requests that
-- want different quantities of the same ingredient.
--
-- Deliberately does NOT replace or migrate ingredient_mappings/price_points
-- (20260507000001) or the dormant stores/canonical_ingredients/store_skus/
-- price_snapshots/confirmed_prices spine (20260614000001) -- see the Phase 1
-- pricing-provider-abstraction PR description for why a third pricing
-- schema exists alongside those two rather than replacing either. The
-- backfill below (Section 2) copies price_points/ingredient_mappings rows in
-- as historical price_quotes so the new cache isn't empty on day one; both
-- source tables are left untouched.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- SECTION 1: Schema
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.price_quotes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  chain_id   text NOT NULL,
  store_id   text,
  price      numeric(10, 4) NOT NULL CHECK (price >= 0),
  unit       text NOT NULL DEFAULT 'each' CHECK (unit IN ('oz', 'each')),
  source     text NOT NULL CHECK (source IN (
               'kroger_api', 'walmart_affiliate', 'usda_estimate',
               'community_receipt', 'community_manual', 'scraper', 'estimate'
             )),
  confidence numeric(3, 2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  as_of      timestamptz NOT NULL,
  meta       jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.price_quotes IS
  'Write-through cache + landing table for the pluggable pricing providers in lib/pricing/. price/unit are a per-unit rate ($/oz or $/each), not scoped to one recipe quantity.';
COMMENT ON COLUMN public.price_quotes.product_id IS
  'Normalized ingredient name -- no products table exists in this repo. Matches ingredient_mappings.normalized_name / price_points.ingredient.';
COMMENT ON COLUMN public.price_quotes.chain_id IS
  'store.id from lib/spoonassist/priceEngine.js getStoresByZip()/getStoreById() (e.g. "walmart", "kroger-70100737").';

CREATE INDEX IF NOT EXISTS idx_price_quotes_product_chain_asof
  ON public.price_quotes (product_id, chain_id, as_of DESC);


-- ----------------------------------------------------------------------------
-- SECTION 2: Backfill from the existing cache/community tables
-- ----------------------------------------------------------------------------
-- ingredient_mappings rows become 'scraper'-sourced quotes (see
-- lib/pricing/providers/kroger.ts / registry.ts comments: this table is a
-- hand/server-maintained cache, ranked above raw community submissions but
-- below live API data -- 'scraper' is the closest confidence slot for that).
-- Priced against chain_id 'usda-baseline' (chain-agnostic) so it's available
-- to any store via the resolver's multiplier step.
INSERT INTO public.price_quotes (product_id, chain_id, store_id, price, unit, source, confidence, as_of, meta)
SELECT
  normalized_name,
  'usda-baseline',
  NULL,
  round((pkg_price / GREATEST(pkg_qty, 0.001))::numeric, 4),
  'oz',
  'scraper',
  0.75,
  COALESCE(updated_at, created_at, now()),
  jsonb_build_object('backfilled_from', 'ingredient_mappings', 'pkg_qty', pkg_qty, 'pkg_unit', pkg_unit)
FROM public.ingredient_mappings
WHERE pkg_unit IN ('oz')
ON CONFLICT DO NOTHING;

-- price_points rows (community submissions) become 'community_manual' quotes.
INSERT INTO public.price_quotes (product_id, chain_id, store_id, price, unit, source, confidence, as_of, meta)
SELECT
  ingredient,
  'usda-baseline',
  NULL,
  round(((price_cents / 100.0) / GREATEST(pkg_qty, 0.001))::numeric, 4),
  'oz',
  'community_manual',
  0.65,
  created_at,
  jsonb_build_object('backfilled_from', 'price_points', 'store_name', store_name, 'zip_prefix', zip_prefix, 'pkg_qty', pkg_qty, 'pkg_unit', pkg_unit)
FROM public.price_points
WHERE pkg_unit IN ('oz')
ON CONFLICT DO NOTHING;

-- Rows whose pkg_unit is 'each' (not oz-convertible) are skipped by the two
-- backfills above -- cachedQuoteProvider will simply have no cached row for
-- those until the next live/estimate fetch write-through-caches one at
-- 'each' granularity. Not worth a second migration pass for a one-time seed.


-- ----------------------------------------------------------------------------
-- SECTION 3: Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.price_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read price_quotes"
  ON public.price_quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role insert price_quotes"
  ON public.price_quotes FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
