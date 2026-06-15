import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  resolveIngredientPrice,
  getStoresByZip,
  getStoreById,
  getServiceClient,
} from '@/lib/spoonassist/priceEngine';
import { runMealLeverageEngine } from '@/lib/spoonassist/mealLeverageEngine';

// ---------------------------------------------------------------------------
// POST /api/spoonassist/meal-plan
//
// Loads a household's pantry/prefs and the MLE recipe corpus (recipes where
// nutrition IS NOT NULL), wires lib/spoonassist/priceEngine.js into the
// engine's priceBasket(missing, storeId) hook, and runs
// runMealLeverageEngine() (lib/spoonassist/mealLeverageEngine.js) to produce
// the §7 output contract: { verdict, headline, spent, store, buy, unlocks,
// coversDays, plan, gap }.
//
// Body: {
//   householdId: string (required),
//   budget: number (required, ignored if `snap` is provided),
//   zipCode?: string,        // defaults to households.zip_code
//   storeId?: string,        // defaults to the first store for zipCode
//   snap?: { balance: number, daysUntilReload: number },
// }
//
// households/pantry_items/household_prefs are RLS-scoped to
// (select auth.uid()) -- the session client below enforces that a caller can
// only plan for their own household.
// ---------------------------------------------------------------------------

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

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.householdId !== 'string') {
    return NextResponse.json({ error: 'householdId is required' }, { status: 400 });
  }

  const snap = body.snap && typeof body.snap.balance === 'number' && typeof body.snap.daysUntilReload === 'number'
    ? { balance: body.snap.balance, daysUntilReload: body.snap.daysUntilReload }
    : null;

  if (!snap && typeof body.budget !== 'number') {
    return NextResponse.json({ error: 'budget is required unless snap is provided' }, { status: 400 });
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
    .select('id, size, dinners_needed, zip_code')
    .eq('id', body.householdId)
    .single();

  if (householdError || !household) {
    return NextResponse.json({ error: 'Household not found' }, { status: 404 });
  }

  const [{ data: pantryRows }, { data: prefRows }, { data: recipeRows }, { data: ingredientRows }] = await Promise.all([
    supabase.from('pantry_items').select('canonical_id, remaining, expires_in_days').eq('household_id', household.id),
    supabase.from('household_prefs').select('canonical_id, weight').eq('household_id', household.id),
    supabase
      .from('recipes')
      .select('id, title, servings, nutrition, snap_eligible, recipe_ingredients(canonical_id, quantity, unit, optional)')
      .not('nutrition', 'is', null),
    supabase.from('canonical_ingredients').select('id, name'),
  ]);

  const ingredientCatalog = new Map((ingredientRows ?? []).map(row => [row.id, { name: row.name }]));

  const recipes = (recipeRows ?? []).map(r => ({
    id: r.id,
    name: r.title,
    servings: r.servings,
    nutrition: r.nutrition,
    snapEligible: r.snap_eligible,
    ingredients: (r.recipe_ingredients ?? []).map(ri => ({
      id: ri.canonical_id,
      amount: ri.quantity,
      unit: ri.unit,
      optional: ri.optional,
    })),
  }));

  const pantry = (pantryRows ?? []).map(p => ({
    id: p.canonical_id,
    remaining: p.remaining,
    expiresInDays: p.expires_in_days,
  }));

  const prefs = new Map((prefRows ?? []).map(p => [p.canonical_id, p.weight]));

  const zipCode = body.zipCode ?? household.zip_code ?? null;
  const candidateStores = await getStoresByZip(zipCode);

  let store;
  let altStores;
  if (body.storeId) {
    store = getStoreById(body.storeId);
    altStores = candidateStores.filter(s => s.id !== store.id);
  } else {
    [store, ...altStores] = candidateStores;
  }

  const serviceClient = getServiceClient();

  const priceBasket = async (missing, storeId) => {
    const storeObj = getStoreById(storeId);
    const items = await Promise.all(missing.map(async (m) => {
      const name = ingredientCatalog.get(m.id)?.name ?? m.id;
      const result = await resolveIngredientPrice(
        name,
        m.amount,
        m.unit,
        storeObj.priceMultiplier ?? 1.0,
        serviceClient,
        storeObj.locationId ?? null,
        zipCode
      );
      return { id: m.id, amount: m.amount, unit: m.unit, price: result.price };
    }));

    return {
      total: round2(items.reduce((sum, item) => sum + item.price, 0)),
      items,
    };
  };

  const result = await runMealLeverageEngine({
    recipes,
    pantry,
    household: { size: household.size, dinnersNeeded: household.dinners_needed, prefs },
    priceBasket,
    ingredientCatalog,
    store,
    budget: body.budget,
    altStores,
    snap,
    householdId: household.id,
  });

  return NextResponse.json(result);
}
