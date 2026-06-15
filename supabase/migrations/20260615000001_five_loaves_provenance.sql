-- ============================================================================
-- 5 Loaves Pilot -- Event Logging & Provenance Model
-- ============================================================================
-- Extends §3 of the Household Food Coverage Engine spec (pantry availability)
-- with an event log that makes "share of meals from a household's own
-- resources" an OBSERVED metric -- captured at the moment food enters and is
-- consumed, never recalled afterward.
--
-- THE ONE INVARIANT (everything below depends on this): provenance lives on
-- the acquisition lot and NEVER CHANGES. A lot is a batch of one ingredient
-- that entered the household from one source at one time. `pre_existing` is
-- assigned ONLY at the one-time intake pantry tap; after intake, nothing is
-- ever `pre_existing` again, and no job anywhere re-tags a lot's source.
-- Pantry availability is the SUM of acquisition_lots.qty_remaining -- it has
-- no source of its own. When food is eaten, consumption_events draw from
-- specific lots (FIFO by acquired_at, source-blind -- see
-- lib/spoonassist/provenance.js) and inherit that lot's source.
--
-- This is what makes "5 Loaves food from last week became 'existing stock'"
-- impossible by construction, not by vigilance.
-- ============================================================================

CREATE TYPE public.acquisition_source AS ENUM (
  'pre_existing',          -- captured ONCE at intake pantry tap (the baseline)
  'self_purchase',         -- household bought it themselves -> "own resource"
  'food_pantry',           -- third-party aid (not 5 Loaves)
  'five_loaves_delivery',  -- the intervention -> "delivered/dependence"
  'regenerative'           -- Phase 3 (windowsill); schema-present, NOT logged in July
);

COMMENT ON TYPE public.acquisition_source IS
  'Immutable once written to acquisition_lots.source. pre_existing is set only by the one-time intake pantry tap -- no job anywhere re-tags a lot.';


-- ----------------------------------------------------------------------------
-- acquisition_lots -- one row per batch of one ingredient from one source at
-- one time. Pantry availability for (household_id, ingredient_id) is the sum
-- of qty_remaining across its lots.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.acquisition_lots (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  -- canonical_ingredients.id is `text` (20260614000001), not uuid.
  ingredient_id text NOT NULL REFERENCES public.canonical_ingredients(id),
  source        public.acquisition_source NOT NULL,
  acquired_at   timestamptz NOT NULL DEFAULT now(),
  qty_initial   numeric NOT NULL CHECK (qty_initial >= 0),
  qty_remaining numeric NOT NULL CHECK (qty_remaining >= 0),
  unit          text NOT NULL
);

COMMENT ON TABLE public.acquisition_lots IS
  'Provenance source of truth. source is NEVER updated after insert -- pre_existing rows come exclusively from the one-time intake pantry tap.';
COMMENT ON COLUMN public.acquisition_lots.source IS
  'Written once, at INSERT. Immutable -- no later job changes a lot''s source, by design.';

CREATE INDEX IF NOT EXISTS idx_acquisition_lots_household_ingredient
  ON public.acquisition_lots (household_id, ingredient_id, acquired_at);


-- ----------------------------------------------------------------------------
-- meal_events -- one row per cooked meal, in-app or logged manually.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meal_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  recipe_id      uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  servings       numeric NOT NULL CHECK (servings > 0),
  planned_in_app boolean NOT NULL DEFAULT true,
  cooked_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.meal_events IS
  'recipe_id NULL = unplanned/off-app meal.';
COMMENT ON COLUMN public.meal_events.planned_in_app IS
  'Denominator guard: the own/delivered share is only ever computed over app-tracked meals. Pair with the weekly app_coverage survey line to report what fraction of real dinners that covers.';

CREATE INDEX IF NOT EXISTS idx_meal_events_household_cooked
  ON public.meal_events (household_id, cooked_at);


-- ----------------------------------------------------------------------------
-- consumption_events -- one row per ingredient drawn from one lot for one
-- meal. lot_id is how a meal's ingredients inherit a source.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consumption_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  meal_event_id uuid NOT NULL REFERENCES public.meal_events(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES public.canonical_ingredients(id),
  lot_id        uuid NOT NULL REFERENCES public.acquisition_lots(id),
  qty_consumed  numeric NOT NULL CHECK (qty_consumed > 0),
  consumed_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.consumption_events IS
  'Draws against acquisition_lots, strict FIFO by lot.acquired_at, source-blind (lib/spoonassist/provenance.js drawFromLots). A meal can draw from more than one lot for the same ingredient -- one row per lot drawn.';

CREATE INDEX IF NOT EXISTS idx_consumption_events_meal ON public.consumption_events (meal_event_id);
CREATE INDEX IF NOT EXISTS idx_consumption_events_lot  ON public.consumption_events (lot_id);


-- ----------------------------------------------------------------------------
-- requirement_events -- a plan needed something the pantry didn't cover
-- (§4 shortfall, instrumented). satisfied_by NULL = still unmet.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.requirement_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  meal_event_id uuid REFERENCES public.meal_events(id) ON DELETE CASCADE,
  ingredient_id text NOT NULL REFERENCES public.canonical_ingredients(id),
  qty_required  numeric NOT NULL CHECK (qty_required > 0),
  satisfied_by  public.acquisition_source,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.requirement_events IS
  'planBuyList shortfall(), instrumented. satisfied_by NULL = still unmet; once satisfied it names the acquisition_source of the new lot that closed it (self_purchase or five_loaves_delivery).';

CREATE INDEX IF NOT EXISTS idx_requirement_events_household ON public.requirement_events (household_id, created_at);


-- ----------------------------------------------------------------------------
-- RLS -- same per-household ownership pattern as 20260614000002.
-- ----------------------------------------------------------------------------
ALTER TABLE public.acquisition_lots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own acquisition lots"
  ON public.acquisition_lots FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own meal events"
  ON public.meal_events FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own consumption events"
  ON public.consumption_events FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));

CREATE POLICY "Users manage their own requirement events"
  ON public.requirement_events FOR ALL TO authenticated
  USING (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())))
  WITH CHECK (household_id IN (SELECT id FROM public.households WHERE user_id = (select auth.uid())));
