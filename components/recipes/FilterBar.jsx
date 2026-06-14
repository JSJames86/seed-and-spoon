'use client';

import { COOK_TIME_FILTERS } from '@/data/recipes';

// Converts a kebab-case tag like "gluten-free" into "Gluten Free" for display.
const formatTagLabel = (tag) =>
  tag.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

/**
 * FilterBar Component
 *
 * Cook time (single-select) and tag (multi-select, AND) filters, plus a
 * results count and a "Clear filters" control.
 *
 * @component
 * @param {Object} props
 * @param {string} props.cookTime - Selected cook time bucket ('all' | '15' | '30' | '30+')
 * @param {Function} props.onCookTimeChange - Called with the newly selected cook time bucket
 * @param {string[]} props.allTags - All available tags to choose from
 * @param {string[]} props.selectedTags - Currently selected tags
 * @param {Function} props.onToggleTag - Called with a tag to toggle its selection
 * @param {number} props.resultsCount - Number of recipes matching the active filters
 * @param {number} props.totalCount - Total number of recipes
 * @param {boolean} props.hasActiveFilters - Whether any filter is currently active
 * @param {Function} props.onClearFilters - Resets all filters
 */
export default function FilterBar({
  cookTime,
  onCookTimeChange,
  allTags,
  selectedTags,
  onToggleTag,
  resultsCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div className="bg-white py-6 px-4 border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Cook Time */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Cook Time</h3>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Filter by cook time"
          >
            {COOK_TIME_FILTERS.map((option) => {
              const isActive = cookTime === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => onCookTimeChange(option.value)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2
                    ${
                      isActive
                        ? 'bg-green-primary text-white shadow-green-glow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by tag (select multiple)"
          >
            {allTags.map((tag) => {
              const isActive = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onToggleTag(tag)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2
                    ${
                      isActive
                        ? 'bg-green-primary text-white shadow-green-glow'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {formatTagLabel(tag)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count + Clear filters */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-600" role="status" aria-live="polite">
            Showing {resultsCount} of {totalCount} recipes
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-medium text-green-primary hover:text-green-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 rounded"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
