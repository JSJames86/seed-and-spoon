import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_SERVICE_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { offline_cents, inkind_cents } = body;

  if (offline_cents === undefined && inkind_cents === undefined) {
    return NextResponse.json({ ok: false, error: 'Provide offline_cents or inkind_cents' }, { status: 400 });
  }

  const updates = { updated_at: new Date().toISOString() };
  if (typeof offline_cents === 'number') updates.offline_cents = offline_cents;
  if (typeof inkind_cents === 'number') updates.inkind_cents = inkind_cents;

  const { data, error } = await serviceClient()
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .select('id, slug, raised_cents, offline_cents, inkind_cents, donor_count, goal_cents')
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
