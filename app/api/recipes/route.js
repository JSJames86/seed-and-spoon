import { NextResponse } from 'next/server';
import { recipes } from '@/data/recipes';
import { parseIngredientString } from '@/lib/spoonassist/priceEngine';

export async function GET() {
  try {
    const normalized = recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients
        .map(raw => parseIngredientString(raw))
        .filter(Boolean),
    }));

    return NextResponse.json(
      { recipes: normalized },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (err) {
    console.error('[/api/recipes] Error:', err.message);
    return NextResponse.json({ error: 'Failed to load recipes' }, { status: 500 });
  }
}
