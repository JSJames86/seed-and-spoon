import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { findOrCreateHousehold } from '@/lib/spoonassist/household';

// ---------------------------------------------------------------------------
// /api/spoonassist/plan -- save/load the signed-in user's weekly plan.
//
// Per spec §2: an unauthenticated visitor builds a plan entirely
// session-local (components/spoonassist/PlanProvider.jsx, localStorage).
// This route is what "Save your plan" actually calls once they've signed
// up -- it's intentionally a thin create/replace-current-week pair, not a
// full CRUD surface (no explicit DELETE/list-all-weeks yet).
//
// There's no household-creation endpoint anywhere else in the codebase
// (existing spoonassist routes all assume a householdId already exists) --
// this route find-or-creates a single default household for the caller so
// "save my plan" works without a separate household setup step.
//
// POST body: { weekStart?: 'YYYY-MM-DD', items: [{ recipeId, day, slot, servings }] }
//   -> { mealPlanId, householdId }
// GET ?weekStart=YYYY-MM-DD (defaults to the current week's Monday)
//   -> { mealPlan: { id, weekStart, items: [...] } | null }
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

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'items[] is required' }, { status: 400 });
  }

  const items = body.items.filter(
    (i) => i && typeof i.recipeId === 'string' && Number.isInteger(i.day) && i.day >= 0 && i.day <= 6 && typeof i.slot === 'string'
  );
  if (items.length === 0) {
    return NextResponse.json({ error: 'items[] must contain at least one valid entry' }, { status: 400 });
  }

  const weekStart = typeof body.weekStart === 'string' ? body.weekStart : mondayOf(new Date());

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const householdId = await findOrCreateHousehold(supabase, user.id);

    const { data: mealPlan, error: planErr } = await supabase
      .from('meal_plans')
      .upsert({ household_id: householdId, week_start: weekStart, status: 'active' }, { onConflict: 'household_id,week_start' })
      .select('id')
      .single();
    if (planErr) throw planErr;

    const { error: deleteErr } = await supabase.from('meal_plan_items').delete().eq('meal_plan_id', mealPlan.id);
    if (deleteErr) throw deleteErr;

    const rows = items.map((i) => ({
      meal_plan_id: mealPlan.id,
      recipe_id: i.recipeId,
      day: i.day,
      slot: i.slot,
      servings: Number.isFinite(i.servings) && i.servings > 0 ? Math.round(i.servings) : 4,
    }));

    const { error: insertErr } = await supabase.from('meal_plan_items').insert(rows);
    if (insertErr) throw insertErr;

    return NextResponse.json({ mealPlanId: mealPlan.id, householdId });
  } catch (err) {
    console.error('[/api/spoonassist/plan] Error:', err.message);
    return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get('weekStart') || mondayOf(new Date());

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: household } = await supabase
    .from('households')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!household) {
    return NextResponse.json({ mealPlan: null });
  }

  const { data: mealPlan, error: planErr } = await supabase
    .from('meal_plans')
    .select('id, week_start')
    .eq('household_id', household.id)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (planErr) {
    console.error('[/api/spoonassist/plan] Error:', planErr.message);
    return NextResponse.json({ error: 'Failed to load plan' }, { status: 500 });
  }

  if (!mealPlan) {
    return NextResponse.json({ mealPlan: null });
  }

  const { data: items, error: itemsErr } = await supabase
    .from('meal_plan_items')
    .select('id, day, slot, servings, recipes(id, slug, title, image_url, servings)')
    .eq('meal_plan_id', mealPlan.id);

  if (itemsErr) {
    console.error('[/api/spoonassist/plan] Items error:', itemsErr.message);
    return NextResponse.json({ error: 'Failed to load plan items' }, { status: 500 });
  }

  return NextResponse.json({
    mealPlan: {
      id: mealPlan.id,
      weekStart: mealPlan.week_start,
      items: (items ?? []).map((row) => ({
        day: row.day,
        slot: row.slot,
        servings: row.servings,
        recipe: row.recipes,
      })),
    },
  });
}
