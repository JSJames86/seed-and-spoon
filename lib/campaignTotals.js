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
