-- Volunteer Onboarding v2 — Architecture Review
-- Per-role eligibility, data-driven roles, independent guardian consent,
-- immutable audit logging, availability + languages, court-ordered flag.
--
-- Key changes from v1:
--   - volunteer_roles table makes onboarding logic data-driven
--   - volunteer_role_assignments tracks per-role eligibility (not whole-account)
--   - volunteer_guardian uses independent email-based consent (not self-checkbox)
--   - volunteer_audit_log is immutable/append-only
--   - volunteer_background_check stores per-component status (CHRI/SOR/CARI)
--   - New tables: availability, languages, notes, verification_letters, hours_purpose
--   - volunteers.status changed to: invited | in_progress | submitted | active | needs_info

-- =====================================================
-- 1. Drop v1 onboarding views
-- =====================================================
DROP VIEW IF EXISTS public.volunteer_review_queue;
DROP VIEW IF EXISTS public.volunteer_hours_summary;

-- =====================================================
-- 2. Drop v1 onboarding tables (all empty, safe to drop)
-- =====================================================
DROP TABLE IF EXISTS public.volunteer_background_checks CASCADE;
DROP TABLE IF EXISTS public.volunteer_consents CASCADE;
DROP TABLE IF EXISTS public.volunteer_minor_id CASCADE;
DROP TABLE IF EXISTS public.volunteer_driver_verification CASCADE;
DROP TABLE IF EXISTS public.volunteer_emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.volunteer_accommodations CASCADE;
DROP TABLE IF EXISTS public.volunteer_guardian CASCADE;
DROP TABLE IF EXISTS public.volunteer_hours_log CASCADE;
DROP TABLE IF EXISTS public.volunteer_role_preferences CASCADE;

-- =====================================================
-- 3. Alter volunteers table for v2 statuses
-- =====================================================
UPDATE public.volunteers SET status = 'submitted' WHERE status = 'pending_review';
UPDATE public.volunteers SET status = 'in_progress' WHERE status IN ('pending_auth', 'onboarding');
UPDATE public.volunteers SET status = 'active' WHERE status = 'approved';
UPDATE public.volunteers SET status = 'needs_info' WHERE status = 'inactive';

ALTER TABLE public.volunteers DROP CONSTRAINT volunteers_status_check;
ALTER TABLE public.volunteers ADD CONSTRAINT volunteers_status_check
  CHECK (status IN ('invited', 'in_progress', 'submitted', 'active', 'needs_info'));

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS court_ordered boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tshirt_size text,
  ADD COLUMN IF NOT EXISTS why_volunteering text;

-- =====================================================
-- 4. volunteer_roles — data-driven role metadata
-- =====================================================
CREATE TABLE public.volunteer_roles (
  key text PRIMARY KEY,
  title text NOT NULL,
  requires_driver_verification boolean NOT NULL DEFAULT false,
  requires_background_check boolean NOT NULL DEFAULT false,
  allows_minors boolean NOT NULL DEFAULT true,
  requires_food_safety_ack boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true
);

INSERT INTO public.volunteer_roles (key, title, requires_driver_verification, requires_background_check, allows_minors, requires_food_safety_ack) VALUES
  ('packing', 'Packing line', false, false, true, true),
  ('kitchen', 'Kitchen / meal prep', false, false, true, true),
  ('driving', 'Delivery / driving', true, true, false, false),
  ('outreach', 'Community outreach & events', false, false, true, false),
  ('admin', 'Admin / data', false, false, true, false);

-- =====================================================
-- 5. volunteer_role_assignments — per-role eligibility
-- =====================================================
CREATE TABLE public.volunteer_role_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_key text NOT NULL REFERENCES public.volunteer_roles(key),
  eligibility_status text NOT NULL DEFAULT 'pending'
    CHECK (eligibility_status IN ('pending', 'eligible', 'restricted', 'denied')),
  reason text,
  approved_by uuid,
  approved_at timestamptz,
  UNIQUE (volunteer_id, role_key)
);
CREATE INDEX idx_vol_role_assign_volunteer ON public.volunteer_role_assignments (volunteer_id);

-- =====================================================
-- 6. volunteer_role_preferences
-- =====================================================
CREATE TABLE public.volunteer_role_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_key text NOT NULL REFERENCES public.volunteer_roles(key),
  UNIQUE (volunteer_id, role_key)
);
CREATE INDEX idx_vol_role_prefs_volunteer ON public.volunteer_role_preferences (volunteer_id);

-- =====================================================
-- 7. volunteer_hours_purpose
-- =====================================================
CREATE TABLE public.volunteer_hours_purpose (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('personal','school_service','college_app','court_ordered','corporate_social','none')),
  target_hours int,
  institution_name text,
  documentation_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_hours_purpose_volunteer ON public.volunteer_hours_purpose (volunteer_id);

-- =====================================================
-- 8. volunteer_hours_log — per-shift verified records
-- =====================================================
CREATE TABLE public.volunteer_hours_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  hours numeric(5,2) NOT NULL CHECK (hours > 0),
  role_key text REFERENCES public.volunteer_roles(key),
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_hours_log_volunteer ON public.volunteer_hours_log (volunteer_id);

-- =====================================================
-- 9. verification_letters — permanent record
-- =====================================================
CREATE TABLE public.verification_letters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  generated_at timestamptz DEFAULT now(),
  generated_by uuid,
  total_verified_hours numeric(7,2) NOT NULL,
  recipient text NOT NULL,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_verif_letters_volunteer ON public.verification_letters (volunteer_id);

-- =====================================================
-- 10. volunteer_guardian — independent consent flow
-- =====================================================
CREATE TABLE public.volunteer_guardian (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  guardian_name text NOT NULL,
  guardian_relationship text NOT NULL,
  guardian_email text NOT NULL,
  guardian_phone text NOT NULL,
  consent_method text NOT NULL DEFAULT 'email_link',
  consent_token uuid DEFAULT gen_random_uuid() UNIQUE,
  consent_given boolean DEFAULT false,
  guardian_consent_ip text,
  guardian_consent_at timestamptz,
  guardian_consent_version text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 11. volunteer_accommodations — confidential
-- =====================================================
CREATE TABLE public.volunteer_accommodations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  food_allergies text,
  accommodations_needed text,
  is_confidential boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 12. volunteer_emergency_contacts
-- =====================================================
CREATE TABLE public.volunteer_emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_emergency_volunteer ON public.volunteer_emergency_contacts (volunteer_id);

-- =====================================================
-- 13. volunteer_availability
-- =====================================================
CREATE TABLE public.volunteer_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  weekdays text[],
  preferred_times text[],
  max_hours_per_month int,
  transportation text CHECK (transportation IS NULL OR transportation IN ('can_drive','bus_only','rideshare','walk')),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 14. volunteer_languages
-- =====================================================
CREATE TABLE public.volunteer_languages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  language text NOT NULL,
  proficiency text NOT NULL CHECK (proficiency IN ('basic','conversational','fluent','native')),
  UNIQUE (volunteer_id, language)
);
CREATE INDEX idx_vol_languages_volunteer ON public.volunteer_languages (volunteer_id);

-- =====================================================
-- 15. volunteer_notes — admin notes
-- =====================================================
CREATE TABLE public.volunteer_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_notes_volunteer ON public.volunteer_notes (volunteer_id);

-- =====================================================
-- 16. volunteer_audit_log — IMMUTABLE, append-only
-- =====================================================
CREATE TABLE public.volunteer_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_audit_volunteer ON public.volunteer_audit_log (volunteer_id);
CREATE INDEX idx_vol_audit_action ON public.volunteer_audit_log (action);

-- =====================================================
-- 17. volunteer_driver_verification
-- =====================================================
CREATE TABLE public.volunteer_driver_verification (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  nj_licensed boolean DEFAULT false,
  do21a_notarized boolean DEFAULT false,
  do21a_received_at timestamptz,
  abstract_status text DEFAULT 'pending'
    CHECK (abstract_status IN ('pending','requested','received','verified','failed')),
  abstract_received_at timestamptz,
  has_valid_insurance boolean DEFAULT false,
  driving_restriction_reason text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 18. volunteer_minor_id
-- =====================================================
CREATE TABLE public.volunteer_minor_id (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  school_id_status text DEFAULT 'pending' CHECK (school_id_status IN ('pending','verified')),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 19. volunteer_consents — individual flags
-- =====================================================
CREATE TABLE public.volunteer_consents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  liability_waiver boolean DEFAULT false,
  waiver_at timestamptz,
  code_of_conduct boolean DEFAULT false,
  food_safety_ack boolean DEFAULT false,
  media_consent boolean DEFAULT false,
  background_check_consent boolean DEFAULT false,
  bg_consent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 20. volunteer_background_check — one row per volunteer
-- CHILD-SAFETY GATE. Store outcome ONLY, never raw records.
-- =====================================================
CREATE TABLE public.volunteer_background_check (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  required boolean DEFAULT false,
  method text CHECK (method IS NULL OR method IN ('vro_fingerprint','commercial_interim')),
  chri_status text DEFAULT 'pending' CHECK (chri_status IN ('pending','cleared','disqualified','expired')),
  sor_status text DEFAULT 'pending' CHECK (sor_status IN ('pending','cleared','flagged','expired')),
  cari_status text DEFAULT 'pending' CHECK (cari_status IN ('pending','cleared','substantiated','expired')),
  cleared boolean DEFAULT false,
  checked_at timestamptz,
  recheck_due date,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE public.volunteer_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_roles"
  ON public.volunteer_roles FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read volunteer_roles"
  ON public.volunteer_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon read volunteer_roles"
  ON public.volunteer_roles FOR SELECT TO anon USING (true);

ALTER TABLE public.volunteer_role_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_role_assignments"
  ON public.volunteer_role_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read volunteer_role_assignments"
  ON public.volunteer_role_assignments FOR SELECT TO authenticated USING (true);

ALTER TABLE public.volunteer_role_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_role_preferences"
  ON public.volunteer_role_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_hours_purpose ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_hours_purpose"
  ON public.volunteer_hours_purpose FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_hours_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_hours_log"
  ON public.volunteer_hours_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read volunteer_hours_log"
  ON public.volunteer_hours_log FOR SELECT TO authenticated USING (true);

ALTER TABLE public.verification_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on verification_letters"
  ON public.verification_letters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read verification_letters"
  ON public.verification_letters FOR SELECT TO authenticated USING (true);

ALTER TABLE public.volunteer_guardian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_guardian"
  ON public.volunteer_guardian FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on volunteer_accommodations"
  ON public.volunteer_accommodations FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_emergency_contacts"
  ON public.volunteer_emergency_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_availability"
  ON public.volunteer_availability FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_languages"
  ON public.volunteer_languages FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on volunteer_notes"
  ON public.volunteer_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- volunteer_audit_log — APPEND-ONLY
ALTER TABLE public.volunteer_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role insert on volunteer_audit_log"
  ON public.volunteer_audit_log FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role read on volunteer_audit_log"
  ON public.volunteer_audit_log FOR SELECT TO service_role USING (true);
CREATE POLICY "Authenticated read volunteer_audit_log"
  ON public.volunteer_audit_log FOR SELECT TO authenticated USING (true);

ALTER TABLE public.volunteer_driver_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_driver_verification"
  ON public.volunteer_driver_verification FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_minor_id ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_minor_id"
  ON public.volunteer_minor_id FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_consents"
  ON public.volunteer_consents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- volunteer_background_check — HIGHLY RESTRICTED
ALTER TABLE public.volunteer_background_check ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on volunteer_background_check"
  ON public.volunteer_background_check FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- Views
-- =====================================================

CREATE OR REPLACE VIEW public.volunteer_review_queue AS
SELECT
  v.id, v.first_name, v.last_name, v.email, v.status, v.is_minor, v.court_ordered, v.created_at,
  (SELECT json_agg(json_build_object(
    'role_key', ra.role_key,
    'eligibility_status', ra.eligibility_status,
    'reason', ra.reason
  )) FROM public.volunteer_role_assignments ra WHERE ra.volunteer_id = v.id) AS role_assignments,
  (SELECT json_agg(rp.role_key) FROM public.volunteer_role_preferences rp WHERE rp.volunteer_id = v.id) AS role_preferences,
  (SELECT consent_given FROM public.volunteer_guardian g WHERE g.volunteer_id = v.id) AS guardian_consent_given,
  (SELECT json_build_object(
    'liability_waiver', c.liability_waiver,
    'code_of_conduct', c.code_of_conduct,
    'food_safety_ack', c.food_safety_ack,
    'background_check_consent', c.background_check_consent
  ) FROM public.volunteer_consents c WHERE c.volunteer_id = v.id) AS consents,
  (SELECT cleared FROM public.volunteer_background_check bc WHERE bc.volunteer_id = v.id) AS bg_check_cleared,
  (SELECT count(*) FROM public.volunteer_emergency_contacts ec WHERE ec.volunteer_id = v.id) AS emergency_contact_count
FROM public.volunteers v
WHERE v.status IN ('submitted', 'active', 'needs_info');

CREATE OR REPLACE VIEW public.volunteer_hours_summary AS
SELECT
  hl.volunteer_id, v.first_name, v.last_name,
  hp.purpose, hp.institution_name, hp.target_hours, hp.documentation_required,
  COALESCE(SUM(hl.hours) FILTER (WHERE hl.verified_at IS NOT NULL), 0) AS total_verified_hours,
  COALESCE(SUM(hl.hours), 0) AS total_logged_hours,
  COUNT(hl.id) AS shift_count,
  (SELECT MAX(vl.generated_at) FROM public.verification_letters vl WHERE vl.volunteer_id = hl.volunteer_id) AS last_letter_at
FROM public.volunteer_hours_log hl
JOIN public.volunteers v ON v.id = hl.volunteer_id
LEFT JOIN public.volunteer_hours_purpose hp ON hp.volunteer_id = hl.volunteer_id
GROUP BY hl.volunteer_id, v.first_name, v.last_name, hp.purpose, hp.institution_name, hp.target_hours, hp.documentation_required;
