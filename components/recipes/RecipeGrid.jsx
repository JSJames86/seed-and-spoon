'use client';

import RecipeCard from './RecipeCard';

/**
 * RecipeGrid Component
 *
 * Displays a responsive grid of recipe cards.
 * Handles empty states and provides accessible structure.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.recipes - Array of recipe objects to display
 * @param {Function} props.onRecipeClick - Callback when a recipe card is clicked
 *
 * @example
 * <RecipeGrid
 *   recipes={filteredRecipes}
 *   onRecipeClick={(recipe) => setSelectedRecipe(recipe)}
 * />
 */
export default function RecipeGrid({ recipes, onRecipeClick }) {
  // Handle empty state
  if (!recipes || recipes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or check back later for new recipes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Accessible heading for screen readers */}
      <h2 className="sr-only">Recipe List</h2>

      {/* Recipe Grid */}
      <div
        id="recipe-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        role="region"
        aria-label="Recipe cards"
      >
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => onRecipeClick(recipe)}
            index={index}
          />
        ))}
      </div>

      {/* Results count for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        Showing {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
      </div>
    </div>
  );
}
