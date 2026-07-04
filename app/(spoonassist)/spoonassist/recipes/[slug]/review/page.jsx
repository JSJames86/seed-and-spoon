import { notFound } from 'next/navigation';
import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import RecipeReviewForm from '@/components/spoonassist/RecipeReviewForm';

// Review step for a "Share a recipe" import (app/api/recipes/import): the
// recipe lands here as an unpublished draft. No login required -- SpoonAssist
// has no consumer account system -- so access is gated by the review_token
// generated at import time (20260704100002), passed as ?token=, instead of
// auth.uid(). Uses the service client throughout since the draft was never
// tied to a Postgres session in the first place.
export default async function RecipeReviewPage({ params, searchParams }) {
  const { slug } = await params;
  const { token } = await searchParams;

  const serviceClient = getServiceClient();
  if (!serviceClient || !token) notFound();

  const { data: recipe } = await serviceClient
    .from('recipes')
    .select('id, slug, title, description, category, servings, total_minutes, dietary_tags, instructions, is_published, review_token, import_confidence')
    .eq('slug', slug)
    .maybeSingle();

  if (!recipe || !recipe.review_token || recipe.review_token !== token) notFound();

  const { data: ingredients } = await serviceClient
    .from('recipe_ingredients')
    .select('raw_text')
    .eq('recipe_id', recipe.id)
    .order('id', { ascending: true });

  return (
    <RecipeReviewForm
      recipe={recipe}
      token={token}
      ingredientLines={(ingredients ?? []).map((i) => i.raw_text).filter(Boolean)}
    />
  );
}
