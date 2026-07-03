import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// /api/spoonassist/pantry -- cold-start pantry for the Meal Leverage Engine.
//
// Per spec v0.1: "Cold start: 3-4 anchor staples (rice, pasta, beans, eggs)
// is enough to find candidate recipes; a full pantry scan is never required."
// This route is a thin, RLS-scoped CRUD wrapper over pantry_items -- no
// validation beyond what the table's CHECK constraints already enforce
// (remaining >= 0, expires_in_days >= 0). Ownership is enforced by RLS via
// the session client: a household_id the caller doesn't own simply matches
// zero rows.
//
// GET  /api/spoonassist/pantry?householdId=...
//   -> { items: [{ canonicalId, name, remaining, unit, expiresInDays }] }
//
// POST /api/spoonassist/pantry
//   body: { householdId, items: [{ canonicalId, remaining, expiresInDays? }] }
//   Upserts each item (household_id, canonical_id) pair.
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get('householdId');
  if (!householdId) {
    return NextResponse.json({ error: 'householdId query parameter is required' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('pantry_items')
    .select('canonical_id, remaining, expires_in_days, canonical_ingredients(name, standard_unit)')
    .eq('household_id', householdId);

  if (error) {
    return NextResponse.json({ error: 'Failed to load pantry' }, { status: 500 });
  }

  return NextResponse.json({
    items: (data ?? []).map(row => ({
      canonicalId: row.canonical_id,
      name: row.canonical_ingredients?.name ?? row.canonical_id,
      unit: row.canonical_ingredients?.standard_unit ?? null,
      remaining: row.remaining,
      expiresInDays: row.expires_in_days,
    })),
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.householdId !== 'string' || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'householdId and items[] are required' }, { status: 400 });
  }

  const rows = body.items
    .filter(item => item && typeof item.canonicalId === 'string')
    .map(item => ({
      household_id: body.householdId,
      canonical_id: item.canonicalId,
      remaining: typeof item.remaining === 'number' ? item.remaining : 0,
      expires_in_days: typeof item.expiresInDays === 'number' ? item.expiresInDays : null,
      updated_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'items[] must contain at least one valid entry' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('pantry_items')
    .upsert(rows, { onConflict: 'household_id,canonical_id' });

  if (error) {
    return NextResponse.json({ error: 'Failed to save pantry' }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: rows.length });
}

// DELETE ?householdId=...&canonicalId=... -- swipe-to-delete on the Profile
// Pantry screen.
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const householdId = searchParams.get('householdId');
  const canonicalId = searchParams.get('canonicalId');
  if (!householdId || !canonicalId) {
    return NextResponse.json({ error: 'householdId and canonicalId query parameters are required' }, { status: 400 });
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('household_id', householdId)
    .eq('canonical_id', canonicalId);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove pantry item' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
