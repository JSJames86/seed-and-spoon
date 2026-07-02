import { supabase } from '@/lib/supabase';
import { recipes as legacyRecipes, getRecipeBySlug } from '@/data/recipes';

function formatServings(servings) {
  if (servings == null) return null;
  return `${servings} serving${servings === 1 ? '' : 's'}`;
}

// Merges a `recipes` table row (+ its recipe_ingredients raw_text) with the
// matching data/recipes.js entry, when one exists for that slug. The 19
// pre-existing rows (imported from data/recipes.js) predate several DB
// columns -- difficulty, split prep/cook time, instacart image, tags,
// nutrition -- so those come from the legacy record. The 35+ editorial
// recipes added directly in Supabase have no legacy match and rely on the
// DB columns alone.
function mergeRecipe(dbRecipe, ingredients) {
  const legacy = getRecipeBySlug(dbRecipe.slug);
  const totalMinutes = dbRecipe.total_minutes ?? legacy?.cookTimeMinutes ?? null;

  return {
    id: dbRecipe.id,
    slug: dbRecipe.slug,
    title: dbRecipe.title,
    category: dbRecipe.category ?? legacy?.category ?? 'Uncategorized',
    difficulty: legacy?.difficulty ?? null,
    prepTime: legacy?.prepTime ?? null,
    cookTime: legacy?.cookTime ?? (totalMinutes != null ? `${totalMinutes} min` : null),
    cookTimeMinutes: totalMinutes,
    servings: legacy?.servings ?? formatServings(dbRecipe.servings),
    description: dbRecipe.description ?? legacy?.description ?? '',
    image: dbRecipe.image_url ?? legacy?.image ?? null,
    instacartImage: legacy?.instacartImage ?? null,
    ingredients: ingredients.length ? ingredients : legacy?.ingredients ?? [],
    instructions: dbRecipe.instructions?.length ? dbRecipe.instructions : legacy?.instructions ?? [],
    notes: dbRecipe.notes ?? null,
    tags: legacy?.tags ?? dbRecipe.dietary_tags ?? [],
    nutrition: legacy?.nutrition ?? null,
  };
}

/**
 * Fetches the full published recipe catalog from Supabase, merged with
 * data/recipes.js fallback content for the legacy slugs. Falls back to the
 * static catalog outright if the DB is unreachable, so the page stays usable.
 */
export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      'id, slug, title, description, image_url, category, total_minutes, servings, dietary_tags, instructions, notes, recipe_ingredients(raw_text)'
    )
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('[getAllRecipes] Error:', error.message);
    return { recipes: legacyRecipes, usingFallback: true };
  }

  const recipes = (data ?? []).map((r) =>
    mergeRecipe(
      r,
      (r.recipe_ingredients ?? []).map((i) => i.raw_text).filter(Boolean)
    )
  );

  return { recipes, usingFallback: false };
}
