-- ============================================================================
-- Send Us the Receipts -- community receipt submissions (public campaign)
-- ============================================================================
-- Distinct from the personal SpoonAssist price-confirmation pipeline
-- (receipt_uploads/receipt_line_items, migration 20260716200001): that flow
-- is a logged-in-feeling review-and-confirm UX for one shopper's own price
-- comparison. This is an anonymous, no-review-screen public intake for a
-- pricing-disparity study/advocacy campaign -- same anonymous device_token
-- ownership pattern, same private storage, but its own queue table so the
-- two flows' lifecycles (and a friend fixing a mismatch vs. legislative
-- testimony data) never get tangled.
--
-- Two adaptations from the drop-in bundle this migration is based on,
-- verified against the live schema:
--
-- 1. STORAGE BUCKET: the bundle creates a new 'receipts-uploads' bucket.
--    A private 'receipts' bucket already exists (20260716200001) and the
--    existing cleanup route (app/api/receipts/cleanup) already knows how to
--    purge from it. Reusing it (under a submissions/ path prefix, vs. the
--    personal flow's {device_token}/ prefix) avoids a second bucket with
--    identical RLS for no reason.
--
-- 2. PURGE FUNCTION: the bundle adds a SQL mark_expired_receipt_images()
--    function, but SQL can't delete storage objects either way -- the actual
--    deletion happens in the JS cleanup route regardless. Folding this
--    table into that route's existing query-and-remove loop (rather than a
--    second SQL function plus a second thing for the route to call) keeps
--    one purge implementation instead of two.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.receipt_submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  -- Anonymous ownership, same pattern as receipt_uploads.device_token.
  device_token     text NOT NULL,
  -- What the shopper tells us.
  store_name       text NOT NULL,
  store_location   text,           -- free text: "Springfield Ave, Newark"
  home_zip         text CHECK (home_zip ~ '^[0-9]{5}$'),
  purchase_date    date,           -- optional; extraction backfills from the receipt if not given
  -- Matched chain/store, filled in by the extraction hand-off
  -- (lib/spoonassist/priceEngine.js chain id via lib/receipts/storeMatch.js),
  -- same fields/meaning as receipt_uploads.store_chain_id/store_id. Null
  -- means no confident match -- price_quotes.chain_id is NOT NULL, so those
  -- lines' prices never get written, only logged for the aliasing signal.
  store_chain_id   text,
  store_id         text,
  -- Storage (private 'receipts' bucket, submissions/{yyyy-mm}/{uuid}.ext).
  -- Nulled by the cleanup route once the image is purged, same as
  -- receipt_uploads.storage_path.
  storage_path     text,
  image_deleted_at timestamptz,
  -- Processing lifecycle.
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'extracted', 'rejected', 'purged')),
  rejection_reason text,           -- e.g. 'visible_payment_info', 'no_receipt_found'
  extracted_at     timestamptz,
  -- Consent receipt: which version of the consent text this device agreed to.
  consent_version  text NOT NULL DEFAULT '2026-07-v1'
);

COMMENT ON TABLE public.receipt_submissions IS
  'Community-submitted receipt photos for the Send Us the Receipts pricing study (public campaign, distinct from the personal SpoonAssist receipt_uploads flow). Images auto-purged at 30 days by app/api/receipts/cleanup; extracted line items feed price_quotes with source=''community_receipt'' via app/api/receipts/submissions/process.';
COMMENT ON COLUMN public.receipt_submissions.rejection_reason IS
  'Set when status=''rejected''. ''visible_payment_info'' means the extraction step saw payment/loyalty info in the photo and the image was deleted immediately, per the "if we can see it, we discard it" promise on the /receipts page.';

CREATE INDEX IF NOT EXISTS idx_receipt_submissions_status ON public.receipt_submissions (status);
CREATE INDEX IF NOT EXISTS idx_receipt_submissions_created_at ON public.receipt_submissions (created_at);
CREATE INDEX IF NOT EXISTS idx_receipt_submissions_device_token ON public.receipt_submissions (device_token);
CREATE INDEX IF NOT EXISTS idx_receipt_submissions_home_zip ON public.receipt_submissions (home_zip);

-- Default deny. No anon/authenticated policies -- service-role API routes
-- (app/api/receipts/submit, app/api/receipts/submissions/process) are the
-- only data path, same trust boundary as every other table in this domain.
ALTER TABLE public.receipt_submissions ENABLE ROW LEVEL SECURITY;
