import RecipesPageClient from '@/components/recipes/RecipesPageClient';
import { getAllRecipes } from '@/lib/recipes';

export const metadata = {
  title: "Free Family Recipes | Seed & Spoon NJ",
  description:
    "Browse free, budget-friendly recipes from Seed & Spoon NJ — easy meals for families in Essex County, with ingredient lists and step-by-step instructions.",
  openGraph: {
    title: "Free Family Recipes | Seed & Spoon NJ",
    description:
      "Budget-friendly, family-tested recipes to help Essex County households stretch every meal.",
    url: "https://seedandspoon.org/recipes",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Family Recipes | Seed & Spoon NJ",
    description: "Budget-friendly, family-tested recipes for Essex County households.",
    images: ["/og-image.jpg"],
  },
};

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
