-- ============================================================================
-- Household Food Coverage Engine -- Spec v0.2
-- ============================================================================
-- §9 "resolution seam": maps raw recipe-ingredient text (from the JSON-LD
-- importer, lib/spoonassist/recipeImport.js) onto canonical_ingredients, via
-- two tables:
--
--   ingredient_aliases     -- normalized recipe-text phrase -> canonical_id
--   ingredient_conversions -- already existed (20260614000001), but was
--                              unseeded; this migration populates the
--                              recipe-unit -> canonical standard_unit bridge
--                              for the 25 MLE canonical ingredients so
--                              lib/spoonassist/ingredientResolver.js can
--                              convert "1 lb chicken thighs" -> 16 oz.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ingredient_aliases
-- ----------------------------------------------------------------------------
-- normalizeIngredient() (lib/spoonassist/priceEngine.js) + a substring match
-- against canonical_ingredients.name already resolves most recipe phrasing
-- (e.g. "chicken thigh" -> "Chicken Thighs", "1 bell pepper" -> "Bell
-- Peppers"). This table covers the remaining cases where the recipe-side
-- phrase and the canonical name share no common substring -- e.g. "frozen
-- vegetables" vs. "Frozen Mixed Vegetables", or pasta shapes ("penne",
-- "rotini") vs. the generic "Pasta" canonical.
CREATE TABLE IF NOT EXISTS public.ingredient_aliases (
  alias        text PRIMARY KEY,
  canonical_id text NOT NULL REFERENCES public.canonical_ingredients(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ingredient_aliases IS
  'normalizeIngredient()-normalized recipe-text phrase -> canonical_ingredients.id, for cases substring matching alone cannot bridge.';

ALTER TABLE public.ingredient_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ingredient_aliases" ON public.ingredient_aliases FOR SELECT USING (true);

INSERT INTO public.ingredient_aliases (alias, canonical_id) VALUES
  -- pasta shapes -> generic "Pasta" canonical
  ('penne',            'pasta'),
  ('rotini',           'pasta'),
  ('spaghetti',        'pasta'),
  ('macaroni',         'pasta'),
  ('fettuccine',       'pasta'),
  ('noodle',           'pasta'),
  -- allium phrasing that doesn't share a substring with "Onion"/"Garlic"
  ('scallion',         'onion'),
  ('green onion',      'onion'),
  ('spring onion',     'onion'),
  ('shallot',          'onion'),
  ('garlic clove',     'garlic'),
  -- "Frozen Mixed Vegetables" phrasing gaps
  ('frozen vegetable', 'frozen-mixed-veg'),
  ('frozen veggie',    'frozen-mixed-veg'),
  ('mixed veggie',     'frozen-mixed-veg')
ON CONFLICT (alias) DO NOTHING;

-- ----------------------------------------------------------------------------
-- ingredient_conversions: recipe-unit -> canonical standard_unit
-- ----------------------------------------------------------------------------
-- All 25 MLE canonical_ingredients use standard_unit 'oz' or 'each'
-- (20260614000003). Seed the generic weight/volume -> oz bridge for the
-- 'oz' ingredients, and a generic count -> each bridge for the 'each'
-- ingredients. cup/tbsp/tsp -> oz multipliers are volume-to-weight
-- approximations (is_estimate = true); lb/g/kg -> oz are exact weight
-- conversions.
INSERT INTO public.ingredient_conversions (canonical_id, from_unit, to_unit, multiplier, is_estimate, note)
SELECT ci.id, u.from_unit, 'oz', u.multiplier, u.is_estimate, u.note
FROM public.canonical_ingredients ci
CROSS JOIN (VALUES
  ('lb',   16.0,    false, '1 lb = 16 oz (exact weight conversion)'),
  ('g',     0.0353, false, '1 g = 0.0353 oz (exact weight conversion)'),
  ('kg',   35.27,   false, '1 kg = 35.27 oz (exact weight conversion)'),
  ('cup',   8.0,    true,  '1 cup ~= 8 oz (volume-to-weight approximation)'),
  ('tbsp',  0.5,    true,  '1 tbsp ~= 0.5 oz (volume-to-weight approximation)'),
  ('tsp',   0.167,  true,  '1 tsp ~= 0.167 oz (volume-to-weight approximation)')
) AS u(from_unit, multiplier, is_estimate, note)
WHERE ci.standard_unit = 'oz'
ON CONFLICT (canonical_id, from_unit, to_unit) DO NOTHING;

INSERT INTO public.ingredient_conversions (canonical_id, from_unit, to_unit, multiplier, is_estimate, note)
SELECT ci.id, u.from_unit, 'each', u.multiplier, true, u.note
FROM public.canonical_ingredients ci
CROSS JOIN (VALUES
  ('clove', 1.0, '1 clove ~= 1 each'),
  ('slice', 1.0, '1 slice ~= 1 each'),
  ('head',  1.0, '1 head ~= 1 each'),
  ('bunch', 1.0, '1 bunch ~= 1 each')
) AS u(from_unit, multiplier, note)
WHERE ci.standard_unit = 'each'
ON CONFLICT (canonical_id, from_unit, to_unit) DO NOTHING;
