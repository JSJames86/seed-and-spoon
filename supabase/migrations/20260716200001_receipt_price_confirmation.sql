-- ============================================================================
-- Receipt-Based Community Price Confirmation (Phase 3)
-- ============================================================================
-- Two adaptations from the Phase 3 spec, verified against the actual
-- codebase before writing this migration (spec's own §0 instruction):
--
-- 1. PRICE WRITE TARGET: the spec assumes receipt-confirmed prices land in
--    `confirmed_prices`/`price_snapshots` (20260614000001). That schema is
--    real but was never wired into the resolver -- Phase 1
--    (pricing-provider-abstraction) built `price_quotes` instead, and
--    lib/pricing/providers/cachedQuote.ts is what the resolver actually
--    reads. "Zero resolver changes required" only holds if receipt prices
--    land in `price_quotes` with source='community_receipt' -- confidence
--    0.90 for that source is already defined in lib/pricing/confidence.ts,
--    and cachedQuoteProvider already reads any source from that table with
--    no per-source special-casing. So: this feature writes to
--    `price_quotes`, not `confirmed_prices`/`price_snapshots`. Those tables
--    are untouched by this migration.
--
-- 2. OWNERSHIP: the spec assumes `user_id` + "owner-only" RLS via
--    `auth.uid()`. SpoonAssist has no consumer account system --
--    app/(spoonassist)/spoonassist/profile/page.jsx's own copy is "Sign up
--    to save your household..." with every account-gated row disabled
--    "Coming soon," and PlanProvider is pure localStorage, no session.
--    Following this app's existing pattern for anonymous public flows
--    (signed/opaque tokens validated in API routes, not auth.uid()-based
--    RLS -- see CLAUDE.md "Token-based public forms"), receipt tables use
--    a client-generated opaque `device_token` (localStorage, like
--    PlanProvider's own list state) instead of `user_id`. RLS on every
--    table below is enable-with-no-policies (default deny to anon/
--    authenticated) -- all reads/writes go through service-role API routes,
--    which enforce device_token ownership in application code. This is the
--    same trust boundary this codebase already uses for guardian consent
--    and onboarding tokens, applied here since there's no session to hang
--    real RLS off of.
--
-- Store identification: the spec says "reuses the existing ZIP -> OSM ->
-- chain classification pipeline" -- there is no OSM pipeline in this repo
-- (verified in the Phase 1 PR). The real pipeline is
-- lib/spoonassist/priceEngine.js's getStoresByZip()/getStoreById()
-- (Kroger locations API + Google Places), which is what store matching
-- reuses here.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- receipt_uploads -- one row per scanned receipt
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipt_uploads (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token        text NOT NULL,
  storage_path        text,
  status              text NOT NULL DEFAULT 'uploaded'
                         CHECK (status IN ('uploaded', 'processing', 'review', 'confirmed', 'rejected', 'failed')),
  zip                 text,
  store_chain_id      text,
  store_id            text,
  store_name_raw      text,
  store_name_confirmed text,
  receipt_date        date,
  subtotal            numeric(10, 2),
  extraction_notes    text,
  failure_reason      text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  processed_at        timestamptz,
  confirmed_at        timestamptz,
  image_deleted_at    timestamptz
);

COMMENT ON TABLE public.receipt_uploads IS
  'One row per scanned receipt. device_token is an anonymous client-generated key (no consumer auth in this app -- see migration header). storage_path is nulled by the 30-day cleanup job once the image is deleted; extracted price data (receipt_line_items) persists.';
COMMENT ON COLUMN public.receipt_uploads.store_chain_id IS
  'lib/spoonassist/priceEngine.js chain id (e.g. "shoprite", "kroger-70100737"), once the user confirms a store match on the review screen.';

CREATE INDEX IF NOT EXISTS idx_receipt_uploads_device_token ON public.receipt_uploads (device_token);
CREATE INDEX IF NOT EXISTS idx_receipt_uploads_status ON public.receipt_uploads (status);
CREATE INDEX IF NOT EXISTS idx_receipt_uploads_created_at ON public.receipt_uploads (created_at);


-- ----------------------------------------------------------------------------
-- receipt_line_items -- extracted lines for one receipt, pre- and post-match
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipt_line_items (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_upload_id  uuid NOT NULL REFERENCES public.receipt_uploads(id) ON DELETE CASCADE,
  raw_text           text NOT NULL,
  quantity           numeric(10, 3),
  unit               text,
  unit_price         numeric(10, 2),
  line_total         numeric(10, 2),
  is_food            boolean NOT NULL DEFAULT true,
  on_sale            boolean NOT NULL DEFAULT false,
  normalized_name    text,
  match_confidence   numeric(3, 2),
  match_source       text CHECK (match_source IN ('alias', 'deterministic', 'model', 'user')),
  match_status       text NOT NULL DEFAULT 'pending'
                        CHECK (match_status IN ('auto_matched', 'needs_confirmation', 'unmatched', 'user_confirmed', 'user_rejected')),
  price_status       text NOT NULL DEFAULT 'pending'
                        CHECK (price_status IN ('pending', 'written', 'flagged', 'rejected')),
  flag_reason        text,
  price_quote_id     uuid REFERENCES public.price_quotes(id),
  included           boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.receipt_line_items IS
  'Extracted receipt lines. match_status/price_status track the two-stage pipeline (ingredient match, then sanity-bound price write) spec Phase 3 §2.4/§3 describe. included=false is how a user "deletes" a line on the review screen without losing the audit trail.';
COMMENT ON COLUMN public.receipt_line_items.price_status IS
  'flagged = failed the sanity-bounds check (>3x or <0.33x current best quote/USDA estimate) and needs moderation before it can be written to price_quotes.';

CREATE INDEX IF NOT EXISTS idx_receipt_line_items_upload_id ON public.receipt_line_items (receipt_upload_id);
CREATE INDEX IF NOT EXISTS idx_receipt_line_items_flagged ON public.receipt_line_items (price_status) WHERE price_status = 'flagged';


-- ----------------------------------------------------------------------------
-- receipt_unmatched_lines -- training signal for expanding ingredient_mappings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipt_unmatched_lines (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_upload_id  uuid REFERENCES public.receipt_uploads(id) ON DELETE SET NULL,
  raw_text           text NOT NULL,
  raw_text_normalized text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.receipt_unmatched_lines IS
  'Receipt lines that stayed unmatched after both the deterministic pass and the model-assisted batch (spec §2.4, confidence < 0.5). Free signal for later expanding ingredient_mappings/receipt_ingredient_aliases. ON DELETE SET NULL so this survives receipt_uploads cleanup.';

CREATE INDEX IF NOT EXISTS idx_receipt_unmatched_lines_raw ON public.receipt_unmatched_lines (raw_text_normalized);


-- ----------------------------------------------------------------------------
-- receipt_ingredient_aliases -- accepted raw-receipt-text -> normalized_name
-- ----------------------------------------------------------------------------
-- Deliberately separate from ingredient_aliases (20260614000004), which maps
-- recipe-phrase -> canonical_ingredients.id for the meal-leverage/coverage
-- engine -- a different key space and a different target table. This one
-- bridges receipt shorthand ("CHKN BRST FAM PK") to the pricing engine's
-- normalized_name vocabulary (lib/spoonassist/priceEngine.js
-- normalizeIngredient()), so raw_text_normalized here is a light
-- lowercase/trim/whitespace-collapse of the RAW RECEIPT LINE -- not a second
-- implementation of normalizeIngredient() (spec §0: "do not write a second
-- normalizer"). normalized_name is always a value normalizeIngredient()
-- itself could produce.
CREATE TABLE IF NOT EXISTS public.receipt_ingredient_aliases (
  raw_text_normalized text PRIMARY KEY,
  normalized_name     text NOT NULL,
  confidence          numeric(3, 2) NOT NULL DEFAULT 1.0,
  source              text NOT NULL DEFAULT 'model' CHECK (source IN ('model', 'user')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.receipt_ingredient_aliases IS
  'Accepted raw-receipt-text -> normalized_name mappings, so the same abbreviation never needs the model twice. raw_text_normalized is a light key-normalization of the RAW receipt line (lowercase/trim/collapse-whitespace), not a second normalizeIngredient() implementation.';


-- ----------------------------------------------------------------------------
-- receipt_consents -- one-time consent record (spec §4)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipt_consents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_token     text NOT NULL,
  consent_version  text NOT NULL DEFAULT 'v1',
  consented_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_token, consent_version)
);

COMMENT ON TABLE public.receipt_consents IS
  'Records that a device has seen and accepted the one-time "what we extract / what we never store" consent screen before its first scan.';


-- ----------------------------------------------------------------------------
-- Row Level Security -- default deny. All access is mediated by service-role
-- API routes (app/api/receipts/*), which enforce device_token ownership in
-- application code -- see migration header for why (no auth.uid() to key
-- real RLS off of in this app).
-- ----------------------------------------------------------------------------
ALTER TABLE public.receipt_uploads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_line_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_unmatched_lines      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_ingredient_aliases   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_consents             ENABLE ROW LEVEL SECURITY;

-- receipt_ingredient_aliases is the one exception: it's a public-good
-- lookup table (like ingredient_mappings/ingredient_aliases), no PII, and
-- reads speed up client-side alias short-circuiting later if ever exposed.
-- No write policy -- only service_role (which bypasses RLS) writes it.
CREATE POLICY "Public read receipt_ingredient_aliases" ON public.receipt_ingredient_aliases FOR SELECT USING (true);


-- ----------------------------------------------------------------------------
-- Private storage bucket for receipt photos. No storage.objects policies
-- added (default deny to anon/authenticated) -- uploads/reads/deletes all go
-- through service-role API routes.
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;
