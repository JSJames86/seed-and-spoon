import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllRecipes, getRecipeBySlug } from '@/lib/recipes';
import RecipeDetails from '@/components/recipes/RecipeDetails';

function toISO8601Duration(text) {
  if (!text) return undefined;
  const hourMatch = text.match(/(\d+)\s*hr/i);
  const minuteMatch = text.match(/(\d+)\s*min/i);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;
  if (!hours && !minutes) return undefined;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}`;
}

/**
 * Server component: generates a static page per recipe slug from
 * data/recipes.js + the Supabase `recipes` table (see lib/recipes.js).
 *
 * @page
 */
export async function generateStaticParams() {
  const { recipes } = await getAllRecipes();
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};

  const title = `${recipe.title} Recipe | Seed & Spoon NJ`;
  const description =
    recipe.description ||
    `A free, budget-friendly ${recipe.title} recipe from Seed & Spoon NJ, with ingredients and step-by-step instructions.`;
  const image = recipe.image || '/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://seedandspoon.org/recipes/${slug}`,
      images: [image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function RecipePage({ params }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) notFound();

  const recipeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.image ? [recipe.image] : undefined,
    description: recipe.description || undefined,
    prepTime: toISO8601Duration(recipe.prepTime),
    cookTime: toISO8601Duration(recipe.cookTime),
    recipeYield: recipe.servings || undefined,
    recipeCategory: recipe.category || undefined,
    keywords: recipe.tags?.length ? recipe.tags.join(', ') : undefined,
    recipeIngredient: recipe.ingredients?.length ? recipe.ingredients : undefined,
    recipeInstructions: recipe.instructions?.length
      ? recipe.instructions.map((step) => ({ '@type': 'HowToStep', text: step }))
      : undefined,
    nutrition: recipe.nutrition
      ? {
          '@type': 'NutritionInformation',
          calories: recipe.nutrition.calories != null ? `${recipe.nutrition.calories} calories` : undefined,
          proteinContent: recipe.nutrition.protein || undefined,
          carbohydrateContent: recipe.nutrition.carbs || undefined,
          fatContent: recipe.nutrition.fat || undefined,
        }
      : undefined,
  };

  return (
    <div className="min-h-screen bg-neutral-cream py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-primary hover:underline mb-4"
        >
          &larr; Back to all recipes
        </Link>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <RecipeDetails recipe={recipe} />
        </div>
      </div>
    </div>
  );
}
