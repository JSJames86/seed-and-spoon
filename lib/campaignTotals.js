/**
 * Server-only campaign fundraising totals, computed from the donations table.
 *
 * Nothing keeps campaigns.amount_raised in sync with donations today, so the
 * pilot page sums completed gifts attributed to the campaign directly. Donations
 * are not readable by anon (RLS), so this uses the service role and must only
 * be imported from server components / route handlers. It returns only a combined
 * total, never donor rows.
 *
 * In-kind gifts are excluded: they don't fund food purchases for weekend kits.
 */
import { createServiceClient } from '@/lib/supabase-server';

export async function getCampaignCashRaised(slug) {
  const empty = { raised: 0, giftCount: 0, campaignFound: false };
  const supabase = createServiceClient();
  if (!supabase) return empty;

  try {
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (campaignError || !campaign) return empty;

    const { data: rows, error } = await supabase
      .from('donations')
      .select('amount, payment_method')
      .eq('campaign_id', campaign.id)
      .eq('status', 'completed');
    if (error) throw error;

    const cash = (rows ?? []).filter((r) => r.payment_method !== 'in_kind');
    const raised = cash.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    return { raised, giftCount: cash.length, campaignFound: true };
  } catch (err) {
    console.error('[getCampaignCashRaised] Failed (showing $0):', err?.message || err);
    return empty;
  }
}

/**
 * Cash raised per campaign id, for list views. Same rules as above: completed,
 * non-in-kind gifts only. Returns {} on any failure so callers fall back to
 * their stored values.
 */
export async function getCashRaisedByCampaignIds(ids) {
  const supabase = createServiceClient();
  if (!supabase || !ids?.length) return {};
  try {
    const { data: rows, error } = await supabase
      .from('donations')
      .select('campaign_id, amount, payment_method')
      .in('campaign_id', ids)
      .eq('status', 'completed');
    if (error) throw error;
    const totals = Object.fromEntries(ids.map((id) => [id, 0]));
    for (const r of rows ?? []) {
      if (r.payment_method === 'in_kind') continue;
      totals[r.campaign_id] = (totals[r.campaign_id] || 0) + Number(r.amount || 0);
    }
    return totals;
  } catch (err) {
    console.error('[getCashRaisedByCampaignIds] Failed:', err?.message || err);
    return {};
  }
}
