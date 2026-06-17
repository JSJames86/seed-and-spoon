-- 5 Loaves Pilot: Family Intake & Enrollment
-- Safety-critical. Feeds allergen control in HACCP-001 and SOP-OPS-001 §4.3.
-- No confirmed allergen data on file → no kit produced for that household.

-- Household enrollment record
CREATE TABLE public.household_enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL UNIQUE,
  enrollment_date date NOT NULL DEFAULT CURRENT_DATE,

  -- Contact
  contact_name text NOT NULL,
  phone text NOT NULL,
  contact_method text NOT NULL CHECK (contact_method IN ('call', 'text', 'whatsapp', 'email')),
  email text,
  preferred_language text NOT NULL DEFAULT 'english' CHECK (preferred_language IN ('english', 'spanish', 'other')),
  preferred_language_other text,
  children_count smallint NOT NULL CHECK (children_count >= 1),
  adults_in_home smallint NOT NULL CHECK (adults_in_home >= 1),

  -- Dietary pattern (household level)
  dietary_vegetarian boolean NOT NULL DEFAULT false,
  dietary_vegan boolean NOT NULL DEFAULT false,
  dietary_no_pork boolean NOT NULL DEFAULT false,
  dietary_halal boolean NOT NULL DEFAULT false,
  dietary_kosher boolean NOT NULL DEFAULT false,
  dietary_other text,

  -- Delivery logistics
  delivery_address text NOT NULL,
  delivery_unit_access text,
  delivery_window text,
  if_not_home text NOT NULL CHECK (if_not_home IN ('leave_at_door', 'call_first', 'reschedule')),
  freezer_space text NOT NULL CHECK (freezer_space IN ('yes', 'limited', 'no')),

  -- Consent
  consent_allergen_accuracy boolean NOT NULL DEFAULT false,
  consent_update_changes boolean NOT NULL DEFAULT false,
  consent_program_messages boolean NOT NULL DEFAULT false,
  consent_funder_reports boolean DEFAULT false,

  -- Confirmation
  allergen_confirmed boolean NOT NULL DEFAULT false,
  allergen_confirmed_at timestamptz,
  intake_completed_by text,
  signature_name text,
  signature_date date,

  -- Enrollment status — hard gate enforced by constraint
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled', 'suspended', 'withdrawn')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT enrolled_requires_allergen_confirmation CHECK (
    status != 'enrolled' OR (allergen_confirmed = true AND consent_allergen_accuracy = true)
  )
);

CREATE INDEX idx_household_enrollments_status ON public.household_enrollments (status);

-- Children served (per-child, label/initial only — no full names)
CREATE TABLE public.household_children (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id text NOT NULL REFERENCES public.household_enrollments(household_id) ON DELETE CASCADE,
  label text NOT NULL,
  age smallint CHECK (age >= 0 AND age <= 18),
  texture_medical_needs text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_household_children_household ON public.household_children (household_id);

-- Allergen flags: versioned rows. Never overwrite — insert new version, mark old as not current.
-- Kitchen always pulls WHERE is_current = true.
CREATE TABLE public.allergen_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL REFERENCES public.household_children(id) ON DELETE CASCADE,
  household_id text NOT NULL,
  allergen text NOT NULL CHECK (allergen IN (
    'milk_dairy', 'egg', 'peanut', 'tree_nuts', 'fish',
    'shellfish', 'wheat_gluten', 'soy', 'sesame', 'other'
  )),
  allergen_other_name text,
  severity text NOT NULL CHECK (severity IN ('I', 'A', 'S')),
  version smallint NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  confirmed_by text,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Only one current version per child per allergen
CREATE UNIQUE INDEX idx_allergen_current_unique
  ON public.allergen_flags (child_id, allergen)
  WHERE is_current = true;

-- Fast lookup: all current severe flags for production/label view
CREATE INDEX idx_allergen_severe_current
  ON public.allergen_flags (household_id, severity)
  WHERE is_current = true AND severity = 'S';

CREATE INDEX idx_allergen_flags_household ON public.allergen_flags (household_id) WHERE is_current = true;
CREATE INDEX idx_allergen_flags_child ON public.allergen_flags (child_id) WHERE is_current = true;

-- RLS policies
ALTER TABLE public.household_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allergen_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on household_enrollments"
  ON public.household_enrollments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on household_children"
  ON public.household_children FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on allergen_flags"
  ON public.allergen_flags FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Anon can submit enrollment (staff-assisted or web form)
CREATE POLICY "Anyone can submit enrollments"
  ON public.household_enrollments FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can add children"
  ON public.household_children FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can add allergen flags"
  ON public.allergen_flags FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Authenticated read for dashboard/production views
CREATE POLICY "Authenticated read on household_enrollments"
  ON public.household_enrollments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read on household_children"
  ON public.household_children FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated read on allergen_flags"
  ON public.allergen_flags FOR SELECT TO authenticated
  USING (true);

-- View: current allergen summary per household for kitchen/production
CREATE OR REPLACE VIEW public.kitchen_allergen_summary AS
SELECT
  af.household_id,
  hc.label AS child_label,
  hc.age AS child_age,
  af.allergen,
  af.allergen_other_name,
  af.severity,
  af.confirmed_by,
  af.confirmed_at,
  af.version,
  he.status AS enrollment_status,
  he.allergen_confirmed,
  CASE WHEN af.severity = 'S' THEN true ELSE false END AS is_severe
FROM public.allergen_flags af
JOIN public.household_children hc ON hc.id = af.child_id
JOIN public.household_enrollments he ON he.household_id = af.household_id
WHERE af.is_current = true
ORDER BY af.household_id, hc.label, af.allergen;

-- View: households with any severe allergy (for production flagging / label render)
CREATE OR REPLACE VIEW public.severe_allergen_households AS
SELECT DISTINCT
  af.household_id,
  he.contact_name,
  he.status,
  array_agg(DISTINCT af.allergen || ' (' || hc.label || ')') AS severe_items
FROM public.allergen_flags af
JOIN public.household_children hc ON hc.id = af.child_id
JOIN public.household_enrollments he ON he.household_id = af.household_id
WHERE af.is_current = true AND af.severity = 'S'
GROUP BY af.household_id, he.contact_name, he.status;
