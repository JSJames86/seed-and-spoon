-- Per-campaign budgeting config, goal recomputed from it, and the Formula Supplement Pilot row (draft).

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS config jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.campaigns_apply_can_goal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
DECLARE
  v_cans     bigint;
  v_price    bigint;
  v_shipping bigint;
  v_tax      bigint;
  v_goal     bigint;
BEGIN
  IF coalesce(NEW.config ->> 'goal_basis', '') <> 'cans' THEN
    RETURN NEW;
  END IF;

  v_cans := coalesce((NEW.config ->> 'cans_per_baby_per_weekend')::bigint, 0)
          * coalesce((NEW.config ->> 'weekends')::bigint, 0)
          * coalesce((NEW.config ->> 'babies_max')::bigint, 0);
  v_price    := nullif(NEW.config ->> 'price_per_can_cents', '')::bigint;
  v_shipping := nullif(NEW.config ->> 'shipping_cents', '')::bigint;
  v_tax      := nullif(NEW.config ->> 'tax_cents', '')::bigint;

  IF v_price IS NULL OR v_price <= 0 THEN
    v_goal := 0;
  ELSE
    v_goal := v_cans * v_price + coalesce(v_shipping, 0) + coalesce(v_tax, 0);
  END IF;

  NEW.goal_cents  := v_goal;
  NEW.goal_amount := round(v_goal / 100.0, 2);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.campaigns_apply_can_goal() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS campaigns_apply_can_goal_trigger ON public.campaigns;
CREATE TRIGGER campaigns_apply_can_goal_trigger
  BEFORE INSERT OR UPDATE OF config ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.campaigns_apply_can_goal();

INSERT INTO public.campaigns (
  slug, title, description, status, campaign_type, start_date, is_featured, config
) VALUES (
  'formula-supplement-pilot',
  'Formula Supplement Pilot',
  'Some of the children referred to us are babies. Help us provide weekend formula for up to 10 infants over 15 weeks.',
  'draft',
  'project',
  CURRENT_DATE,
  false,
  jsonb_build_object(
    'goal_basis', 'cans',
    'program', 'Supplemental weekend infant formula support, run alongside 5 Loaves over the same 15 weekends',
    'cans_per_baby_per_weekend', 2,
    'weekends', 15,
    'babies_min', 5,
    'babies_max', 10,
    'price_per_can_cents', 3264,
    'price_basis', 'Median of two Similac case prices for weekend-size cans: Advance 12.4 oz at $22.99/can and Alimentum 12.1 oz at $42.28/can. Budgeting estimate, to be replaced by the confirmed supplier price.',
    'shipping_cents', null,
    'tax_cents', null
  )
)
ON CONFLICT (slug) DO NOTHING;
