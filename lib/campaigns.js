import { cache } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Fetches all active campaigns (publicly readable per RLS), ordered the
 * same way the campaigns admin/API route does: featured first, newest first.
 */
export async function getAllCampaigns() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAllCampaigns] Error:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Fetches a single campaign by slug. Wrapped in React `cache()` so
 * generateMetadata and the page component share one request per render.
 */
export const getCampaignBySlug = cache(async function getCampaignBySlug(slug) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return data;
});
