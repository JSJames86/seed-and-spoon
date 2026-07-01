import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deriveIngredientKey } from '@/lib/spoonassist/consolidateList';

// ---------------------------------------------------------------------------
// GET /api/spoonassist/recipes
//
// Public discovery-grid listing over the editorial recipe catalog
// (supabase/migrations/20260701100001_spoonassist_v2_recipe_catalog.sql).
// recipes/recipe_ingredients are public-read via RLS, so this uses the
// shared anon client -- no session required.
//
// Query params:
//   q          substring match against title (case-insensitive)
//   category   exact match against recipes.category
//   dietary    comma-separated tags, ANY of which must be in dietary_tags
//   maxMinutes total_minutes <= this value
//   sort       'quickest' (total_minutes asc) | 'newest' (default)
//   limit      default 48, max 100
//
// Cost-per-serving is intentionally absent here -- it needs a store/price
// lookup (Phase 4). RecipeCard renders without that badge when the field is
// missing. `ingredientKeys` (deduped, canonical_id-or-normalized-name) rides
// along on every row so the Plan page's "Add a meal" picker can rank
// candidates by lib/spoonassist/leverage.ts against the current plan without
// an N+1 detail fetch per recipe.
// ---------------------------------------------------------------------------
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category')?.trim();
  const dietary = searchParams.get('dietary')?.split(',').map(t => t.trim()).filter(Boolean);
  const maxMinutes = Number(searchParams.get('maxMinutes'));
  const sort = searchParams.get('sort') === 'quickest' ? 'quickest' : 'newest';
  const limit = Math.min(Number(searchParams.get('limit')) || 48, 100);

  let query = supabase
    .from('recipes')
    .select('id, slug, title, description, image_url, category, total_minutes, servings, dietary_tags, created_at, recipe_ingredients(canonical_id, ingredient_name)')
    .eq('is_published', true)
    .limit(limit);

  if (q) query = query.ilike('title', `%${q}%`);
  if (category) query = query.eq('category', category);
  if (dietary?.length) query = query.overlaps('dietary_tags', dietary);
  if (Number.isFinite(maxMinutes) && maxMinutes > 0) query = query.lte('total_minutes', maxMinutes);

  query = sort === 'quickest'
    ? query.order('total_minutes', { ascending: true, nullsFirst: false })
    : query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('[/api/spoonassist/recipes] Error:', error.message);
    return NextResponse.json({ error: 'Failed to load recipes' }, { status: 500 });
  }

  const recipes = (data ?? []).map(({ recipe_ingredients, ...recipe }) => ({
    ...recipe,
    ingredientKeys: [...new Set((recipe_ingredients ?? []).map((ing) => deriveIngredientKey(ing.canonical_id, ing.ingredient_name)))],
  }));

  return NextResponse.json(
    { recipes },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
  );
}
