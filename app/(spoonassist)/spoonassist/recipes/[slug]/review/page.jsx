import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import RecipeReviewForm from '@/components/spoonassist/RecipeReviewForm';

async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

// Review step for a "Share a recipe" import (app/api/recipes/import): the
// recipe lands here as an unpublished draft, readable only by its author (see
// the "Authors read own recipe drafts" RLS policy from
// 20260704100001_recipe_import_confidence.sql) until they confirm it.
export default async function RecipeReviewPage({ params }) {
  const { slug } = await params;
  const supabase = await getSessionClient();
  if (!supabase) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/spoonassist/recipes/${slug}`);

  const { data: recipe } = await supabase
    .from('recipes')
    .select('id, slug, title, description, category, servings, total_minutes, dietary_tags, instructions, is_published, author_id, import_confidence')
    .eq('slug', slug)
    .maybeSingle();

  if (!recipe || recipe.author_id !== user.id) notFound();

  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('raw_text')
    .eq('recipe_id', recipe.id)
    .order('id', { ascending: true });

  return (
    <RecipeReviewForm
      recipe={recipe}
      ingredientLines={(ingredients ?? []).map((i) => i.raw_text).filter(Boolean)}
    />
  );
}
