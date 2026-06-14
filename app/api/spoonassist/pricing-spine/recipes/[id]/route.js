import { NextResponse } from 'next/server';
import { getPricingSpineClient } from '@/lib/spoonassist/pricingSpineClient';

// GET /api/spoonassist/pricing-spine/recipes/[id]
// Recipe detail: ingredient list plus a per-store cost summary computed via
// get_recipe_cost_for_store. Per-ingredient breakdowns are fetched lazily
// from the ingredient-costs sub-route once a store is expanded.
export async function GET(request, { params }) {
  const { id } = await params;

  const supabase = getPricingSpineClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const [recipeRes, ingredientsRes, storesRes] = await Promise.all([
    supabase.from('recipes').select('id, title, servings, source_url').eq('id', id).maybeSingle(),
    supabase
      .from('recipe_ingredients')
      .select('id, quantity, unit, raw_text, canonical_id, canonical_ingredients(name, category, standard_unit)')
      .eq('recipe_id', id),
    supabase.from('stores').select('id, name, brand_parent, address').order('name', { ascending: true }),
  ]);

  if (recipeRes.error) {
    console.error('[pricing-spine/recipes/:id] Supabase error:', recipeRes.error.message);
    return NextResponse.json({ error: 'Failed to load recipe' }, { status: 500 });
  }
  if (!recipeRes.data) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
  if (ingredientsRes.error || storesRes.error) {
    console.error('[pricing-spine/recipes/:id] Supabase error:',
      ingredientsRes.error?.message || storesRes.error?.message);
    return NextResponse.json({ error: 'Failed to load recipe' }, { status: 500 });
  }

  const stores = storesRes.data || [];

  const costResults = await Promise.all(
    stores.map(store =>
      supabase.rpc('get_recipe_cost_for_store', {
        target_recipe_id: id,
        target_store_id: store.id,
      })
    )
  );

  const storeCosts = stores.map((store, idx) => {
    const { data, error } = costResults[idx];
    if (error) {
      console.error('[pricing-spine/recipes/:id] get_recipe_cost_for_store error:', error.message);
      return { store, cost: null };
    }
    return { store, cost: data?.[0] ?? null };
  });

  const ingredients = (ingredientsRes.data || []).map(ing => ({
    id: ing.id,
    quantity: ing.quantity,
    unit: ing.unit,
    rawText: ing.raw_text,
    canonicalId: ing.canonical_id,
    name: ing.canonical_ingredients?.name ?? ing.canonical_id,
    category: ing.canonical_ingredients?.category ?? null,
    standardUnit: ing.canonical_ingredients?.standard_unit ?? null,
  }));

  return NextResponse.json({
    recipe: recipeRes.data,
    ingredients,
    storeCosts,
  });
}
