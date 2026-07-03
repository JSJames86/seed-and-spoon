import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { findOrCreateHousehold } from '@/lib/spoonassist/household';

// ---------------------------------------------------------------------------
// /api/spoonassist/household -- the signed-in user's household record, used
// by the Profile page (Pantry, Stores & ZIP) to resolve a householdId before
// hitting the household-scoped routes (pantry, meal-plan, etc.), and to
// persist the ZIP + store include/exclude prefs.
//
// GET   -> { householdId, household: { name, size, zipCode, weeklyBudgetCents,
//            dietaryTags, excludedStoreIds } }
// PATCH body: { zipCode?, excludedStoreIds? } -> updates, returns the same shape
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

function shape(row, householdId) {
  return {
    householdId,
    household: {
      name: row?.name ?? null,
      size: row?.size ?? 1,
      zipCode: row?.zip_code ?? null,
      weeklyBudgetCents: row?.weekly_budget_cents ?? null,
      dietaryTags: row?.dietary_tags ?? [],
      excludedStoreIds: row?.excluded_store_ids ?? [],
    },
  };
}

export async function GET() {
  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const householdId = await findOrCreateHousehold(supabase, user.id);
    const { data, error } = await supabase
      .from('households')
      .select('name, size, zip_code, weekly_budget_cents, dietary_tags, excluded_store_ids')
      .eq('id', householdId)
      .single();
    if (error) throw error;
    return NextResponse.json(shape(data, householdId));
  } catch {
    return NextResponse.json({ error: 'Failed to load household' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = {};
  if (typeof body.zipCode === 'string') updates.zip_code = body.zipCode;
  if (Array.isArray(body.excludedStoreIds)) updates.excluded_store_ids = body.excludedStoreIds;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const householdId = await findOrCreateHousehold(supabase, user.id);
    const { data, error } = await supabase
      .from('households')
      .update(updates)
      .eq('id', householdId)
      .select('name, size, zip_code, weekly_budget_cents, dietary_tags, excluded_store_ids')
      .single();
    if (error) throw error;
    return NextResponse.json(shape(data, householdId));
  } catch {
    return NextResponse.json({ error: 'Failed to update household' }, { status: 500 });
  }
}
