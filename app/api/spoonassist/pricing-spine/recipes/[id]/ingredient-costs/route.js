import { NextResponse } from 'next/server';
import { getPricingSpineClient } from '@/lib/spoonassist/pricingSpineClient';

// GET /api/spoonassist/pricing-spine/recipes/[id]/ingredient-costs?storeId=...
// Per-ingredient cost diagnostic for one recipe at one store, via
// get_recipe_ingredient_costs. Used to explain *why* a store's basket is
// incomplete (no_price vs no_conversion) rather than just showing a blank.
export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json({ error: 'storeId query parameter is required' }, { status: 400 });
  }

  const supabase = getPricingSpineClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const [costsRes, ingredientsRes] = await Promise.all([
    supabase.rpc('get_recipe_ingredient_costs', {
      target_recipe_id: id,
      target_store_id: storeId,
    }),
    supabase
      .from('recipe_ingredients')
      .select('id, quantity, unit, canonical_ingredients(name)')
      .eq('recipe_id', id),
  ]);

  if (costsRes.error) {
    console.error('[pricing-spine/ingredient-costs] Supabase error:', costsRes.error.message);
    return NextResponse.json({ error: 'Failed to load ingredient costs' }, { status: 500 });
  }
  if (ingredientsRes.error) {
    console.error('[pricing-spine/ingredient-costs] Supabase error:', ingredientsRes.error.message);
    return NextResponse.json({ error: 'Failed to load ingredient costs' }, { status: 500 });
  }

  const ingredientsById = new Map((ingredientsRes.data || []).map(i => [i.id, i]));

  const items = (costsRes.data || []).map(row => {
    const ing = ingredientsById.get(row.recipe_ingredient_id);
    return {
      recipeIngredientId: row.recipe_ingredient_id,
      canonicalId: row.canonical_id,
      name: ing?.canonical_ingredients?.name ?? row.canonical_id,
      quantity: ing?.quantity ?? null,
      unit: ing?.unit ?? null,
      rawText: row.raw_text,
      status: row.status,
      confidence: row.confidence,
      itemCost: row.item_cost,
      confirmationCount: row.confirmation_count,
    };
  });

  return NextResponse.json({ items });
}
