-- ============================================================================
-- Meal Leverage Engine (MLE) -- Spec v0.1
-- ============================================================================
-- Adds the household-facing layer on top of the existing canonical_ingredients
-- / recipes / recipe_ingredients pricing spine from
-- 20260614000001_spoonassist_pricing_confirmation.sql:
--
--   - canonical_ingredients gains nutrition_tags -- the "ingredient graph"
--     the spec describes (an index derived from the recipe corpus, not a
--     replacement for it).
--   - recipes gains nutrition (0..1), cuisine_tags, and snap_eligible.
--     lib/spoonassist/mealLeverageEngine.js only considers recipes where
--     nutrition IS NOT NULL, so pre-existing pricing-spine seed recipes
--     (e.g. French Onion Soup in supabase/seed.sql) stay out of the MLE
--     corpus untouched.
--   - recipe_ingredients gains optional, matching the engine's
--     shortfall()/Recipe.ingredients[].optional.
--   - New tables: households, pantry_items, household_prefs -- the
--     household's "owned" map and taste preferences the greedy loop reads.
--
-- IMPORTANT: for MLE recipes, recipe_ingredients.quantity/unit MUST already
-- be expressed in the ingredient's canonical_ingredients.standard_unit. The
-- engine's shortfall() compares recipe amounts directly against
-- pantry_items.remaining (also standard_unit) -- there is no conversion hop
-- at plan time.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- Extend the existing pricing-spine catalog
-- ----------------------------------------------------------------------------
ALTER TABLE public.canonical_ingredients ADD COLUMN IF NOT EXISTS nutrition_tags text[];

COMMENT ON COLUMN public.canonical_ingredients.nutrition_tags IS
  'protein | veg | fiber | fat | starch -- inputs to recipes.nutrition precomputation, not read at plan time.';

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS nutrition numeric CHECK (nutrition IS NULL OR (nutrition >= 0 AND nutrition <= 1)),
  ADD COLUMN IF NOT EXISTS cuisine_tags text[],
  ADD COLUMN IF NOT EXISTS snap_eligible boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.recipes.nutrition IS
  'Precomputed 0..1 satiety/balance score (protein+veg+fiber > pasta x3). NULL = not part of the MLE recipe corpus.';
COMMENT ON COLUMN public.recipes.snap_eligible IS
  'false = hot/prepared food, ineligible for SNAP/WIC -- excluded from the §6 SNAP variant.';

ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS optional boolean NOT NULL DEFAULT false;


-- ----------------------------------------------------------------------------
-- households
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.households (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  size           integer NOT NULL CHECK (size > 0),
  dinners_needed integer NOT NULL DEFAULT 4 CHECK (dinners_needed > 0),
  zip_code       text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.households IS
  'size * dinners_needed = servingsNeeded for the MLE greedy loop (planBuyList).';

CREATE INDEX IF NOT EXISTS idx_households_user_id ON public.households (user_id);


-- ----------------------------------------------------------------------------
-- pantry_items -- the household's "owned" map. Cold start: 3-4 anchor
-- staples (🫘🍚🍝🥚) is enough to find candidate recipes; a full pantry scan
-- is never required.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pantry_items (
  household_id     uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  canonical_id     text NOT NULL REFERENCES public.canonical_ingredients(id) ON DELETE CASCADE,
  remaining        numeric NOT NULL DEFAULT 0 CHECK (remaining >= 0),
  expires_in_days  integer CHECK (expires_in_days IS NULL OR expires_in_days >= 0),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (household_id, canonical_id)
);

COMMENT ON TABLE public.pantry_items IS
  'remaining is in canonical_ingredients.standard_unit. expires_in_days <= 3 triggers depletionBonus() ("use it before it rots").';


-- ----------------------------------------------------------------------------
-- household_prefs -- 0 = hard dislike (skips the whole recipe), >1 = favorite,
-- absent = neutral (1).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.household_prefs (
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  canonical_id text NOT NULL REFERENCES public.canonical_ingredients(id) ON DELETE CASCADE,
  weight       numeric NOT NULL DEFAULT 1 CHECK (weight >= 0),
  PRIMARY KEY (household_id, canonical_id)
);

COMMENT ON TABLE public.household_prefs IS
  'weight = 0 is a hard skip: prefMultiplier() returns 0 for any recipe containing this ingredient.';


-- ----------------------------------------------------------------------------
-- RLS -- households and their pantry/prefs are private to their owner.
-- canonical_ingredients/recipes/recipe_ingredients stay public per
-- 20260614000001 (no policy changes needed for the new columns).
-- ----------------------------------------------------------------------------
ALTER TABLE public.households      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own households"
  ON public.households FOR ALL TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users manage their own pantry items"
  ON public.pantry_items FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own household prefs"
  ON public.household_prefs FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));
