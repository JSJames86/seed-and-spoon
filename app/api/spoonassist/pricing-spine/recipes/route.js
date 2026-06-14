import { NextResponse } from 'next/server';
import { getPricingSpineClient } from '@/lib/spoonassist/pricingSpineClient';

// GET /api/spoonassist/pricing-spine/recipes
// Lists recipes from the pricing-spine `recipes` table (not the static
// data/recipes catalog used elsewhere in SpoonAssist).
export async function GET() {
  const supabase = getPricingSpineClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, servings, source_url, recipe_ingredients(count)')
    .order('title', { ascending: true });

  if (error) {
    console.error('[pricing-spine/recipes] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to load recipes' }, { status: 500 });
  }

  const recipes = (data || []).map(r => ({
    id: r.id,
    title: r.title,
    servings: r.servings,
    sourceUrl: r.source_url,
    ingredientCount: r.recipe_ingredients?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ recipes }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}
