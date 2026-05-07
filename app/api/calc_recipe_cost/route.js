import { NextResponse } from 'next/server';
import { calculateRecipeCost, getStoreById, getServiceClient } from '@/lib/spoonassist/priceEngine';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { ingredients, storeIds, zipCode, dietaryFilters } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ error: 'ingredients array is required' }, { status: 400 });
    }

    if (!Array.isArray(storeIds) || storeIds.length === 0) {
      return NextResponse.json({ error: 'storeIds array is required' }, { status: 400 });
    }

    // Resolve store objects from IDs
    const stores = storeIds.map(id => getStoreById(id));

    // Sanitise ingredient list
    const cleanIngredients = ingredients
      .filter(ing => ing && typeof ing.name === 'string' && ing.name.trim())
      .map(ing => ({
        name:     ing.name.trim(),
        quantity: typeof ing.quantity === 'number' && isFinite(ing.quantity) ? ing.quantity : 1,
        unit:     typeof ing.unit === 'string' ? ing.unit.trim() : 'each',
      }));

    if (cleanIngredients.length === 0) {
      return NextResponse.json({ error: 'No valid ingredients provided' }, { status: 400 });
    }

    const supabaseClient = getServiceClient();
    const result = await calculateRecipeCost(cleanIngredients, stores, supabaseClient);

    return NextResponse.json({
      costData: result.costData,
      summary:  result.summary,
      meta: {
        zipCode:        zipCode ?? null,
        dietaryFilters: Array.isArray(dietaryFilters) ? dietaryFilters : [],
      },
    });
  } catch (err) {
    console.error('[/api/calc_recipe_cost] Unhandled error:', err.message);
    return NextResponse.json({ error: 'Cost calculation failed' }, { status: 500 });
  }
}
