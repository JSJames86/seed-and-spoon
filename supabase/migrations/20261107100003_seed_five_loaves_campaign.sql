-- Seed the 5 Loaves Weekend Meals campaign row.
--
-- The live campaigns table is empty (checked 2026-11-07). The Stripe webhook resolves
-- the `campaign` slug in checkout metadata to campaigns.id, and the pilot page
-- (app/campaigns/five-loaves) sums donations by that id, so the row must exist
-- before gifts can be attributed.
--
-- Seeded as 'draft': hidden from the public campaigns list (RLS exposes only
-- non-draft rows) until the "Before launch" checklist is done. To launch:
--   UPDATE public.campaigns SET status = 'active' WHERE slug = 'five-loaves';
-- and set LAUNCH.launched = true in data/fiveLoavesCampaign.js.
--
-- Goal is Phase 1 (food) only: 375 kits x $50 = $18,750. Raise it when the
-- Phase 2 budget is final.

INSERT INTO public.campaigns (
  slug, title, description, status, campaign_type,
  goal_amount, goal_cents, start_date, is_featured,
  impact_metric_label, impact_metric_value, impact_metric_amount
) VALUES (
  'five-loaves',
  '5 Loaves Weekend Meals',
  '300+ Newark children were referred to us. Help us send the first 25 home each Friday with a weekend of meals, for 15 weeks.',
  'draft',
  'project',
  18750,
  1875000,
  CURRENT_DATE,
  true,
  'weekend kit (8 meals + 5 snacks)',
  1,
  50
)
ON CONFLICT (slug) DO NOTHING;
