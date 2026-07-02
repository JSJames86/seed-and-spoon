-- ============================================================================
-- SpoonAssist v2 -- Recipe Catalog (Phase 2)
-- ============================================================================
-- Extends the existing recipes/recipe_ingredients pricing spine (from
-- 20260614000001_spoonassist_pricing_confirmation.sql) with the fields the
-- v2 discovery grid + recipe detail page need: slug, description, image_url,
-- total_minutes, dietary_tags, is_published, author_id.
--
-- Two kinds of `recipes` rows now share this table, distinguished by
-- `nutrition`:
--
--   - MLE/coverage-engine corpus (nutrition IS NOT NULL, seeded in
--     20260614000003): recipe_ingredients.quantity/unit for these rows MUST
--     stay expressed in the ingredient's canonical_ingredients.standard_unit
--     -- shortfall() compares them directly against pantry_items.remaining,
--     per the invariant documented in 20260614000002. Do not alter that.
--   - Editorial catalog recipes (nutrition IS NULL -- this migration's
--     concern): recipe_ingredients.quantity/unit stay in the RECIPE'S OWN
--     units (e.g. "3/4 cup water"), since they're display/ServingsStepper
--     recipes, not coverage-engine inputs. canonical_id is attached where
--     ingredientResolver.js can match one (for future price lookups /
--     "Pairs well with" overlap), and left NULL otherwise -- an editorial
--     recipe with some unmatched ingredients ("orange zest", "fresh sage")
--     is still fully displayable.
-- ============================================================================

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS slug           text,
  ADD COLUMN IF NOT EXISTS description    text,
  ADD COLUMN IF NOT EXISTS image_url      text,
  ADD COLUMN IF NOT EXISTS category       text,
  ADD COLUMN IF NOT EXISTS total_minutes  integer CHECK (total_minutes IS NULL OR total_minutes > 0),
  ADD COLUMN IF NOT EXISTS dietary_tags   text[],
  ADD COLUMN IF NOT EXISTS is_published   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS author_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.recipes.slug IS
  'URL slug for /spoonassist/recipes/[slug]. Unique, backfilled below for any pre-existing rows.';
COMMENT ON COLUMN public.recipes.is_published IS
  'false hides a recipe from the discovery grid/API without deleting it (e.g. a draft user import).';
COMMENT ON COLUMN public.recipes.author_id IS
  'NULL for editorial/seed recipes. Set for a future user-submitted recipe flow.';

-- Backfill slugs for any existing rows (the MLE seed corpus has titles but
-- no slug) from title, before the column is made required + unique.
UPDATE public.recipes
SET slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- A title-derived slug could collide across rows (unlikely in the current
-- corpus, but the seed script below re-runs safely if it does): disambiguate
-- with a short id suffix rather than fail the migration.
UPDATE public.recipes r
SET slug = r.slug || '-' || left(r.id::text, 8)
WHERE EXISTS (
  SELECT 1 FROM public.recipes r2
  WHERE r2.slug = r.slug AND r2.id <> r.id
);

ALTER TABLE public.recipes ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_slug ON public.recipes (slug);
CREATE INDEX IF NOT EXISTS idx_recipes_is_published ON public.recipes (is_published) WHERE is_published;
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes (category);

-- recipe_ingredients.canonical_id becomes optional: editorial recipes keep
-- ingredients with no canonical match (see header) instead of dropping them
-- or blocking the import.
ALTER TABLE public.recipe_ingredients ALTER COLUMN canonical_id DROP NOT NULL;
ALTER TABLE public.recipe_ingredients ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.recipe_ingredients ADD COLUMN IF NOT EXISTS ingredient_name text;

COMMENT ON COLUMN public.recipe_ingredients.canonical_id IS
  'NULL when ingredientResolver.js found no canonical match at import time -- the row still displays via raw_text.';
COMMENT ON COLUMN public.recipe_ingredients.ingredient_name IS
  'parseIngredientString(raw_text).name -- the ingredient name with the leading quantity/unit stripped, for ServingsStepper display without re-parsing raw_text client-side.';
