import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// POST /api/spoonassist/provenance/intake
//
// The 5 Loaves Pilot's ONE-TIME intake pantry tap (see
// supabase/migrations/20260615000001_five_loaves_provenance.sql and
// lib/spoonassist/provenance.js "the one invariant"): snapshots a
// household's current pantry_items into acquisition_lots with
// source = 'pre_existing'. This is the ONLY place 'pre_existing' is ever
// written -- no later job re-tags a lot's source.
//
// Body: { householdId }
//
// Returns 409 if the household already has any pre_existing lots (the tap
// has already run) and 400 if the pantry has nothing to snapshot.
// ---------------------------------------------------------------------------

async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.householdId !== 'string') {
    return NextResponse.json({ error: 'householdId is required' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: household, error: householdError } = await supabase
    .from('households')
    .select('id')
    .eq('id', body.householdId)
    .single();

  if (householdError || !household) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  const { count: existingCount, error: existingError } = await supabase
    .from('acquisition_lots')
    .select('id', { count: 'exact', head: true })
    .eq('household_id', household.id)
    .eq('source', 'pre_existing');

  if (existingError) {
    return NextResponse.json({ error: 'Failed to check intake status' }, { status: 500 });
  }
  if (existingCount > 0) {
    return NextResponse.json({ error: 'Intake has already been recorded for this household' }, { status: 409 });
  }

  const { data: pantryRows, error: pantryError } = await supabase
    .from('pantry_items')
    .select('canonical_id, remaining, canonical_ingredients(standard_unit)')
    .eq('household_id', household.id)
    .gt('remaining', 0);

  if (pantryError) {
    return NextResponse.json({ error: 'Failed to load pantry' }, { status: 500 });
  }

  if (!pantryRows || pantryRows.length === 0) {
    return NextResponse.json({ error: 'Pantry is empty -- nothing to record as pre_existing' }, { status: 400 });
  }

  const rows = pantryRows.map(p => ({
    household_id: household.id,
    ingredient_id: p.canonical_id,
    source: 'pre_existing',
    qty_initial: p.remaining,
    qty_remaining: p.remaining,
    unit: p.canonical_ingredients?.standard_unit ?? 'each',
  }));

  const { error: insertError } = await supabase.from('acquisition_lots').insert(rows);
  if (insertError) {
    return NextResponse.json({ error: 'Failed to record intake' }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: rows.length });
}
