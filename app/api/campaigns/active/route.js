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
    slug: c.slug,
    title: c.title,
    goal_cents: goalCents,
    cash_cents: cashCents,
    inkind_cents: c.inkind_cents || 0,
    donor_count: c.donor_count || 0,
    deadline: c.deadline || null,
    status: c.status,
    percent: goalCents > 0 ? Math.min(100, Math.round((cashCents / goalCents) * 100)) : 0,
  };
}

export async function GET() {
  const { data, error } = await serviceClient()
    .from('campaigns')
    .select('slug, title, goal_cents, raised_cents, offline_cents, inkind_cents, donor_count, deadline, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ? campaignShape(data) : null });
}
