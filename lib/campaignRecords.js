import { createServiceClient } from '@/lib/supabase-server';

export async function getCampaignRecord(slug) {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, slug, status, goal_amount, config')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[getCampaignRecord] Failed:', err?.message || err);
    return null;
  }
}

export function computeCanGoal(config = {}) {
  const perBaby = Number(config.cans_per_baby_per_weekend) || 0;
  const weekends = Number(config.weekends) || 0;
  const cansMin = perBaby * weekends * (Number(config.babies_min) || 0);
  const cansMax = perBaby * weekends * (Number(config.babies_max) || 0);
  const price = config.price_per_can_cents == null ? null : Number(config.price_per_can_cents);
  const shipping = config.shipping_cents == null ? null : Number(config.shipping_cents);
  const tax = config.tax_cents == null ? null : Number(config.tax_cents);
  const pending = price == null || !(price > 0);
  const goalCents = pending ? null : cansMax * price + (shipping || 0) + (tax || 0);
  return {
    cansPerBabyPerWeekend: perBaby,
    weekends,
    cansMin,
    cansMax,
    priceCents: pending ? null : price,
    shippingCents: shipping,
    taxCents: tax,
    pending,
    goalCents,
    extrasPending: shipping == null || tax == null,
  };
}
