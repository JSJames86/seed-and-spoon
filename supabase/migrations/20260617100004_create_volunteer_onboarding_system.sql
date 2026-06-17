-- Volunteer Onboarding System
-- Flow: invite → auth → onboard → review → approve → active
-- Three conditional branches: minor, driver, hours-documentation
-- Child-safety gate: background check required before active status
-- Background check results: store outcome ONLY, never raw records.

-- NOTE: The public.volunteers table already exists with columns:
-- id, profile_id, is_youth, guardian_contact, organization_id, created_at, updated_at
-- This migration ALTERs it to add onboarding columns and creates supporting tables.

-- 1. ALTER existing volunteers table
ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited','pending_auth','onboarding','pending_review','approved','active','inactive')),
  ADD COLUMN IF NOT EXISTS invite_token uuid DEFAULT gen_random_uuid() UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_email text,
  ADD COLUMN IF NOT EXISTS invited_at timestamptz,
  ADD COLUMN IF NOT EXISTS invited_by uuid,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS is_minor boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text DEFAULT 'NJ',
  ADD COLUMN IF NOT EXISTS zip text,
  ADD COLUMN IF NOT EXISTS orientation_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS handbook_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

CREATE INDEX IF NOT EXISTS idx_volunteers_invite_token ON public.volunteers (invite_token);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers (status);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON public.volunteers (email);

-- 2. Role preferences
CREATE TABLE public.volunteer_role_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  role_key text NOT NULL,
  interest_level text NOT NULL DEFAULT 'interested' CHECK (interest_level IN ('interested', 'preferred', 'not_interested')),
  UNIQUE (volunteer_id, role_key)
);
CREATE INDEX idx_vol_roles_volunteer ON public.volunteer_role_preferences (volunteer_id);

-- 3. Hours purpose tracking
CREATE TABLE public.volunteer_hours_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('community_service','school_credit','court_ordered','professional_development','general')),
  hours_needed numeric(6,1),
  hours_logged numeric(6,1) DEFAULT 0,
  due_date date,
  institution_name text,
  supervisor_name text,
  supervisor_contact text,
  verification_letter_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_hours_log_volunteer ON public.volunteer_hours_log (volunteer_id);

-- 4. Guardian info (minor branch)
CREATE TABLE public.volunteer_guardian (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  guardian_name text NOT NULL,
  guardian_relationship text NOT NULL,
  guardian_phone text NOT NULL,
  guardian_email text,
  consent_signed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 5. Accommodations (voluntary, confidential)
CREATE TABLE public.volunteer_accommodations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  has_accommodations boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 6. Emergency contacts
CREATE TABLE public.volunteer_emergency_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_vol_emergency_volunteer ON public.volunteer_emergency_contacts (volunteer_id);

-- 7. Driver verification (NJ DO-21A flow)
CREATE TABLE public.volunteer_driver_verification (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  wants_to_drive boolean DEFAULT false,
  license_state text,
  license_number_last4 text,
  license_expiration date,
  has_insurance boolean,
  insurance_expiration date,
  do21a_consent_signed_at timestamptz,
  do21a_record_pulled_at timestamptz,
  do21a_result text CHECK (do21a_result IS NULL OR do21a_result IN ('clear','review_needed','disqualified')),
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 8. Minor-specific ID
CREATE TABLE public.volunteer_minor_id (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE UNIQUE,
  school_name text,
  grade text,
  school_contact_phone text,
  parent_work_schedule text,
  availability_notes text,
  created_at timestamptz DEFAULT now()
);

-- 9. Consents
CREATE TABLE public.volunteer_consents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  consent_type text NOT NULL CHECK (consent_type IN (
    'code_of_conduct', 'photo_release', 'liability_waiver',
    'background_check_authorization', 'minor_guardian_consent',
    'driver_do21a_consent', 'data_privacy'
  )),
  signed_at timestamptz DEFAULT now(),
  ip_address text,
  UNIQUE (volunteer_id, consent_type)
);
CREATE INDEX idx_vol_consents_volunteer ON public.volunteer_consents (volunteer_id);

-- 10. Background checks — HIGHLY RESTRICTED — outcome only
CREATE TABLE public.volunteer_background_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id uuid NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  check_type text NOT NULL CHECK (check_type IN ('criminal','cari','sex_offender','all')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','clear','flagged','disqualified')),
  initiated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  reviewed_by uuid,
  notes text,
  UNIQUE (volunteer_id, check_type)
);
CREATE INDEX idx_vol_bg_checks_volunteer ON public.volunteer_background_checks (volunteer_id);

-- RLS
ALTER TABLE public.volunteer_role_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_role_preferences"
  ON public.volunteer_role_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit role preferences"
  ON public.volunteer_role_preferences FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_hours_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_hours_log"
  ON public.volunteer_hours_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read volunteer_hours_log"
  ON public.volunteer_hours_log FOR SELECT TO authenticated USING (true);

ALTER TABLE public.volunteer_guardian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_guardian"
  ON public.volunteer_guardian FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit guardian info"
  ON public.volunteer_guardian FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on volunteer_accommodations"
  ON public.volunteer_accommodations FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.volunteer_emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_emergency_contacts"
  ON public.volunteer_emergency_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit emergency contacts"
  ON public.volunteer_emergency_contacts FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_driver_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_driver_verification"
  ON public.volunteer_driver_verification FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit driver info"
  ON public.volunteer_driver_verification FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_minor_id ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_minor_id"
  ON public.volunteer_minor_id FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit minor id"
  ON public.volunteer_minor_id FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on volunteer_consents"
  ON public.volunteer_consents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can submit consents"
  ON public.volunteer_consents FOR INSERT TO anon WITH CHECK (true);

ALTER TABLE public.volunteer_background_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only on volunteer_background_checks"
  ON public.volunteer_background_checks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Views
CREATE OR REPLACE VIEW public.volunteer_review_queue AS
SELECT
  v.id, v.first_name, v.last_name, v.email, v.status, v.is_minor, v.created_at,
  (SELECT bool_and(c.consent_type IS NOT NULL)
   FROM unnest(ARRAY['code_of_conduct','liability_waiver','data_privacy']) AS req(t)
   LEFT JOIN public.volunteer_consents c ON c.volunteer_id = v.id AND c.consent_type = req.t
  ) AS core_consents_complete,
  (SELECT count(*) FROM public.volunteer_emergency_contacts ec WHERE ec.volunteer_id = v.id) AS emergency_contact_count,
  (SELECT status FROM public.volunteer_background_checks bc
   WHERE bc.volunteer_id = v.id AND bc.check_type = 'all'
   ORDER BY bc.initiated_at DESC LIMIT 1) AS bg_check_status,
  (SELECT wants_to_drive FROM public.volunteer_driver_verification dv WHERE dv.volunteer_id = v.id) AS wants_to_drive,
  (SELECT do21a_result FROM public.volunteer_driver_verification dv WHERE dv.volunteer_id = v.id) AS driver_status
FROM public.volunteers v
WHERE v.status IN ('pending_review', 'onboarding', 'approved');

CREATE OR REPLACE VIEW public.volunteer_hours_summary AS
SELECT
  hl.volunteer_id, v.first_name, v.last_name, hl.purpose, hl.institution_name,
  hl.hours_needed, hl.hours_logged, hl.due_date,
  CASE WHEN hl.hours_needed IS NOT NULL AND hl.hours_logged >= hl.hours_needed
    THEN true ELSE false END AS hours_complete,
  hl.verification_letter_sent_at
FROM public.volunteer_hours_log hl
JOIN public.volunteers v ON v.id = hl.volunteer_id;
