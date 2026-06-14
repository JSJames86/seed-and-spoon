-- ============================================================================
-- SpoonAssist Pricing Spine -- Seed Data
-- ============================================================================
-- SYNTHETIC TEST DATA ONLY. Every price below is made up to exercise the
-- confirmation-layer and math-engine logic added in
-- 20260614000001_spoonassist_pricing_confirmation.sql. None of these are
-- real retail prices -- do not use them for anything user-facing.
--
-- Scenario: "French Onion Soup", priced at two stores in ZIP 07103
-- (ShopRite and Price Rite). The data is deliberately rigged so that:
--
--   - ShopRite onions have 5 agreeing snapshots + 1 troll snapshot at $99,
--     proving confirmed_prices clusters by mode and ignores the outlier.
--   - gruyere-cheese has NO ingredient_conversions row for cup -> lb, so it
--     hits 'no_conversion' at ShopRite (price exists, conversion doesn't).
--   - Price Rite has a gruyere store_sku but NO price_snapshots for it, so
--     it hits 'no_price' there instead.
--
-- Expected result: BOTH stores are incomplete (is_basket_complete = false,
-- total_estimated_cost = NULL) for two different reasons -- neither store
-- can be crowned cheapest. See the verification queries at the bottom.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Canonical ingredients
-- ----------------------------------------------------------------------------
INSERT INTO public.canonical_ingredients (id, name, category, standard_unit) VALUES
  ('yellow-onions',  'Yellow Onions',    'Produce', 'lb'),
  ('unsalted-butter','Unsalted Butter',  'Dairy',   'lb'),
  ('beef-broth',     'Beef Broth',       'Pantry',  'oz'),
  ('gruyere-cheese', 'Gruyere Cheese',   'Dairy',   'lb'),
  ('baguette',       'Baguette',         'Bakery',  'count')
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- Ingredient conversions (deliberately incomplete -- see header)
-- ----------------------------------------------------------------------------
INSERT INTO public.ingredient_conversions (canonical_id, from_unit, to_unit, multiplier, is_estimate, note) VALUES
  -- Count -> weight average. Recipe calls for onions by count; this is an
  -- estimate, so any cost using it is flagged confidence = 'estimated'.
  ('yellow-onions',   'count', 'lb', 0.33,   true,  '1 medium onion is approximately 1/3 lb (average, not exact)'),
  -- Volume -> weight for butter. Exact (a stick of butter is 8 tbsp = 0.5 lb).
  ('unsalted-butter', 'tbsp',  'lb', 0.0625, false, '1 tbsp unsalted butter ~= 0.0625 lb'),
  -- Volume -> volume for broth. Exact (1 cup = 8 fl oz).
  ('beef-broth',      'cup',   'oz', 8,      false, '1 cup = 8 fl oz')
  -- NOTE: gruyere-cheese has NO cup -> lb conversion seeded on purpose.
  -- The recipe calls for it in cups (grated); stores sell it by the lb.
  -- This is the missing bridge that proves NULL (not 1.0) propagates and
  -- flags the basket incomplete via 'no_conversion'.
  --
  -- NOTE: baguette needs no conversion row -- recipe unit 'count' equals
  -- canonical standard_unit 'count' equals store unit_type 'count', so both
  -- hops resolve to factor 1 trivially.
ON CONFLICT (canonical_id, from_unit, to_unit) DO NOTHING;


-- ----------------------------------------------------------------------------
-- Recipe: French Onion Soup
-- ----------------------------------------------------------------------------
INSERT INTO public.recipes (id, title, servings)
VALUES ('11111111-1111-1111-1111-111111111111', 'French Onion Soup', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recipe_ingredients (recipe_id, canonical_id, quantity, unit, raw_text) VALUES
  ('11111111-1111-1111-1111-111111111111', 'yellow-onions',   3,  'count', '3 medium yellow onions, thinly sliced'),
  ('11111111-1111-1111-1111-111111111111', 'unsalted-butter', 2,  'tbsp',  '2 tablespoons unsalted butter'),
  ('11111111-1111-1111-1111-111111111111', 'beef-broth',      4,  'cup',   '4 cups beef broth'),
  ('11111111-1111-1111-1111-111111111111', 'gruyere-cheese',  1,  'cup',   '1 cup grated Gruyere cheese'),
  ('11111111-1111-1111-1111-111111111111', 'baguette',        1,  'count', '1 baguette, sliced');


-- ----------------------------------------------------------------------------
-- Stores: ShopRite and Price Rite, both in Newark NJ 07103
-- ----------------------------------------------------------------------------
INSERT INTO public.stores (id, name, brand_parent, address) VALUES
  ('22222222-2222-2222-2222-222222222222', 'ShopRite',   'ShopRite',   '700 Springfield Ave, Newark, NJ 07103'),
  ('33333333-3333-3333-3333-333333333333', 'Price Rite', 'Price Rite', '635 Springfield Ave, Newark, NJ 07103')
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- ShopRite SKUs (all 5 canonical ingredients mapped)
-- ----------------------------------------------------------------------------
INSERT INTO public.store_skus (id, store_id, canonical_id, store_internal_sku, raw_name, unit_size, unit_type) VALUES
  ('a1000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'yellow-onions',   'SR-ONION-3LB',  'Bowl & Basket Yellow Onions 3lb bag',     3,   'lb'),
  ('a1000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'unsalted-butter', 'SR-BUTTER-1LB', 'Bowl & Basket Unsalted Butter 1lb',       1,   'lb'),
  ('a1000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'beef-broth',      'SR-BROTH-32OZ', 'Swanson Beef Broth 32oz',                 32,  'oz'),
  ('a1000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'gruyere-cheese',  'SR-GRUYERE',    'Boar''s Head Gruyere Cheese (sold by lb)', 0.5, 'lb'),
  ('a1000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'baguette',        'SR-BAGUETTE',   'Bowl & Basket French Baguette',           1,   'count')
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- Price Rite SKUs (gruyere mapped but NO price ever submitted for it)
-- ----------------------------------------------------------------------------
INSERT INTO public.store_skus (id, store_id, canonical_id, store_internal_sku, raw_name, unit_size, unit_type) VALUES
  ('b2000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'yellow-onions',   'PR-ONION-3LB',  'Price Rite Yellow Onions 3lb bag',          3,   'lb'),
  ('b2000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'unsalted-butter', 'PR-BUTTER-1LB', 'Price Rite Unsalted Butter 1lb',            1,   'lb'),
  ('b2000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'beef-broth',      'PR-BROTH-32OZ', 'Price Rite Beef Broth 32oz',                 32,  'oz'),
  ('b2000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'gruyere-cheese',  'PR-GRUYERE',    'Price Rite Gruyere Cheese (sold by lb)',    0.5, 'lb'),
  ('b2000000-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'baguette',        'PR-BAGUETTE',   'Price Rite French Baguette',                1,   'count')
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- ShopRite price snapshots
-- ----------------------------------------------------------------------------
-- Onions: 5 agreeing snapshots (mode = $2.49, 3 of 5) + 1 troll at $99.
-- All round to the $2.50 cluster except the troll, which forms its own
-- cluster of size 1 and loses -> confirmation_count = 5, confirmed_price = 2.49.
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 2.49, 'shelf', 'user_manual', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000001', 2.49, 'shelf', 'user_manual', now() - interval '2 days'),
  ('a1000000-0000-0000-0000-000000000001', 2.49, 'shelf', 'user_manual', now() - interval '3 days'),
  ('a1000000-0000-0000-0000-000000000001', 2.50, 'shelf', 'user_manual', now() - interval '4 days'),
  ('a1000000-0000-0000-0000-000000000001', 2.48, 'shelf', 'user_manual', now() - interval '5 days'),
  ('a1000000-0000-0000-0000-000000000001', 99.00,'shelf', 'user_manual', now() - interval '6 days');

-- Butter: 2 agreeing snapshots at $4.99.
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('a1000000-0000-0000-0000-000000000002', 4.99, 'shelf', 'user_manual', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000002', 4.99, 'shelf', 'user_manual', now() - interval '3 days');

-- Beef broth: 2 agreeing snapshots at $1.89.
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('a1000000-0000-0000-0000-000000000003', 1.89, 'shelf', 'user_manual', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000003', 1.89, 'shelf', 'user_manual', now() - interval '4 days');

-- Gruyere: priced at ShopRite (so this proves no_conversion, not no_price).
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('a1000000-0000-0000-0000-000000000004', 7.99, 'shelf', 'user_manual', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000004', 7.99, 'shelf', 'user_manual', now() - interval '5 days');

-- Baguette: 2 agreeing snapshots at $2.99.
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('a1000000-0000-0000-0000-000000000005', 2.99, 'shelf', 'user_manual', now() - interval '1 day'),
  ('a1000000-0000-0000-0000-000000000005', 2.99, 'shelf', 'user_manual', now() - interval '2 days');


-- ----------------------------------------------------------------------------
-- Price Rite price snapshots -- everything EXCEPT gruyere
-- ----------------------------------------------------------------------------
INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('b2000000-0000-0000-0000-000000000001', 2.29, 'shelf', 'user_manual', now() - interval '1 day'),
  ('b2000000-0000-0000-0000-000000000001', 2.29, 'shelf', 'user_manual', now() - interval '2 days'),
  ('b2000000-0000-0000-0000-000000000001', 2.29, 'shelf', 'user_manual', now() - interval '3 days');

INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('b2000000-0000-0000-0000-000000000002', 4.49, 'shelf', 'user_manual', now() - interval '1 day'),
  ('b2000000-0000-0000-0000-000000000002', 4.49, 'shelf', 'user_manual', now() - interval '3 days');

INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('b2000000-0000-0000-0000-000000000003', 1.79, 'shelf', 'user_manual', now() - interval '1 day'),
  ('b2000000-0000-0000-0000-000000000003', 1.79, 'shelf', 'user_manual', now() - interval '4 days');

-- NOTE: NO snapshots for store_sku b2000000-...-000000000004 (Price Rite
-- gruyere) -- this is the deliberate 'no_price' gap.

INSERT INTO public.price_snapshots (store_sku_id, price, price_type, source, captured_at) VALUES
  ('b2000000-0000-0000-0000-000000000005', 2.49, 'shelf', 'user_manual', now() - interval '1 day'),
  ('b2000000-0000-0000-0000-000000000005', 2.49, 'shelf', 'user_manual', now() - interval '2 days');


-- ============================================================================
-- Verification queries (run these after seeding)
-- ============================================================================
-- select * from get_recipe_cost_for_store('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'); -- ShopRite
-- select * from get_recipe_cost_for_store('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'); -- Price Rite
-- select * from get_recipe_ingredient_costs('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'); -- ShopRite detail
--
-- "Fix it and watch it resolve" follow-up (do NOT run as part of this seed):
--   1. INSERT INTO ingredient_conversions (canonical_id, from_unit, to_unit, multiplier, is_estimate, note)
--      VALUES ('gruyere-cheese', 'cup', 'lb', 0.25, true, '1 cup grated Gruyere ~= 1/4 lb (average)');
--   2. INSERT INTO price_snapshots (store_sku_id, price, price_type, source)
--      VALUES ('b2000000-0000-0000-0000-000000000004', 8.49, 'shelf', 'user_manual');
--   After both, both stores should flip to is_basket_complete = true with
--   real totals.
-- ============================================================================
