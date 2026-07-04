-- ============================================================================
-- SpoonAssist -- "Share a recipe" import, anonymous access
-- ============================================================================
-- 20260704100001 gated a draft's read/edit/publish access on auth.uid() =
-- author_id, assuming a signed-in visitor. SpoonAssist has no consumer
-- account system -- app/login/page.jsx is the internal admin/staff login
-- only -- so every real "Share a recipe" submission from a site visitor came
-- back Unauthorized. review_token replaces auth.uid() as the access-control
-- gate: generated at import time, returned only to the importer, and checked
-- by the API/review-page route handlers directly (via the service client,
-- not RLS) instead of a Postgres session. Same shape as the token-based
-- public forms already in this codebase (assessment_responses.respondent_token,
-- volunteer guardian consent_token) -- opaque, unguessable, no signed-in
-- identity required.
-- ============================================================================

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS review_token text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_review_token
  ON public.recipes (review_token) WHERE review_token IS NOT NULL;

COMMENT ON COLUMN public.recipes.review_token IS
  'Opaque token gating read/edit/publish of a "Share a recipe" draft for its anonymous importer. Checked in application code (service client), not RLS. NULL once published, or for recipes never imported this way.';
