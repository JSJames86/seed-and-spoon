-- Board Governance Self-Assessment
-- Replaces GOV-001 paper version. Paperless, repeatable, longitudinal.
-- CRITICAL: board_member_id lives ONLY on assessment_invites.
-- Answers attach to respondent_token on assessment_responses.
-- No query, view, or export may join token -> board_member_id.

-- Assessment cycles
CREATE TABLE public.assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  opened_at timestamptz,
  closes_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  created_at timestamptz DEFAULT now()
);

-- Anonymity layer: identity lives HERE only.
-- respondent_token is the ONLY key that travels to responses.
CREATE TABLE public.assessment_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  board_member_id uuid NOT NULL,
  board_member_name text,
  board_member_email text,
  respondent_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, board_member_id)
);

CREATE INDEX idx_invites_assessment ON public.assessment_invites (assessment_id);
CREATE INDEX idx_invites_token ON public.assessment_invites (respondent_token);

-- Submitted responses keyed ONLY by token (NOT joinable to board_member_id)
CREATE TABLE public.assessment_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  respondent_token uuid NOT NULL UNIQUE,
  submitted_at timestamptz DEFAULT now()
);

CREATE INDEX idx_responses_assessment ON public.assessment_responses (assessment_id);

-- Per-statement ratings
CREATE TABLE public.assessment_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id uuid NOT NULL REFERENCES public.assessment_responses(id) ON DELETE CASCADE,
  domain_key text NOT NULL,
  statement_id text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('SD', 'D', 'A', 'SA', 'DK')),
  UNIQUE (response_id, statement_id)
);

CREATE INDEX idx_ratings_response ON public.assessment_ratings (response_id);

-- Free-text reflections
CREATE TABLE public.assessment_texts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id uuid NOT NULL REFERENCES public.assessment_responses(id) ON DELETE CASCADE,
  prompt_id text NOT NULL,
  body text NOT NULL,
  UNIQUE (response_id, prompt_id)
);

CREATE INDEX idx_texts_response ON public.assessment_texts (response_id);

-- RLS: enforce the anonymity boundary
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on assessments"
  ON public.assessments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read assessments"
  ON public.assessments FOR SELECT TO authenticated
  USING (true);

-- Invites: service_role ONLY. This IS the anonymity boundary.
CREATE POLICY "Service role full access on assessment_invites"
  ON public.assessment_invites FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on assessment_responses"
  ON public.assessment_responses FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can submit responses"
  ON public.assessment_responses FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated read responses"
  ON public.assessment_responses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role full access on assessment_ratings"
  ON public.assessment_ratings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can submit ratings"
  ON public.assessment_ratings FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated read ratings"
  ON public.assessment_ratings FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role full access on assessment_texts"
  ON public.assessment_texts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Anon can submit texts"
  ON public.assessment_texts FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated read texts"
  ON public.assessment_texts FOR SELECT TO authenticated
  USING (true);

-- Aggregation view: per-statement rating distribution + flags
CREATE OR REPLACE VIEW public.assessment_statement_results AS
WITH counts AS (
  SELECT
    r.assessment_id,
    ar.domain_key,
    ar.statement_id,
    COUNT(*) FILTER (WHERE ar.rating = 'SD') AS ct_sd,
    COUNT(*) FILTER (WHERE ar.rating = 'D')  AS ct_d,
    COUNT(*) FILTER (WHERE ar.rating = 'A')  AS ct_a,
    COUNT(*) FILTER (WHERE ar.rating = 'SA') AS ct_sa,
    COUNT(*) FILTER (WHERE ar.rating = 'DK') AS ct_dk,
    COUNT(*) AS ct_total
  FROM public.assessment_ratings ar
  JOIN public.assessment_responses r ON r.id = ar.response_id
  GROUP BY r.assessment_id, ar.domain_key, ar.statement_id
)
SELECT
  assessment_id,
  domain_key,
  statement_id,
  ct_sd, ct_d, ct_a, ct_sa, ct_dk, ct_total,
  (ct_total - ct_dk) AS ct_rated,
  CASE WHEN (ct_total - ct_dk) > 0
    THEN ROUND((ct_a + ct_sa)::numeric / (ct_total - ct_dk), 3)
    ELSE NULL
  END AS favorable_share,
  CASE WHEN (ct_total - ct_dk) > 0
       AND (ct_sd + ct_d) >= ((ct_total - ct_dk)::numeric / 2)
    THEN true ELSE false
  END AS needs_attention,
  CASE WHEN (
    (CASE WHEN ct_sd > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN ct_d  > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN ct_a  > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN ct_sa > 0 THEN 1 ELSE 0 END)
  ) >= 3 THEN true ELSE false
  END AS no_shared_view,
  CASE WHEN ct_total > 0 AND ct_dk >= (ct_total::numeric / 3)
    THEN true ELSE false
  END AS info_gap
FROM counts;

-- Participation summary: count only, never who
CREATE OR REPLACE VIEW public.assessment_participation AS
SELECT
  assessment_id,
  COUNT(*) AS invited,
  COUNT(submitted_at) AS submitted
FROM public.assessment_invites
GROUP BY assessment_id;
