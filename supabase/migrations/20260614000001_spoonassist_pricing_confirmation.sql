-- ============================================================================
-- SpoonAssist Pricing Spine + Community Confirmation Layer
-- ============================================================================
-- This migration adds a new, additive data layer for community-sourced
-- grocery price tracking and recipe-cost comparison. It does not modify
-- lib/spoonassist/instacart.js, lib/spoonassist/storeDiscovery.js, or the
-- existing ingredient_mappings / price_points tables from
-- 20260507000001_create_price_tables.sql (those remain the USDA-baseline +
-- cached-price tiers used by priceEngine.js's resolveIngredientPrice()).
--
-- FUTURE INTEGRATION POINT: when lib/spoonassist/instacart.js's retailer /
-- product responses are persisted, they should be written into
-- price_snapshots with source = 'instacart_api'. Not done in this migration.
--
-- Sections:
--   1. Schema (tables, indexes, RLS)
--   2. Confirmation layer (confirmed_prices view)
--   3. Math engine (get_recipe_ingredient_costs, get_recipe_cost_for_store)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- SECTION 1: Schema
-- ----------------------------------------------------------------------------

-- 1.1 stores -- physical store locations
CREATE TABLE IF NOT EXISTS public.stores (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  brand_parent text,
  address      text,
  -- SRID 4326 = WGS84 lat/long. Reserved for future radius search.
  lat_long     geography(Point, 4326),
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stores IS
  'Physical store locations. brand_parent groups locations of the same chain (e.g. all Newark ShopRites) for future rollups.';
COMMENT ON COLUMN public.stores.lat_long IS
  'Reserved for future radius search; nullable until geocoding is wired up.';


-- 1.2 canonical_ingredients -- the clean, normalized public-good layer that
-- recipes and store SKUs both map to.
CREATE TABLE IF NOT EXISTS public.canonical_ingredients (
  id            text PRIMARY KEY,
  name          text NOT NULL,
  category      text,
  -- The canonical base unit everything normalizes through (e.g. 'lb', 'oz').
  standard_unit text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.canonical_ingredients IS
  'Clean, normalized ingredient catalog. standard_unit is the base unit the two-hop conversion bridge normalizes through.';


-- 1.3 ingredient_conversions -- the conversion bridge: maps any unit to/from
-- a canonical ingredient's standard_unit.
CREATE TABLE IF NOT EXISTS public.ingredient_conversions (
  canonical_id text    NOT NULL REFERENCES public.canonical_ingredients(id) ON DELETE CASCADE,
  from_unit    text    NOT NULL,
  to_unit      text    NOT NULL,
  -- Value to turn 1 from_unit into to_unit (to_unit_qty = from_unit_qty * multiplier).
  multiplier   numeric NOT NULL,
  -- TRUE for count-based/averaged conversions (e.g. "1 medium onion ~= 0.33 lb").
  is_estimate  boolean NOT NULL DEFAULT false,
  note         text,
  PRIMARY KEY (canonical_id, from_unit, to_unit)
);

COMMENT ON TABLE public.ingredient_conversions IS
  'Two-hop conversion bridge: recipe unit -> canonical standard_unit -> store package unit. is_estimate=true marks averaged/count-based conversions that carry real error.';


-- 1.4 store_skus -- the messy translation layer: a specific store's product,
-- mapped back to a canonical ingredient (nullable until mapped).
CREATE TABLE IF NOT EXISTS public.store_skus (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id           uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  canonical_id       text REFERENCES public.canonical_ingredients(id) ON DELETE SET NULL,
  store_internal_sku text,
  raw_name           text,
  unit_size          numeric,
  unit_type          text,
  requires_mapping   boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  -- Guard at the schema level; the cost functions ALSO defend against
  -- null/zero at query time (a row could still have unit_size = NULL).
  CONSTRAINT store_skus_unit_size_positive CHECK (unit_size IS NULL OR unit_size > 0)
);

COMMENT ON TABLE public.store_skus IS
  'A specific store''s product mapped to a canonical ingredient. canonical_id NULL = unmapped (requires_mapping should be true).';
COMMENT ON COLUMN public.store_skus.unit_size IS
  'Package size in unit_type, e.g. 3.0 (lb). Must be > 0 if set.';

CREATE INDEX IF NOT EXISTS idx_store_skus_store_id     ON public.store_skus (store_id);
CREATE INDEX IF NOT EXISTS idx_store_skus_canonical_id ON public.store_skus (canonical_id);


-- 1.5 price_snapshots -- highest-velocity table: one row = one observed
-- price at one moment.
CREATE TABLE IF NOT EXISTS public.price_snapshots (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_sku_id uuid    NOT NULL REFERENCES public.store_skus(id) ON DELETE CASCADE,
  price        numeric NOT NULL CHECK (price >= 0),
  price_type   text    NOT NULL DEFAULT 'shelf'
                  CHECK (price_type IN ('shelf', 'member', 'sale', 'receipt')),
  is_sale      boolean NOT NULL DEFAULT false,
  -- Sale end date if known -- lets confirmed_prices expire sales precisely
  -- instead of guessing from freshness alone.
  valid_until  timestamptz,
  source       text NOT NULL
                  CHECK (source IN ('user_manual', 'user_photo', 'instacart_api', 'web_scraper')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  captured_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.price_snapshots IS
  'One observed price at one moment, from any source. confirmed_prices aggregates these into trusted per-store prices.';
COMMENT ON COLUMN public.price_snapshots.price_type IS
  'shelf | member | sale | receipt. member/receipt prices are not universal -- excluded from confirmed_prices by default (see Section 2).';
COMMENT ON COLUMN public.price_snapshots.source IS
  'user_manual | user_photo | instacart_api | web_scraper. FUTURE: lib/spoonassist/instacart.js results land here with source = ''instacart_api''.';

CREATE INDEX IF NOT EXISTS idx_price_snapshots_store_sku_captured
  ON public.price_snapshots (store_sku_id, captured_at DESC);


-- 1.6 recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  source_url text,
  servings   integer NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 1.7 recipe_ingredients
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id    uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  canonical_id text NOT NULL REFERENCES public.canonical_ingredients(id),
  quantity     numeric NOT NULL,
  unit         text NOT NULL,
  -- Original recipe line, e.g. "2 1/2 lbs yellow onions, chopped".
  raw_text     text
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients (recipe_id);


-- 1.8 receipt_submissions -- staging for the photo-capture pipeline. OCR
-- output is NOT trusted directly into price_snapshots.
CREATE TABLE IF NOT EXISTS public.receipt_submissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id     uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  image_url    text NOT NULL,
  status       text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processed', 'failed')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

COMMENT ON TABLE public.receipt_submissions IS
  'Staging table for the photo-capture pipeline. A future OCR/review step promotes parsed rows into price_snapshots (source=''user_photo'') and sets status=''processed''.';


-- ----------------------------------------------------------------------------
-- 1.9 Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.stores                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_ingredients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_skus             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_snapshots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_submissions    ENABLE ROW LEVEL SECURITY;

-- Canonical catalog, conversion bridge, store directory, and recipes are the
-- free-tier public good -- no sensitive data, readable by anyone.
CREATE POLICY "Public read canonical_ingredients"  ON public.canonical_ingredients  FOR SELECT USING (true);
CREATE POLICY "Public read ingredient_conversions"  ON public.ingredient_conversions FOR SELECT USING (true);
CREATE POLICY "Public read stores"                  ON public.stores                 FOR SELECT USING (true);
CREATE POLICY "Public read recipes"                 ON public.recipes                FOR SELECT USING (true);
CREATE POLICY "Public read recipe_ingredients"      ON public.recipe_ingredients     FOR SELECT USING (true);

-- store_skus: public read (needed to resolve recipe costs). Writes are a
-- future admin/mapping-tool concern -- no INSERT/UPDATE policy yet, so only
-- service_role (which bypasses RLS) can write.
CREATE POLICY "Public read store_skus" ON public.store_skus FOR SELECT USING (true);

-- price_snapshots: public read (this is the raw data confirmed_prices is
-- built from), authenticated insert. submitted_by must match the submitter
-- or be left NULL (anonymous-ish submission).
-- TODO: finer-grained policy (rate limiting, per-user submission caps,
-- moderation) once the submission UI exists.
CREATE POLICY "Public read price_snapshots" ON public.price_snapshots FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit price snapshots"
  ON public.price_snapshots FOR INSERT TO authenticated
  WITH CHECK (submitted_by IS NULL OR submitted_by = auth.uid());

-- receipt_submissions: users manage only their own submissions.
-- TODO: add a service-role/admin policy for the OCR processing worker to
-- read pending rows and update status -- left for the processing-worker design.
CREATE POLICY "Users can view their own receipt submissions"
  ON public.receipt_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own receipts"
  ON public.receipt_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- SECTION 2: The Confirmation Layer
-- ----------------------------------------------------------------------------
-- A single price_snapshot is a *claim*. Agreement across snapshots from
-- multiple shoppers is a *fact*. confirmed_prices turns claims into a single
-- trusted price per store_sku_id:
--
--   1. Only snapshots from the last 14 days are considered (freshness window).
--   2. Only price_type IN ('shelf', 'sale') are considered. 'member' and
--      'receipt' prices are NOT universal (loyalty-card or single-receipt
--      dependent), so they're excluded from the public confirmed price by
--      default. Revisit this if the UI ever distinguishes "with card" prices.
--   3. Snapshots are clustered by rounding price to the nearest $0.10 --
--      prices within ~5 cents of each other are treated as the same claim.
--      This absorbs minor entry noise (e.g. $2.49 vs $2.50) without letting
--      a wildly different single entry ($99, $0.01) merge into a real cluster.
--   4. The cluster with the most snapshots wins (the mode). Ties are broken
--      by recency -- the cluster whose most recent snapshot is newer wins,
--      since a growing cluster may be a price change in progress.
--   5. The *displayed* confirmed_price is the most common exact price within
--      the winning cluster (not the rounded bucket value), so "$2.49" stays
--      "$2.49" rather than becoming "$2.50".
--
-- Outlier/troll resistance: a single $99 or $0.01 entry rounds into its own
-- cluster of size 1, which can never beat a real cluster of size >= 2 -- it
-- cannot move the confirmed price.
--
-- Location separation is automatic: store_skus are per-store, so
-- confirmed_prices is inherently per-store -- one location's snapshots never
-- confirm another location's price.
-- ----------------------------------------------------------------------------

DROP VIEW IF EXISTS public.confirmed_prices;

CREATE VIEW public.confirmed_prices AS
WITH eligible AS (
  SELECT
    store_sku_id,
    price,
    captured_at,
    -- Cluster key: round to the nearest $0.10 for tolerance-banding.
    round(price / 0.10) * 0.10 AS cluster_key
  FROM public.price_snapshots
  WHERE price_type IN ('shelf', 'sale')
    AND captured_at >= now() - interval '14 days'
),
clusters AS (
  SELECT
    store_sku_id,
    cluster_key,
    count(*)         AS confirmation_count,
    max(captured_at) AS last_seen
  FROM eligible
  GROUP BY store_sku_id, cluster_key
),
winning_cluster AS (
  SELECT store_sku_id, cluster_key, confirmation_count, last_seen
  FROM (
    SELECT
      c.*,
      row_number() OVER (
        PARTITION BY store_sku_id
        ORDER BY confirmation_count DESC, last_seen DESC
      ) AS rnk
    FROM clusters c
  ) ranked
  WHERE rnk = 1
),
modal_price AS (
  -- Within the winning cluster, the displayed price is the most frequent
  -- exact price (ties broken by most-recent, then lowest price).
  SELECT
    wc.store_sku_id,
    wc.confirmation_count,
    wc.last_seen,
    e.price,
    row_number() OVER (
      PARTITION BY wc.store_sku_id
      ORDER BY count(*) DESC, max(e.captured_at) DESC, e.price ASC
    ) AS rnk
  FROM winning_cluster wc
  JOIN eligible e
    ON e.store_sku_id = wc.store_sku_id
   AND e.cluster_key  = wc.cluster_key
  GROUP BY wc.store_sku_id, wc.confirmation_count, wc.last_seen, e.price
)
SELECT
  store_sku_id,
  price AS confirmed_price,
  confirmation_count,
  last_seen,
  -- Staleness threshold (7 days) is intentionally shorter than the 14-day
  -- inclusion window: a price can be "best available" while flagged as aging.
  (last_seen < now() - interval '7 days') AS is_stale
FROM modal_price
WHERE rnk = 1;

COMMENT ON VIEW public.confirmed_prices IS
  'Per-store_sku confirmed price derived from community price_snapshots via clustering + corroboration-count voting. See migration comments for the full algorithm.';


-- ----------------------------------------------------------------------------
-- SECTION 3: The Math Engine
-- ----------------------------------------------------------------------------

-- 3.1 get_recipe_ingredient_costs -- one row per recipe ingredient, with a
-- resolution status. This is the diagnostic layer the UI uses to explain
-- what's missing and why.
--
-- Per ingredient:
--   - Find the target store's store_sku for this canonical ingredient, and
--     its confirmed_price from confirmed_prices.
--   - Two-hop conversion through canonical_ingredients.standard_unit:
--       Hop 1 (recipe unit -> standard unit): factor 1 if units match,
--         else looked up in ingredient_conversions. Missing row -> NULL.
--       Hop 2 (standard unit -> store unit_type): factor 1 if units match,
--         else looked up in ingredient_conversions. Missing row -> NULL.
--   - NO COALESCE(..., 1.0) fallback: a missing conversion hop produces a
--     NULL factor, which (by design) makes item_cost NULL rather than
--     silently treating the conversion as 1:1.
--   - unit_size NULL or <= 0 is treated as unresolved (no_conversion), not
--     a divide error -- store_skus.unit_size already has a CHECK(> 0), this
--     is the query-time defense the brief requires in addition to that.
--
-- status:
--   'ok'            confirmed price exists AND both hops resolved AND
--                    unit_size is valid -> item_cost computed.
--   'no_price'      no confirmed price for this canonical at this store
--                    (data-capture gap).
--   'no_conversion' price exists, but a conversion hop (or unit_size) is
--                    missing (seed-a-multiplier / store-data gap).
--
-- confidence: 'estimated' if any conversion hop actually used in the path
-- has is_estimate = true (e.g. count -> weight averages), else 'exact'.
-- NULL when status != 'ok' (no completed path to qualify).
--
-- Assumes at most one store_sku per (store_id, canonical_id) -- the MVP
-- mapping model (one product per canonical ingredient per store location).
-- ----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_recipe_ingredient_costs(uuid, uuid);

CREATE FUNCTION public.get_recipe_ingredient_costs(
  target_recipe_id uuid,
  target_store_id  uuid
)
RETURNS TABLE (
  recipe_ingredient_id uuid,
  canonical_id         text,
  raw_text             text,
  status               text,
  confidence           text,
  item_cost            numeric,
  confirmation_count   integer
)
LANGUAGE sql
STABLE
AS $$
  WITH ri AS (
    SELECT
      r.id AS recipe_ingredient_id,
      r.canonical_id,
      r.raw_text,
      r.quantity,
      r.unit,
      ci.standard_unit
    FROM public.recipe_ingredients r
    JOIN public.canonical_ingredients ci ON ci.id = r.canonical_id
    WHERE r.recipe_id = target_recipe_id
  ),
  sku AS (
    SELECT
      ri.recipe_ingredient_id,
      ss.id        AS store_sku_id,
      ss.unit_size,
      ss.unit_type
    FROM ri
    LEFT JOIN public.store_skus ss
      ON ss.store_id     = target_store_id
     AND ss.canonical_id = ri.canonical_id
  ),
  priced AS (
    SELECT
      sku.recipe_ingredient_id,
      sku.store_sku_id,
      sku.unit_size,
      sku.unit_type,
      cp.confirmed_price,
      cp.confirmation_count
    FROM sku
    LEFT JOIN public.confirmed_prices cp ON cp.store_sku_id = sku.store_sku_id
  ),
  hops AS (
    SELECT
      p.recipe_ingredient_id,
      p.unit_size,
      p.unit_type,
      p.confirmed_price,
      p.confirmation_count,
      ri.canonical_id,
      ri.raw_text,
      ri.quantity,
      ri.unit         AS recipe_unit,
      ri.standard_unit,
      -- Hop 1: recipe unit -> standard unit
      CASE
        WHEN ri.unit = ri.standard_unit THEN 1
        ELSE (
          SELECT ic.multiplier FROM public.ingredient_conversions ic
          WHERE ic.canonical_id = ri.canonical_id
            AND ic.from_unit    = ri.unit
            AND ic.to_unit      = ri.standard_unit
        )
      END AS hop1_factor,
      CASE
        WHEN ri.unit = ri.standard_unit THEN false
        ELSE COALESCE((
          SELECT ic.is_estimate FROM public.ingredient_conversions ic
          WHERE ic.canonical_id = ri.canonical_id
            AND ic.from_unit    = ri.unit
            AND ic.to_unit      = ri.standard_unit
        ), false)
      END AS hop1_is_estimate,
      -- Hop 2: standard unit -> store unit_type
      CASE
        WHEN p.unit_type IS NULL THEN NULL
        WHEN p.unit_type = ri.standard_unit THEN 1
        ELSE (
          SELECT ic.multiplier FROM public.ingredient_conversions ic
          WHERE ic.canonical_id = ri.canonical_id
            AND ic.from_unit    = ri.standard_unit
            AND ic.to_unit      = p.unit_type
        )
      END AS hop2_factor,
      CASE
        WHEN p.unit_type IS NULL THEN false
        WHEN p.unit_type = ri.standard_unit THEN false
        ELSE COALESCE((
          SELECT ic.is_estimate FROM public.ingredient_conversions ic
          WHERE ic.canonical_id = ri.canonical_id
            AND ic.from_unit    = ri.standard_unit
            AND ic.to_unit      = p.unit_type
        ), false)
      END AS hop2_is_estimate
    FROM priced p
    JOIN ri ON ri.recipe_ingredient_id = p.recipe_ingredient_id
  )
  SELECT
    h.recipe_ingredient_id,
    h.canonical_id,
    h.raw_text,
    CASE
      WHEN h.confirmed_price IS NULL THEN 'no_price'
      WHEN h.hop1_factor IS NULL OR h.hop2_factor IS NULL THEN 'no_conversion'
      WHEN h.unit_size IS NULL OR h.unit_size <= 0 THEN 'no_conversion'
      ELSE 'ok'
    END AS status,
    CASE
      WHEN h.confirmed_price IS NULL THEN NULL
      WHEN h.hop1_factor IS NULL OR h.hop2_factor IS NULL THEN NULL
      WHEN h.unit_size IS NULL OR h.unit_size <= 0 THEN NULL
      WHEN h.hop1_is_estimate OR h.hop2_is_estimate THEN 'estimated'
      ELSE 'exact'
    END AS confidence,
    CASE
      WHEN h.confirmed_price IS NOT NULL
       AND h.hop1_factor IS NOT NULL
       AND h.hop2_factor IS NOT NULL
       AND h.unit_size IS NOT NULL AND h.unit_size > 0
      THEN round((h.quantity * h.hop1_factor * h.hop2_factor / h.unit_size) * h.confirmed_price, 2)
      ELSE NULL
    END AS item_cost,
    h.confirmation_count
  FROM hops h;
$$;

COMMENT ON FUNCTION public.get_recipe_ingredient_costs(uuid, uuid) IS
  'Per-ingredient cost diagnostic: status (ok/no_price/no_conversion), confidence (exact/estimated), item_cost. See migration comments for the full two-hop conversion algorithm.';

GRANT EXECUTE ON FUNCTION public.get_recipe_ingredient_costs(uuid, uuid) TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 3.2 get_recipe_cost_for_store -- aggregates get_recipe_ingredient_costs into
-- one summary row. is_basket_complete is TRUE only if EVERY ingredient
-- resolved to 'ok'; total_estimated_cost is explicitly NULL otherwise (not
-- relying on implicit NULL propagation through SUM), so a store can never
-- "win" a comparison by lacking data on some ingredients.
-- ----------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.get_recipe_cost_for_store(uuid, uuid);

CREATE FUNCTION public.get_recipe_cost_for_store(
  target_recipe_id uuid,
  target_store_id  uuid
)
RETURNS TABLE (
  recipe_id            uuid,
  store_id             uuid,
  is_basket_complete   boolean,
  total_estimated_cost numeric,
  items_ok             integer,
  items_no_price       integer,
  items_no_conversion  integer,
  items_total          integer,
  has_estimated_items  boolean
)
LANGUAGE sql
STABLE
AS $$
  WITH costs AS (
    SELECT * FROM public.get_recipe_ingredient_costs(target_recipe_id, target_store_id)
  )
  SELECT
    target_recipe_id,
    target_store_id,
    (count(*) FILTER (WHERE status <> 'ok') = 0) AS is_basket_complete,
    -- Explicit CASE, not implicit NULL propagation: a future edit that
    -- changes how SUM handles nulls/empties can't accidentally produce a
    -- false total for an incomplete basket.
    CASE
      WHEN count(*) FILTER (WHERE status <> 'ok') = 0 THEN sum(item_cost)
      ELSE NULL
    END AS total_estimated_cost,
    count(*) FILTER (WHERE status = 'ok')::int             AS items_ok,
    count(*) FILTER (WHERE status = 'no_price')::int       AS items_no_price,
    count(*) FILTER (WHERE status = 'no_conversion')::int  AS items_no_conversion,
    count(*)::int                                          AS items_total,
    bool_or(status = 'ok' AND confidence = 'estimated')    AS has_estimated_items
  FROM costs;
$$;

COMMENT ON FUNCTION public.get_recipe_cost_for_store(uuid, uuid) IS
  'Recipe total cost at a store. total_estimated_cost is NULL unless is_basket_complete -- a store can never win by lacking data on some ingredients.';

GRANT EXECUTE ON FUNCTION public.get_recipe_cost_for_store(uuid, uuid) TO anon, authenticated;
