import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/spoonassist/recipes/[slug] -- recipe detail + ingredients, for
// the recipe detail page's ServingsStepper/IngredientRow list. Public read,
// same anon client as the list route.
export async function GET(_request, { params }) {
  const { slug } = await params;

  const { data: recipe, error: recipeErr } = await supabase
    .from('recipes')
    .select('id, slug, title, description, image_url, category, total_minutes, servings, dietary_tags, source_url, instructions, notes')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (recipeErr) {
    console.error('[/api/spoonassist/recipes/[slug]] Error:', recipeErr.message);
    return NextResponse.json({ error: 'Failed to load recipe' }, { status: 500 });
  }

  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  const { data: ingredients, error: ingredientsErr } = await supabase
    .from('recipe_ingredients')
    .select('id, canonical_id, quantity, unit, ingredient_name, raw_text, canonical_ingredients(category)')
    .eq('recipe_id', recipe.id)
    .order('id', { ascending: true });

  if (ingredientsErr) {
    console.error('[/api/spoonassist/recipes/[slug]] Ingredients error:', ingredientsErr.message);
    return NextResponse.json({ error: 'Failed to load recipe ingredients' }, { status: 500 });
  }

  const shapedIngredients = (ingredients ?? []).map((ing) => ({
    id: ing.id,
    canonical_id: ing.canonical_id,
    quantity: ing.quantity,
    unit: ing.unit,
    ingredient_name: ing.ingredient_name,
    raw_text: ing.raw_text,
    category: ing.canonical_ingredients?.category ?? null,
  }));

  return NextResponse.json(
    { recipe: { ...recipe, ingredients: shapedIngredients } },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } }
  );
}
