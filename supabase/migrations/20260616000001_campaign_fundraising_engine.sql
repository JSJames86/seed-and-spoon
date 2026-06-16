-- Phase 1: Campaign Fundraising Engine
-- Adds goal-tracked fundraising columns to campaigns + donations

-- Fix campaigns table: ensure PK exists, fix status constraint, add fundraising columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.campaigns'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.campaigns ADD PRIMARY KEY (id);
  END IF;
END $$;

ALTER TABLE public.campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'active', 'closed', 'ended', 'archived'));

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS goal_cents     bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS raised_cents   bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS offline_cents  bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inkind_cents   bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS donor_count    int    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deadline       timestamptz,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS story          text;

-- Atomic increment (no race conditions on concurrent donations)
CREATE OR REPLACE FUNCTION public.increment_campaign_total(
  p_campaign_id uuid,
  p_amount_cents bigint
) RETURNS void LANGUAGE sql AS $$
  UPDATE public.campaigns
  SET raised_cents = raised_cents + p_amount_cents,
      donor_count  = donor_count + 1,
      updated_at   = now()
  WHERE id = p_campaign_id;
$$;

DROP POLICY IF EXISTS "Campaigns are publicly readable" ON public.campaigns;
CREATE POLICY "Non-draft campaigns are publicly readable"
  ON public.campaigns FOR SELECT
  USING (status IN ('active', 'ended', 'closed', 'archived'));

-- Add campaign tracking to donations
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS campaign_id       uuid REFERENCES public.campaigns(id),
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS donations_stripe_session_id_idx
  ON public.donations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS donations_campaign_id_idx
  ON public.donations (campaign_id)
  WHERE campaign_id IS NOT NULL;
