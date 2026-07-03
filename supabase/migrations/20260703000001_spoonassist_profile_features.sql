-- ============================================================================
-- SpoonAssist Profile QA pass -- saved recipes + store preferences
-- ============================================================================
-- Backs the Profile page's "Saved recipes" and "Stores & ZIP" rows (the
-- SpoonAssist QA fix pass work order, item 4). Additive only.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- saved_recipes -- a user's heart-icon favorites. Keyed by user_id directly
-- (not household_id) since "recipes I love" is a personal list, not a
-- household setting, unlike pantry_items/meal_plans/shopping_lists.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_recipes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id  uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON public.saved_recipes (user_id);

ALTER TABLE public.saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own saved recipes"
  ON public.saved_recipes FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- households.excluded_store_ids -- the Profile "Stores & ZIP" include/exclude
-- toggles. Store ids here match whatever /api/stores?zip= returns (a mix of
-- stable chain ids and dynamic 'kroger-{locationId}' ids -- see
-- lib/spoonassist/priceEngine.js), so this is a plain text[] rather than an
-- FK to public.stores.
-- ----------------------------------------------------------------------------
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS excluded_store_ids text[] NOT NULL DEFAULT '{}';
