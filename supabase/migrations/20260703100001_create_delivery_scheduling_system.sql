-- Delivery Scheduling & Eligibility System
-- Governs how often an enrolled household can receive a given service, logs
-- each delivery event, and organizes households into zones/windows so staff
-- can generate a daily route.
--
-- Builds on existing tables (not modified here):
--   public.household_enrollments(household_id text UNIQUE)  -- the delivery-recipient household
--   public.volunteers(id uuid)                               -- who delivers
--
-- household_enrollments.household_id is a coded text ID (e.g. HH-07), matching
-- the FK style already used by survey_responses / household_children /
-- allergen_flags. Note: this is NOT the same table as public.households
-- (SpoonAssist's per-user meal-planning household -- uuid PK, FK to
-- auth.users, added in 20260614000002_meal_leverage_engine.sql). That table
-- is unrelated to program delivery logistics; this migration never touches it.
--
-- Sections are numbered to match the request but created in dependency order
-- (zones/windows before the deliveries table that references them).

-- ============================================================================
-- 0. services -- catalog of things the org delivers (meal kits, produce
-- boxes, etc). Nothing in the existing schema names this concept, and
-- client_service_rules / service_deliveries both need a service_id to point
-- at, so this is a minimal prerequisite catalog, following the same
-- data-driven-catalog pattern as volunteer_roles.
-- ============================================================================
CREATE TABLE public.services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.services (key, name, description) VALUES
  ('five_loaves_kit', '5 Loaves meal kit', 'Weekly allergen-safe meal kit delivery under the 5 Loaves pilot');

-- ============================================================================
-- 5. delivery_zones -- named delivery areas, decoupled from household
-- records so routes can be redrawn without touching client data.
-- ============================================================================
CREATE TABLE public.delivery_zones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. delivery_windows -- recurring day/time slots per zone.
-- day_of_week: 0 = Sunday .. 6 = Saturday (Postgres EXTRACT(DOW ...) convention).
-- capacity NULL = uncapped.
-- ============================================================================
CREATE TABLE public.delivery_windows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id uuid NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  capacity integer CHECK (capacity IS NULL OR capacity > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_delivery_windows_zone_day ON public.delivery_windows (zone_id, day_of_week);

-- ============================================================================
-- 1. client_service_rules -- how often a household may receive a service.
-- One rule per household+service pair.
-- ============================================================================
CREATE TABLE public.client_service_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL REFERENCES public.household_enrollments(household_id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  frequency_days integer NOT NULL CHECK (frequency_days > 0),
  max_per_cycle integer NOT NULL DEFAULT 1 CHECK (max_per_cycle > 0),
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (household_id, service_id)
);

CREATE INDEX idx_client_service_rules_household ON public.client_service_rules (household_id);

CREATE OR REPLACE FUNCTION set_client_service_rules_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_service_rules_updated_at
  BEFORE UPDATE ON public.client_service_rules
  FOR EACH ROW EXECUTE FUNCTION set_client_service_rules_updated_at();

-- ============================================================================
-- 2. service_deliveries -- one row per delivery event.
--
-- delivery_window_id is not in the original spec's field list but is added
-- here as a nullable FK: delivery_window_has_capacity() and
-- delivery_run_schedule (items 8-9) both require deliveries to be tied to a
-- specific recurring window/zone slot to know what "today's route" and
-- "this window's bookings" mean. Deliveries logged without a window (ad hoc
-- drop-offs, historical backfill) simply leave it null.
-- ============================================================================
CREATE TABLE public.service_deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL REFERENCES public.household_enrollments(household_id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  delivery_window_id uuid REFERENCES public.delivery_windows(id) ON DELETE SET NULL,
  delivered_by uuid REFERENCES public.volunteers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')),
  scheduled_for timestamptz NOT NULL,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_service_deliveries_household_service ON public.service_deliveries (household_id, service_id, scheduled_for);
CREATE INDEX idx_service_deliveries_status ON public.service_deliveries (status);
CREATE INDEX idx_service_deliveries_window_date ON public.service_deliveries (delivery_window_id, scheduled_for);

CREATE OR REPLACE FUNCTION set_service_deliveries_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER service_deliveries_updated_at
  BEFORE UPDATE ON public.service_deliveries
  FOR EACH ROW EXECUTE FUNCTION set_service_deliveries_updated_at();

-- ============================================================================
-- 7. household_zone_assignments -- each household belongs to at most one
-- ACTIVE zone at a time. Partial unique index (not a plain UNIQUE column)
-- so history can be kept: closing out an assignment sets active = false and
-- a new row is inserted for the new zone, rather than overwriting.
-- ============================================================================
CREATE TABLE public.household_zone_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL REFERENCES public.household_enrollments(household_id) ON DELETE CASCADE,
  zone_id uuid NOT NULL REFERENCES public.delivery_zones(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  assigned_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

CREATE UNIQUE INDEX idx_household_zone_assignments_active_unique
  ON public.household_zone_assignments (household_id)
  WHERE active = true;

CREATE INDEX idx_household_zone_assignments_zone ON public.household_zone_assignments (zone_id) WHERE active = true;

-- ============================================================================
-- 3. is_household_eligible(household_id, service_id) -- eligibility check.
--
-- If no active rule exists for the household+service pair, default to
-- eligible (per spec). Otherwise: eligible when the number of
-- scheduled/completed deliveries within the trailing frequency_days window
-- is below max_per_cycle. Cancelled/missed deliveries don't count against
-- the household.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_household_eligible(p_household_id text, p_service_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule public.client_service_rules%ROWTYPE;
  v_count integer;
BEGIN
  SELECT * INTO v_rule
  FROM public.client_service_rules
  WHERE household_id = p_household_id
    AND service_id = p_service_id
    AND active = true;

  IF NOT FOUND THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.service_deliveries
  WHERE household_id = p_household_id
    AND service_id = p_service_id
    AND status IN ('scheduled', 'completed')
    AND scheduled_for >= now() - (v_rule.frequency_days || ' days')::interval;

  RETURN v_count < v_rule.max_per_cycle;
END;
$$;

-- ============================================================================
-- 4. household_next_eligible_date -- last delivery + next eligible date per
-- household/service, for staff/board reporting. Limited to households with
-- an active rule on file (matches the function's rule-driven logic).
-- ============================================================================
CREATE OR REPLACE VIEW public.household_next_eligible_date AS
SELECT
  r.household_id,
  he.contact_name,
  r.service_id,
  s.name AS service_name,
  r.frequency_days,
  r.max_per_cycle,
  ld.last_delivery_at,
  ld.last_delivery_status,
  CASE
    WHEN ld.last_delivery_at IS NULL THEN CURRENT_DATE
    ELSE (ld.last_delivery_at + (r.frequency_days || ' days')::interval)::date
  END AS next_eligible_date,
  public.is_household_eligible(r.household_id, r.service_id) AS is_eligible_now
FROM public.client_service_rules r
JOIN public.services s ON s.id = r.service_id
JOIN public.household_enrollments he ON he.household_id = r.household_id
LEFT JOIN LATERAL (
  SELECT sd.scheduled_for AS last_delivery_at, sd.status AS last_delivery_status
  FROM public.service_deliveries sd
  WHERE sd.household_id = r.household_id
    AND sd.service_id = r.service_id
    AND sd.status IN ('scheduled', 'completed')
  ORDER BY sd.scheduled_for DESC
  LIMIT 1
) ld ON true
WHERE r.active = true;

-- ============================================================================
-- 8. delivery_window_has_capacity(window_id, date) -- open capacity check.
-- Uncapped windows (capacity IS NULL) always have capacity.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.delivery_window_has_capacity(p_window_id uuid, p_date date)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity integer;
  v_booked integer;
BEGIN
  SELECT capacity INTO v_capacity
  FROM public.delivery_windows
  WHERE id = p_window_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'delivery_window % does not exist', p_window_id;
  END IF;

  IF v_capacity IS NULL THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_booked
  FROM public.service_deliveries
  WHERE delivery_window_id = p_window_id
    AND scheduled_for::date = p_date
    AND status IN ('scheduled', 'completed');

  RETURN v_booked < v_capacity;
END;
$$;

-- ============================================================================
-- 9. delivery_run_schedule -- zones + windows + deliveries + services joined
-- into a single "today's route" report. Zone resolves from the delivery's
-- window when set, falling back to the household's current active zone
-- assignment for deliveries logged without a window.
-- ============================================================================
CREATE OR REPLACE VIEW public.delivery_run_schedule AS
SELECT
  sd.id AS delivery_id,
  sd.household_id,
  he.contact_name,
  he.phone,
  he.delivery_address,
  he.delivery_unit_access,
  he.if_not_home,
  s.id AS service_id,
  s.name AS service_name,
  z.id AS zone_id,
  z.name AS zone_name,
  dw.id AS window_id,
  dw.day_of_week,
  dw.start_time,
  dw.end_time,
  dw.capacity AS window_capacity,
  sd.scheduled_for,
  sd.status,
  sd.delivered_by,
  v.first_name AS delivered_by_first_name,
  v.last_name AS delivered_by_last_name,
  sd.notes
FROM public.service_deliveries sd
JOIN public.household_enrollments he ON he.household_id = sd.household_id
JOIN public.services s ON s.id = sd.service_id
LEFT JOIN public.delivery_windows dw ON dw.id = sd.delivery_window_id
LEFT JOIN public.household_zone_assignments hza ON hza.household_id = sd.household_id AND hza.active = true
LEFT JOIN public.delivery_zones z ON z.id = COALESCE(dw.zone_id, hza.zone_id)
LEFT JOIN public.volunteers v ON v.id = sd.delivered_by
WHERE sd.scheduled_for::date = CURRENT_DATE
ORDER BY z.name NULLS LAST, dw.start_time NULLS LAST, sd.scheduled_for;

-- ============================================================================
-- RLS -- follows the pattern used by household_enrollments / volunteer
-- onboarding: service role has full read/write, authenticated (staff/board)
-- gets read-only for dashboards and reporting. This is internal operational
-- data (no public intake form), so there is no anon policy.
-- ============================================================================
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_service_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_zone_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on services"
  ON public.services FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on services"
  ON public.services FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access on delivery_zones"
  ON public.delivery_zones FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on delivery_zones"
  ON public.delivery_zones FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access on delivery_windows"
  ON public.delivery_windows FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on delivery_windows"
  ON public.delivery_windows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access on client_service_rules"
  ON public.client_service_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on client_service_rules"
  ON public.client_service_rules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access on service_deliveries"
  ON public.service_deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on service_deliveries"
  ON public.service_deliveries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access on household_zone_assignments"
  ON public.household_zone_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read on household_zone_assignments"
  ON public.household_zone_assignments FOR SELECT TO authenticated USING (true);
