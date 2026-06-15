import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  resolveIngredientPrice,
  getStoresByZip,
  getStoreById,
  getServiceClient,
} from '@/lib/spoonassist/priceEngine';
import { fetchAndExtractRecipe } from '@/lib/spoonassist/recipeImport';
import { resolveRecipeIngredients, buildAliasMap, buildConversionMap } from '@/lib/spoonassist/ingredientResolver';
import { runMealLeverageEngine } from '@/lib/spoonassist/mealLeverageEngine';

// ---------------------------------------------------------------------------
// POST /api/spoonassist/recipe-import
//
// §9 "recipe-in": pull a recipe's schema.org JSON-LD from a URL, resolve its
// ingredients onto canonical_ingredients via the §9 "resolution seam"
// (lib/spoonassist/ingredientResolver.js), and run it through
// runMealLeverageEngine() as a `recipeIn` -- pre-seeded into the plan, with
// its servings pre-subtracted from what the household still needs. This is
// NOT a separate engine: it's runMealLeverageEngine() with `recipeIn` set.
//
// Body: {
//   url: string (required) -- a recipe page with a schema.org Recipe
//   householdId: string (required)
//   zipCode?: string,        // defaults to households.zip_code
//   storeId?: string,        // defaults to the first store for zipCode
//   budget?: number,         // defaults to 0 -- "what does this recipe cost,
//                             // and what does it unlock?" doesn't require one
// }
//
// Response: the usual §7 verdict (verdict, headline, spent, store, buy,
// unlocks, coversDays, plan, gap, coveragePlan) plus:
//   recipeIn: { name, have, need, cost, missing, unlocks, unlocksServings }
//   importedRecipe: { name, sourceUrl, image, servings }
//   unresolved: ingredient lines the resolver couldn't map to a canonical
// ---------------------------------------------------------------------------

const DEFAULT_IMPORTED_SERVINGS = 4;

// §8 "static nutrition": an imported recipe has no community nutrition score
// yet, so it's seeded with a moderate flat value -- high enough to clear
// NOURISHMENT_FLOOR if it were ever evaluated as a candidate, but it's
// pinned regardless, so this mainly feeds scoreCoveragePlan's nutritionScore.
const IMPORTED_RECIPE_NUTRITION = 0.6;

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

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const FETCH_ERROR_STATUS = {
  invalid_url: 400,
  unsupported_protocol: 400,
  blocked_address: 400,
  dns_lookup_failed: 422,
  fetch_failed: 422,
  unsupported_content_type: 422,
  no_recipe_found: 422,
  too_many_redirects: 422,
};

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.url !== 'string' || typeof body.householdId !== 'string') {
    return NextResponse.json({ error: 'url and householdId are required' }, { status: 400 });
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

  const fetched = await fetchAndExtractRecipe(body.url);
  if (fetched.error) {
    return NextResponse.json({ error: fetched.error }, { status: FETCH_ERROR_STATUS[fetched.error] ?? 422 });
  }
  const { recipe: importedRecipe, sourceUrl } = fetched;

  const [
    { data: pantryRows },
    { data: prefRows },
    { data: recipeRows },
    { data: ingredientRows },
    { data: aliasRows },
    { data: conversionRows },
  ] = await Promise.all([
    supabase.from('pantry_items').select('canonical_id, remaining, expires_in_days').eq('household_id', household.id),
    supabase.from('household_prefs').select('canonical_id, weight').eq('household_id', household.id),
    supabase
      .from('recipes')
      .select('id, title, servings, nutrition, snap_eligible, recipe_ingredients(canonical_id, quantity, unit, optional)')
      .not('nutrition', 'is', null),
    supabase.from('canonical_ingredients').select('id, name, standard_unit'),
    supabase.from('ingredient_aliases').select('alias, canonical_id'),
    supabase.from('ingredient_conversions').select('canonical_id, from_unit, to_unit, multiplier, is_estimate'),
  ]);

  const canonicalIngredients = ingredientRows ?? [];
  const ingredientCatalog = new Map(canonicalIngredients.map(row => [row.id, { name: row.name }]));

  const { ingredients: resolvedIngredients, unresolved } = resolveRecipeIngredients(importedRecipe.recipeIngredient, {
    canonicalIngredients,
    aliasMap: buildAliasMap(aliasRows),
    conversions: buildConversionMap(conversionRows),
  });

  if (resolvedIngredients.length === 0) {
    return NextResponse.json({ error: 'no_ingredients_resolved', unresolved }, { status: 422 });
  }

  const pinnedRecipe = {
    id: `imported:${sourceUrl}`,
    name: importedRecipe.name,
    servings: importedRecipe.servings ?? DEFAULT_IMPORTED_SERVINGS,
    nutrition: IMPORTED_RECIPE_NUTRITION,
    ingredients: resolvedIngredients.map(ing => ({ id: ing.id, amount: ing.amount, unit: ing.unit })),
  };

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
    recipeIn: pinnedRecipe,
    householdId: household.id,
  });

  return NextResponse.json({
    ...result,
    importedRecipe: {
      name: importedRecipe.name,
      sourceUrl,
      image: importedRecipe.image,
      servings: pinnedRecipe.servings,
    },
    unresolved,
  });
}
