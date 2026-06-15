import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------------------------------------------------------------------------
// /api/spoonassist/provenance/lots -- log a new acquisition_lots row.
//
// Per "the one invariant" (lib/spoonassist/provenance.js,
// supabase/migrations/20260615000001_five_loaves_provenance.sql):
// 'pre_existing' is written ONLY by the one-time intake tap
// (POST /api/spoonassist/provenance/intake) -- this route rejects it.
//
// POST body: { householdId, ingredientId, source, qty, acquiredAt? }
//   source: self_purchase | food_pantry | five_loaves_delivery | regenerative
//   unit is taken from canonical_ingredients.standard_unit (matches
//   pantry_items/recipe_ingredients conventions -- no conversion hop).
//
// When source is self_purchase or five_loaves_delivery, any open
// requirement_events (satisfied_by IS NULL) for this household+ingredient
// are marked satisfied_by = source -- closing the loop the gap report opened
// (see app/api/spoonassist/meal-plan/route.js).
//
// GET ?householdId=... -> { lots: [...] } ordered oldest-first (the
// drawFromLots FIFO order), for inspecting current provenance.
// ---------------------------------------------------------------------------

const LOGGABLE_SOURCES = new Set(['self_purchase', 'food_pantry', 'five_loaves_delivery', 'regenerative']);
const SATISFYING_SOURCES = new Set(['self_purchase', 'five_loaves_delivery']);

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
    .from('acquisition_lots')
    .select('id, ingredient_id, source, acquired_at, qty_initial, qty_remaining, unit, canonical_ingredients(name)')
    .eq('household_id', householdId)
    .order('acquired_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load acquisition lots' }, { status: 500 });
  }

  return NextResponse.json({
    lots: (data ?? []).map(row => ({
      id: row.id,
      ingredientId: row.ingredient_id,
      ingredientName: row.canonical_ingredients?.name ?? row.ingredient_id,
      source: row.source,
      acquiredAt: row.acquired_at,
      qtyInitial: row.qty_initial,
      qtyRemaining: row.qty_remaining,
      unit: row.unit,
    })),
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.householdId !== 'string' ||
    typeof body.ingredientId !== 'string' ||
    typeof body.source !== 'string' ||
    typeof body.qty !== 'number' ||
    body.qty <= 0
  ) {
    return NextResponse.json({ error: 'householdId, ingredientId, source, and a positive qty are required' }, { status: 400 });
  }

  if (!LOGGABLE_SOURCES.has(body.source)) {
    return NextResponse.json({
      error: `source must be one of: ${[...LOGGABLE_SOURCES].join(', ')} (pre_existing is set only by the intake tap)`,
    }, { status: 400 });
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

  const { data: ingredient, error: ingredientError } = await supabase
    .from('canonical_ingredients')
    .select('standard_unit')
    .eq('id', body.ingredientId)
    .single();

  if (ingredientError || !ingredient) {
    return NextResponse.json({ error: 'Unknown ingredientId' }, { status: 400 });
  }

  const lotRow = {
    household_id: household.id,
    ingredient_id: body.ingredientId,
    source: body.source,
    qty_initial: body.qty,
    qty_remaining: body.qty,
    unit: ingredient.standard_unit,
  };
  if (typeof body.acquiredAt === 'string' && !isNaN(Date.parse(body.acquiredAt))) {
    lotRow.acquired_at = body.acquiredAt;
  }

  const { data: lot, error: insertError } = await supabase
    .from('acquisition_lots')
    .insert(lotRow)
    .select('id, acquired_at')
    .single();

  if (insertError || !lot) {
    return NextResponse.json({ error: 'Failed to record acquisition' }, { status: 500 });
  }

  let satisfiedRequirements = 0;
  if (SATISFYING_SOURCES.has(body.source)) {
    const { data: satisfied, error: satisfyError } = await supabase
      .from('requirement_events')
      .update({ satisfied_by: body.source })
      .eq('household_id', household.id)
      .eq('ingredient_id', body.ingredientId)
      .is('satisfied_by', null)
      .select('id');

    if (!satisfyError) {
      satisfiedRequirements = satisfied?.length ?? 0;
    }
  }

  return NextResponse.json({
    success: true,
    lot: {
      id: lot.id,
      ingredientId: body.ingredientId,
      source: body.source,
      qty: body.qty,
      unit: ingredient.standard_unit,
      acquiredAt: lot.acquired_at,
    },
    satisfiedRequirements,
  });
}
