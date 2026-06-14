'use client';

import { useState, useMemo } from 'react';
import HeroSection from '@/components/recipes/HeroSection';
import SearchBar from '@/components/recipes/SearchBar';
import CategoryFilter from '@/components/recipes/CategoryFilter';
import FilterBar from '@/components/recipes/FilterBar';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import RecipeModal from '@/components/recipes/RecipeModal';
import { recipes, getCategories, getAllTags, filterRecipes } from '@/data/recipes';

const INITIAL_FILTERS = {
  search: '',
  category: 'All',
  cookTime: 'all',
  tags: [],
};

/**
 * Recipes Page
 *
 * Main page component for the recipes feature.
 * Displays all recipes with search and filtering (category, cook time,
 * tags) plus a detailed modal view. All filters combine with AND logic.
 *
 * This is a client-side only page (no backend required).
 * Uses Next.js App Router.
 *
 * @page
 */
export default function RecipesPage() {
  // Combined filter state (search, category, cook time, tags)
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // State for selected recipe (opens modal)
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Get all available categories and tags
  const categories = useMemo(() => getCategories(), []);
  const allTags = useMemo(() => getAllTags(), []);

  // Apply all active filters (memoized for performance)
  const filteredRecipes = useMemo(() => filterRecipes(recipes, filters), [filters]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.cookTime !== 'all' ||
    filters.tags.length > 0;

  // Handle search input
  const handleSearchChange = (search) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  // Handle cook time change
  const handleCookTimeChange = (cookTime) => {
    setFilters((prev) => ({ ...prev, cookTime }));
  };

  // Toggle a tag in the multi-select tag filter
  const handleToggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // Reset all filters to their initial state
  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
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
          Search by name, filter by category, cook time, and tags, and view
          detailed cooking instructions.
        </p>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Search */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <SearchBar value={filters.search} onChange={handleSearchChange} />
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        activeCategory={filters.category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Cook Time + Tags Filters */}
      <FilterBar
        cookTime={filters.cookTime}
        onCookTimeChange={handleCookTimeChange}
        allTags={allTags}
        selectedTags={filters.tags}
        onToggleTag={handleToggleTag}
        resultsCount={filteredRecipes.length}
        totalCount={recipes.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        onRecipeClick={handleRecipeClick}
        onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
      />

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
