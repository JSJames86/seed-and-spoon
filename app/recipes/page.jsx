'use client';

import { useState, useMemo } from 'react';
import HeroSection from '@/components/recipes/HeroSection';
import CategoryFilter from '@/components/recipes/CategoryFilter';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import RecipeModal from '@/components/recipes/RecipeModal';
import { recipes, getCategories, filterRecipesByCategory } from '@/data/recipes';

/**
 * Recipes Page
 *
 * Main page component for the recipes feature.
 * Displays all recipes with filtering by category and detailed modal view.
 *
 * This is a client-side only page (no backend required).
 * Uses Next.js App Router.
 *
 * @page
 */
export default function RecipesPage() {
  // State for active category filter
  const [activeCategory, setActiveCategory] = useState('All');

  // State for selected recipe (opens modal)
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Get all available categories
  const categories = useMemo(() => getCategories(), []);

  // Filter recipes based on active category (memoized for performance)
  const filteredRecipes = useMemo(
    () => filterRecipesByCategory(activeCategory),
    [activeCategory]
  );

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Handle recipe click (open modal)
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedRecipe(null);
  };

  return (
    <main className="min-h-screen bg-neutral-cream">
      {/* Page Metadata */}
      <div className="sr-only">
        <h1>Recipes - Healthy Plant-Based Meals</h1>
        <p>
          Browse our collection of delicious, healthy plant-based recipes.
          Filter by category and view detailed cooking instructions.
        </p>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Recipe Grid */}
      <RecipeGrid recipes={filteredRecipes} onRecipeClick={handleRecipeClick} />

      {/* Recipe Modal */}
      <RecipeModal recipe={selectedRecipe} onClose={handleModalClose} />
    </main>
  );
}

/**
 * NOTE: Page Metadata for SEO
 *
 * This page uses "use client" for interactivity (filtering, modal state).
 * In Next.js, you cannot export metadata from client components.
 *
 * The page title and description are handled via:
 * 1. The screen-reader-only <h1> and <p> tags in the JSX above
 * 2. If you need custom metadata, create a layout.jsx file in app/recipes/
 *    without "use client" and export metadata there.
 */
