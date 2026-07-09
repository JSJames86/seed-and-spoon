-- ============================================================================
-- meal_plan_items -- formalize one-to-many recipes per day+slot
-- ============================================================================
-- A real meal is often a composition (omelette + bacon + fruit, a salad +
-- its dressing), so a plan slot (day, slot) must hold more than one recipe.
--
-- meal_plan_items (20260701100002_spoonassist_v2_plan_and_list.sql) already
-- has no UNIQUE constraint on (meal_plan_id, day, slot) -- it was always a
-- junction row per recipe-in-a-slot, not "one row per slot" -- the
-- one-recipe-per-slot rule lived entirely in client state
-- (components/spoonassist/PlanProvider.jsx) and in POST
-- /api/spoonassist/plan's delete-then-reinsert save. So every existing row
-- here is already a valid row in the one-to-many model: this migration is
-- purely additive (an index + documentation), touches zero existing data,
-- and every previously-saved single-recipe plan continues to load exactly
-- as it did before.
-- ============================================================================

COMMENT ON TABLE public.meal_plan_items IS
  'One row per recipe assigned to a household''s (day, slot). A slot may hold multiple recipes -- e.g. breakfast = omelette + bacon + fruit -- so (meal_plan_id, day, slot) is intentionally NOT unique.';

COMMENT ON COLUMN public.meal_plan_items.slot IS
  'breakfast | lunch | dinner. Not unique per (meal_plan_id, day) -- a slot can hold multiple recipe rows.';

-- Supports "how many recipes are already in this slot" (the client's
-- gentle >5-recipes confirm) and per-slot grouping on load, now that a slot
-- can hold an unbounded number of rows.
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan_day_slot
  ON public.meal_plan_items (meal_plan_id, day, slot);
