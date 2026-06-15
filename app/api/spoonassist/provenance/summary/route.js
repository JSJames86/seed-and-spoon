import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  resolveIngredientPrice,
  getStoresByZip,
  getServiceClient,
} from '@/lib/spoonassist/priceEngine';
import { attributeMeal, rollUpWeeklyShares } from '@/lib/spoonassist/provenance';

// ---------------------------------------------------------------------------
// GET /api/spoonassist/provenance/summary?householdId=...&days=7
//
// "The two lines" (lib/spoonassist/provenance.js): rolls up app-tracked meals
// (meal_events.planned_in_app -- the denominator guard) over the last `days`
// days into the week's own-resource share (resilience) and
// delivery-dependence share (dependence).
//
// Each consumption_events item is priced via priceEngine's
// resolveIngredientPrice (which always resolves to a number, falling back to
// a generic estimate), so attributeMeal's ingredient-slot fallback is mainly
// a defensive branch here.
//
// Response: {
//   since, until, mealsCount, totalServings,
//   ownResourceShare, deliveryDependenceShare,
//   perMeal: [{ mealEventId, cookedAt, servings, ownShare, deliveredShare, ownServings, deliveredServings }]
// }
//
// Pair ownResourceShare/deliveryDependenceShare with the weekly app_coverage
// survey line when reporting -- this is the share among app-tracked meals
// only, not every meal the household ate.
// ---------------------------------------------------------------------------

const DEFAULT_WINDOW_DAYS = 7;

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

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

  const daysParam = parseInt(searchParams.get('days') ?? '', 10);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : DEFAULT_WINDOW_DAYS;

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
    .select('id, zip_code')
    .eq('id', householdId)
    .single();

  if (householdError || !household) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);

  const { data: mealRows, error: mealError } = await supabase
    .from('meal_events')
    .select('id, servings, cooked_at')
    .eq('household_id', household.id)
    .eq('planned_in_app', true)
    .gte('cooked_at', since.toISOString())
    .order('cooked_at', { ascending: true });

  if (mealError) {
    return NextResponse.json({ error: 'Failed to load meal events' }, { status: 500 });
  }

  const meals = mealRows ?? [];
  if (meals.length === 0) {
    return NextResponse.json({
      since: since.toISOString(),
      until: until.toISOString(),
      mealsCount: 0,
      totalServings: 0,
      ...rollUpWeeklyShares([], 0),
      perMeal: [],
    });
  }

  const mealIds = meals.map(m => m.id);

  const { data: consumptionRows, error: consumptionError } = await supabase
    .from('consumption_events')
    .select('meal_event_id, ingredient_id, qty_consumed, acquisition_lots(source)')
    .in('meal_event_id', mealIds);

  if (consumptionError) {
    return NextResponse.json({ error: 'Failed to load consumption events' }, { status: 500 });
  }

  const ingredientIds = [...new Set((consumptionRows ?? []).map(c => c.ingredient_id))];
  const { data: ingredientRows } = ingredientIds.length > 0
    ? await supabase.from('canonical_ingredients').select('id, name, standard_unit').in('id', ingredientIds)
    : { data: [] };

  const ingredientCatalog = new Map((ingredientRows ?? []).map(row => [row.id, row]));

  const zipCode = household.zip_code ?? null;
  const [store] = await getStoresByZip(zipCode);
  const serviceClient = getServiceClient();

  const itemsByMeal = new Map();
  for (const row of consumptionRows ?? []) {
    if (!itemsByMeal.has(row.meal_event_id)) itemsByMeal.set(row.meal_event_id, []);
    itemsByMeal.get(row.meal_event_id).push(row);
  }

  const perMeal = [];
  for (const meal of meals) {
    const rows = itemsByMeal.get(meal.id) ?? [];
    const items = await Promise.all(rows.map(async (row) => {
      const ingredient = ingredientCatalog.get(row.ingredient_id);
      const name = ingredient?.name ?? row.ingredient_id;
      const unit = ingredient?.standard_unit ?? 'each';
      const priced = await resolveIngredientPrice(
        name,
        row.qty_consumed,
        unit,
        store?.priceMultiplier ?? 1.0,
        serviceClient,
        store?.locationId ?? null,
        zipCode
      );
      return { source: row.acquisition_lots?.source, value: priced.price };
    }));

    const attribution = attributeMeal({ items, servings: meal.servings });
    perMeal.push({
      mealEventId: meal.id,
      cookedAt: meal.cooked_at,
      servings: meal.servings,
      ...attribution,
    });
  }

  const totalServings = meals.reduce((sum, m) => sum + m.servings, 0);

  return NextResponse.json({
    since: since.toISOString(),
    until: until.toISOString(),
    mealsCount: meals.length,
    totalServings: round2(totalServings),
    ...rollUpWeeklyShares(perMeal, totalServings),
    perMeal,
  });
}
