import RecipesPageClient from '@/components/recipes/RecipesPageClient';
import { getAllRecipes } from '@/lib/recipes';

/**
 * Recipes Page
 *
 * Server component: fetches the full recipe catalog (Supabase `recipes`
 * table, merged with data/recipes.js fallback content for legacy slugs)
 * and hands it to RecipesPageClient for search/filter/modal interactivity.
 *
 * @page
 */
export default async function RecipesPage() {
  const { recipes } = await getAllRecipes();

  return <RecipesPageClient recipes={recipes} />;
}
