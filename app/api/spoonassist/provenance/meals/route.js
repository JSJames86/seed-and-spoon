import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { drawFromLots } from '@/lib/spoonassist/provenance';

// ---------------------------------------------------------------------------
// POST /api/spoonassist/provenance/meals -- log a cooked meal.
//
// Records one meal_events row, then for each consumed ingredient draws
// against the household's acquisition_lots via drawFromLots() (strict FIFO
// by acquired_at, source-blind -- lib/spoonassist/provenance.js): writes one
// consumption_events row per lot drawn (inheriting that lot's source) and
// writes back each drawn lot's qty_remaining. Any shortfall (the pantry
// didn't have enough) is logged as a requirement_events row with
// satisfied_by: null.
//
// Body: {
//   householdId: string (required)
//   recipeId?: string | null  -- null/absent = unplanned/off-app meal
//   servings: number (required, > 0)
//   plannedInApp?: boolean (default true)
//   items: { ingredientId: string, qty: number (> 0) }[] (required, >= 1)
// }
//
// NOTE: this is several sequential writes with no DB transaction/RPC -- a
// pilot-scale tradeoff (see lib/spoonassist/README.md). A failure partway
// through can leave meal_events/consumption_events/acquisition_lots
// partially updated for this meal.
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
  if (
    !body ||
    typeof body.householdId !== 'string' ||
    typeof body.servings !== 'number' ||
    body.servings <= 0 ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.items.every(i => i && typeof i.ingredientId === 'string' && typeof i.qty === 'number' && i.qty > 0)
  ) {
    return NextResponse.json({
      error: 'householdId, servings (> 0), and items[] of { ingredientId, qty (> 0) } are required',
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

  const { data: mealEvent, error: mealError } = await supabase
    .from('meal_events')
    .insert({
      household_id: household.id,
      recipe_id: body.recipeId ?? null,
      servings: body.servings,
      planned_in_app: body.plannedInApp ?? true,
    })
    .select('id, cooked_at')
    .single();

  if (mealError || !mealEvent) {
    return NextResponse.json({ error: 'Failed to record meal' }, { status: 500 });
  }

  const consumption = [];
  const requirementRows = [];

  for (const item of body.items) {
    const { data: lotRows, error: lotError } = await supabase
      .from('acquisition_lots')
      .select('id, source, acquired_at, qty_remaining')
      .eq('household_id', household.id)
      .eq('ingredient_id', item.ingredientId)
      .gt('qty_remaining', 0);

    if (lotError) {
      return NextResponse.json({ error: 'Failed to load acquisition lots' }, { status: 500 });
    }

    const lots = (lotRows ?? []).map(l => ({
      id: l.id,
      ingredientId: item.ingredientId,
      source: l.source,
      acquiredAt: l.acquired_at,
      qtyRemaining: l.qty_remaining,
    }));

    const { draws, shortfall } = drawFromLots(lots, item.ingredientId, item.qty);

    for (const draw of draws) {
      const lot = lots.find(l => l.id === draw.lotId);

      const { error: consumeError } = await supabase.from('consumption_events').insert({
        household_id: household.id,
        meal_event_id: mealEvent.id,
        ingredient_id: item.ingredientId,
        lot_id: draw.lotId,
        qty_consumed: draw.qty,
      });
      if (consumeError) {
        return NextResponse.json({ error: 'Failed to record consumption' }, { status: 500 });
      }

      const { error: updateError } = await supabase
        .from('acquisition_lots')
        .update({ qty_remaining: lot.qtyRemaining })
        .eq('id', draw.lotId);
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update acquisition lot' }, { status: 500 });
      }
    }

    if (shortfall > 0) {
      requirementRows.push({
        household_id: household.id,
        meal_event_id: mealEvent.id,
        ingredient_id: item.ingredientId,
        qty_required: shortfall,
        satisfied_by: null,
      });
    }

    consumption.push({ ingredientId: item.ingredientId, draws, shortfall });
  }

  if (requirementRows.length > 0) {
    const { error: requirementError } = await supabase.from('requirement_events').insert(requirementRows);
    if (requirementError) {
      return NextResponse.json({ error: 'Failed to record requirement events' }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    mealEventId: mealEvent.id,
    cookedAt: mealEvent.cooked_at,
    consumption,
    requirementEvents: requirementRows.length,
  });
}
