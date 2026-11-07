-- donations.campaign_slug — human-readable campaign attribution, kept consistent with
-- the existing donations.campaign_id FK.
--
-- Live schema this was fitted to (inspected 2026-11-07 via Supabase MCP):
--   * donations.campaign_id uuid NULL, FK -> campaigns(id), partial index
--     donations_campaign_id_idx. All 12 existing rows have campaign_id NULL.
--   * campaigns.slug text NOT NULL, UNIQUE (campaigns_slug_key).
--   * The Stripe webhook (app/api/donations/webhook/route.js) inserts neither
--     campaign_id nor campaign_slug.
--
-- Design: campaign_id stays the source of truth. campaign_slug is a denormalized
-- copy so the slug from Stripe metadata / URLs can be written and filtered on directly.
--   * A composite FK (campaign_id, campaign_slug) -> campaigns(id, slug) guarantees
--     the two can never disagree, and ON UPDATE CASCADE follows campaign slug renames.
--     MATCH SIMPLE: the FK is not checked when either column is NULL, so the
--     trigger below makes sure they're both set or both NULL.
--   * A BEFORE trigger fills in whichever half is missing. Callers may send just
--     the slug (e.g. from Stripe metadata) or just the id.
--   * Existing rows: no campaign_id, so campaign_slug stays NULL. No backfill needed,
--     but the UPDATE below handles any rows that gain a campaign_id before this runs.
--   * Webhook inserts: they send neither column, so the trigger does nothing.

-- 1. Column ---------------------------------------------------------------------
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS campaign_slug text;

-- 2. Composite-key target on campaigns ------------------------------------------
-- (id) is already unique, so (id, slug) is too. This only adds the
-- constraint the composite FK needs as its target.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.campaigns'::regclass
      AND conname = 'campaigns_id_slug_key'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_id_slug_key UNIQUE (id, slug);
  END IF;
END $$;

-- 3. Keep id and slug in sync ----------------------------------------------------
-- SECURITY DEFINER so the lookup sees draft campaigns too (campaigns RLS only
-- exposes non-draft rows to non-admins). search_path is pinned per repo convention.
CREATE OR REPLACE FUNCTION public.donations_sync_campaign_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_id   uuid;
  v_slug text;
BEGIN
  -- Only do work when attribution is set or changed.
  IF TG_OP = 'UPDATE'
     AND NEW.campaign_id   IS NOT DISTINCT FROM OLD.campaign_id
     AND NEW.campaign_slug IS NOT DISTINCT FROM OLD.campaign_slug THEN
    RETURN NEW;
  END IF;

  -- On UPDATE, if only one half changed, the other half is stale. Re-derive it.
  IF TG_OP = 'UPDATE' THEN
    IF NEW.campaign_id IS DISTINCT FROM OLD.campaign_id
       AND NEW.campaign_slug IS NOT DISTINCT FROM OLD.campaign_slug THEN
      NEW.campaign_slug := NULL;
    ELSIF NEW.campaign_slug IS DISTINCT FROM OLD.campaign_slug
       AND NEW.campaign_id IS NOT DISTINCT FROM OLD.campaign_id THEN
      NEW.campaign_id := NULL;
    END IF;
  END IF;

  -- Treat '' as "no campaign".
  IF NEW.campaign_slug = '' THEN
    NEW.campaign_slug := NULL;
  END IF;

  IF NEW.campaign_id IS NOT NULL AND NEW.campaign_slug IS NULL THEN
    SELECT c.slug INTO v_slug FROM public.campaigns c WHERE c.id = NEW.campaign_id;
    NEW.campaign_slug := v_slug;  -- NULL if id unknown; existing campaign_id FK then rejects it
  ELSIF NEW.campaign_slug IS NOT NULL AND NEW.campaign_id IS NULL THEN
    SELECT c.id INTO v_id FROM public.campaigns c WHERE c.slug = NEW.campaign_slug;
    IF v_id IS NULL THEN
      RAISE EXCEPTION 'Unknown campaign slug: %', NEW.campaign_slug
        USING ERRCODE = 'foreign_key_violation';
    END IF;
    NEW.campaign_id := v_id;
  END IF;
  -- If both were supplied, the composite FK verifies that they match.

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.donations_sync_campaign_slug() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS donations_sync_campaign_slug_trigger ON public.donations;
CREATE TRIGGER donations_sync_campaign_slug_trigger
  BEFORE INSERT OR UPDATE OF campaign_id, campaign_slug ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.donations_sync_campaign_slug();

-- 4. Backfill (no-op today: every live row has campaign_id NULL) -----------------
UPDATE public.donations d
SET campaign_slug = c.slug
FROM public.campaigns c
WHERE d.campaign_id = c.id
  AND d.campaign_slug IS DISTINCT FROM c.slug;

-- 5. Composite FK ----------------------------------------------------------------
-- No ON DELETE action, matching the existing donations_campaign_id_fkey (RESTRICT
-- semantics). A campaign with gifts can't be deleted out from under them.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.donations'::regclass
      AND conname = 'donations_campaign_id_slug_fkey'
  ) THEN
    ALTER TABLE public.donations
      ADD CONSTRAINT donations_campaign_id_slug_fkey
      FOREIGN KEY (campaign_id, campaign_slug)
      REFERENCES public.campaigns (id, slug)
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Index for filtering (campaign pages, admin reports) -------------------------
-- Partial, to match the existing donations_campaign_id_idx.
CREATE INDEX IF NOT EXISTS donations_campaign_slug_idx
  ON public.donations (campaign_slug)
  WHERE campaign_slug IS NOT NULL;
