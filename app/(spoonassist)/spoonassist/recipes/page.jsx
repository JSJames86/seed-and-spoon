import RecipeCard from '@/components/spoonassist/RecipeCard';
import SectionHeader from '@/components/spoonassist/SectionHeader';
import { seedRecipes } from '@/data/spoonassistV2Seed';

export const metadata = { title: 'Recipes' };

export default function SpoonAssistRecipesPage() {
  return (
    <div>
      <SectionHeader title="All recipes" />
      <p className="mb-5 text-[15px] text-[var(--sa-ink-soft)]">
        Filtering by cost, time, and dietary needs, plus the full discovery grid, lands in Phase 2.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {seedRecipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
