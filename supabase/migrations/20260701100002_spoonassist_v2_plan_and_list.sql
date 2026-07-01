-- ============================================================================
-- SpoonAssist v2 -- Weekly Plan + Smart List (Phase 3)
-- ============================================================================
-- Per the v2 spec §2 auth model: an unauthenticated visitor builds a plan
-- entirely session-local (client-side, see components/spoonassist/PlanProvider.jsx)
-- -- these tables only come into play once they sign up and save. So this
-- migration is purely additive schema; nothing in Phase 3's UI requires it
-- to be applied to demo the plan -> list -> leverage flow.
--
-- household_id everywhere (not user_id directly) because plans/lists are a
-- household concern, matching the existing pantry_items/household_prefs
-- shape from 20260614000002_meal_leverage_engine.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- households: additive columns for the v2 quick-setup card (name, budget,
-- meal slots, dietary tags). Existing columns (user_id, size, dinners_needed,
-- zip_code) are untouched -- the MLE engine and its API routes depend on
-- those names exactly.
-- ----------------------------------------------------------------------------
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS name               text,
  ADD COLUMN IF NOT EXISTS weekly_budget_cents integer CHECK (weekly_budget_cents IS NULL OR weekly_budget_cents >= 0),
  ADD COLUMN IF NOT EXISTS meal_slots         text[] NOT NULL DEFAULT '{breakfast,lunch,dinner}',
  ADD COLUMN IF NOT EXISTS dietary_tags       text[];

-- ----------------------------------------------------------------------------
-- meal_plans / meal_plan_items -- one row per household per week.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  week_start   date NOT NULL,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, week_start)
);

COMMENT ON TABLE public.meal_plans IS
  'One row per household per week. Saving the same week again upserts onto the existing row (household_id, week_start).';

CREATE TABLE IF NOT EXISTS public.meal_plan_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id uuid NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id    uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day          smallint NOT NULL CHECK (day BETWEEN 0 AND 6), -- 0 = Sunday
  slot         text NOT NULL DEFAULT 'dinner',
  servings     integer NOT NULL DEFAULT 4 CHECK (servings > 0),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id ON public.meal_plan_items (meal_plan_id);

-- ----------------------------------------------------------------------------
-- shopping_lists / shopping_list_items -- the consolidated output of a plan
-- (POST /api/spoonassist/list/consolidate), or a manually-built list.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  meal_plan_id uuid REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_household_id ON public.shopping_lists (household_id);

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id          uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  canonical_id     text REFERENCES public.canonical_ingredients(id) ON DELETE SET NULL,
  custom_name      text,
  quantity         numeric,
  unit             text,
  is_checked       boolean NOT NULL DEFAULT false,
  source_recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT shopping_list_items_name_required CHECK (canonical_id IS NOT NULL OR custom_name IS NOT NULL)
);

COMMENT ON COLUMN public.shopping_list_items.custom_name IS
  'Display name for items with no canonical match (most editorial-recipe ingredients) or a manually-added item. canonical_id and custom_name are never both null.';
COMMENT ON COLUMN public.shopping_list_items.is_checked IS
  'The pantry-pass checkbox ("already have it") -- checked items are excluded from the active total but stay on the list.';

CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON public.shopping_list_items (list_id);

-- ----------------------------------------------------------------------------
-- RLS -- all four tables are private to the owning household, same pattern
-- as pantry_items/household_prefs.
-- ----------------------------------------------------------------------------
ALTER TABLE public.meal_plans        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own meal plans"
  ON public.meal_plans FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own meal plan items"
  ON public.meal_plan_items FOR ALL TO authenticated
  USING (meal_plan_id IN (
    SELECT mp.id FROM public.meal_plans mp
    JOIN public.households h ON h.id = mp.household_id
    WHERE h.user_id = (select auth.uid())
  ))
  WITH CHECK (meal_plan_id IN (
    SELECT mp.id FROM public.meal_plans mp
    JOIN public.households h ON h.id = mp.household_id
    WHERE h.user_id = (select auth.uid())
  ));

CREATE POLICY "Users manage their own shopping lists"
  ON public.shopping_lists FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own shopping list items"
  ON public.shopping_list_items FOR ALL TO authenticated
  USING (list_id IN (
    SELECT sl.id FROM public.shopping_lists sl
    JOIN public.households h ON h.id = sl.household_id
    WHERE h.user_id = (select auth.uid())
  ))
  WITH CHECK (list_id IN (
    SELECT sl.id FROM public.shopping_lists sl
    JOIN public.households h ON h.id = sl.household_id
    WHERE h.user_id = (select auth.uid())
  ));
