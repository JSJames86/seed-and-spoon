'use client';

import Link from 'next/link';
import { useSavedRecipes } from '@/components/spoonassist/SavedRecipesProvider';
import SignedOutPrompt from '@/components/spoonassist/SignedOutPrompt';
import RecipeCard from '@/components/spoonassist/RecipeCard';
import PillButton from '@/components/spoonassist/PillButton';
import EmptyState from '@/components/spoonassist/EmptyState';
import { RecipeGridSkeleton } from '@/components/spoonassist/Skeleton';

export default function SavedRecipesPage() {
  const { signedIn, loaded, recipes } = useSavedRecipes();

  if (loaded && !signedIn) return <SignedOutPrompt title="Recipes you ♥ will live here" />;

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">Saved recipes</h1>

      {!loaded ? (
        <div className="mt-5">
          <RecipeGridSkeleton count={4} />
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          title="Recipes you ♥ will live here"
          description="Tap the heart on any recipe to save it for later."
          action={
            <PillButton as={Link} href="/spoonassist/recipes">
              Browse recipes
            </PillButton>
          }
        />
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
