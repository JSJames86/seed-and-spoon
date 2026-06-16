import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function campaignShape(c) {
  const cashCents = (c.raised_cents || 0) + (c.offline_cents || 0);
  const goalCents = c.goal_cents || 0;
  return {
    // Fundraising engine fields
    id: c.id,
    slug: c.slug,
    title: c.title,
    story: c.story || c.description || '',
    hero_image_url: c.hero_image_url || null,
    goal_cents: goalCents,
    cash_cents: cashCents,
    raised_cents: c.raised_cents || 0,
    offline_cents: c.offline_cents || 0,
    inkind_cents: c.inkind_cents || 0,
    donor_count: c.donor_count || 0,
    deadline: c.deadline || null,
    status: c.status,
    percent: goalCents > 0 ? Math.min(100, Math.round((cashCents / goalCents) * 100)) : 0,
    // Legacy fields kept for backward compat with campaign list page
    description: c.description,
    campaign_type: c.campaign_type,
    organization_name: c.organization_name,
    goal_amount: c.goal_amount,
    amount_raised: c.amount_raised,
    start_date: c.start_date,
    end_date: c.end_date,
    is_featured: c.is_featured,
    is_matching: c.is_matching,
    matching_sponsor: c.matching_sponsor,
    matching_amount: c.matching_amount,
    impact_metric_label: c.impact_metric_label,
    impact_metric_value: c.impact_metric_value,
    impact_metric_amount: c.impact_metric_amount,
  };
}

export async function GET(request, { params }) {
  const { slug } = await params;

  const { data, error } = await serviceClient()
    .from('campaigns')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Campaign not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: campaignShape(data) });
}
