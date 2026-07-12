'use client';

import { useState, useMemo } from 'react';
import HeroSection from '@/components/recipes/HeroSection';
import SearchBar from '@/components/recipes/SearchBar';
import CategoryFilter from '@/components/recipes/CategoryFilter';
import FilterBar from '@/components/recipes/FilterBar';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import RecipeModal from '@/components/recipes/RecipeModal';
import { getCategories, getAllTags, filterRecipes } from '@/data/recipes';

const INITIAL_FILTERS = {
  search: '',
  category: 'All',
  cookTime: 'all',
  tags: [],
};

/**
 * RecipesPageClient
 *
 * Client-side search/filter/modal interactivity for the recipes page.
 * Receives the full recipe catalog (Supabase `recipes` table, merged with
 * data/recipes.js fallback content) as a prop from the server component in
 * app/recipes/page.jsx.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.recipes - Full recipe catalog to search/filter over
 */
export default function RecipesPageClient({ recipes }) {
  // Combined filter state (search, category, cook time, tags)
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // State for selected recipe (opens modal)
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Get all available categories and tags from the current catalog
  const categories = useMemo(() => getCategories(recipes), [recipes]);
  const allTags = useMemo(() => getAllTags(recipes), [recipes]);

  // Apply all active filters (memoized for performance)
  const filteredRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);

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
    <div className="min-h-screen bg-neutral-cream">
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
      <HeroSection count={recipes.length} />

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
    </div>
  );
}
