import { createClient } from '@supabase/supabase-js';

// Read-only data layer for the SpoonAssist pricing spine (recipes,
// recipe_ingredients, stores, confirmed_prices, and the
// get_recipe_*_cost* RPCs added in
// 20260614000001_spoonassist_pricing_confirmation.sql).
//
// Uses the service role key when available (server-side only) so reads
// never depend on RLS/grant nuances for views and RPCs; falls back to the
// anon key, which is sufficient since every relevant table/view/function is
// publicly readable per that migration's RLS policies and GRANTs.
export function getPricingSpineClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
