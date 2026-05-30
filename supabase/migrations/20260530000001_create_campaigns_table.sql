-- Creates the campaigns table and supporting RLS policies
-- Campaigns are publicly readable; only admins can insert/update/delete

CREATE TABLE IF NOT EXISTS public.campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text NOT NULL UNIQUE,
  title                 text NOT NULL,
  description           text NOT NULL DEFAULT '',
  campaign_type         text NOT NULL DEFAULT 'general'
                          CHECK (campaign_type IN ('general','emergency','project','annual')),
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','ended','archived')),
  goal_amount           numeric(12,2) NOT NULL DEFAULT 0,
  amount_raised         numeric(12,2) NOT NULL DEFAULT 0,
  organization_name     text NOT NULL DEFAULT 'Seed & Spoon NJ',
  start_date            date NOT NULL DEFAULT CURRENT_DATE,
  end_date              date,
  is_featured           boolean NOT NULL DEFAULT false,
  is_matching           boolean NOT NULL DEFAULT false,
  matching_sponsor      text,
  matching_amount       numeric(12,2),
  impact_metric_label   text,
  impact_metric_value   numeric(12,2),
  impact_metric_amount  numeric(12,2),
  created_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaigns_slug_idx      ON public.campaigns (slug);
CREATE INDEX IF NOT EXISTS campaigns_status_idx    ON public.campaigns (status);
CREATE INDEX IF NOT EXISTS campaigns_featured_idx  ON public.campaigns (is_featured) WHERE is_featured = true;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaigns_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaigns are publicly readable"
  ON public.campaigns FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
