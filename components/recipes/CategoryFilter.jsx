'use client';

import { motion } from 'framer-motion';

/**
 * CategoryFilter Component
 *
 * Displays clickable category buttons to filter recipes.
 * Highlights the currently selected category with active styling.
 *
 * @component
 * @param {Object} props
 * @param {string[]} props.categories - Array of category names
 * @param {string} props.activeCategory - Currently selected category
 * @param {Function} props.onCategoryChange - Callback when category is selected
 *
 * @example
 * <CategoryFilter
 *   categories={['All', 'Soups & Stews', 'Salads & Bowls']}
 *   activeCategory="All"
 *   onCategoryChange={(category) => setActiveCategory(category)}
 * />
 */
export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <div className="bg-white py-8 px-4 shadow-sm sticky top-0 z-20 border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">
          Filter by Category
        </h2>

        {/* Category Buttons */}
        <div
          className="flex flex-wrap gap-3 justify-center md:justify-start"
          role="tablist"
          aria-label="Recipe categories"
        >
          {categories.map((category) => {
            const isActive = category === activeCategory;

            return (
              <motion.button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`
                  px-5 py-2.5 rounded-full font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2
                  ${
                    isActive
                      ? 'bg-green-primary text-white shadow-green-glow'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="tab"
                aria-selected={isActive}
                aria-controls="recipe-grid"
              >
                {category}
              </motion.button>
            );
          })}
        </div>

        {/* Active Category Indicator (for screen readers) */}
        <div className="sr-only" role="status" aria-live="polite">
          Showing {activeCategory} recipes
        </div>
      </div>
    </div>
  );
}

/**
 * FALLBACK VERSION (without framer-motion):
 *
 * If you want to remove framer-motion dependency, replace the component with this:
 *
 * export default function CategoryFilter({
 *   categories,
 *   activeCategory,
 *   onCategoryChange,
 * }) {
 *   return (
 *     <div className="bg-white py-8 px-4 shadow-sm sticky top-0 z-20 border-b border-gray-200">
 *       <div className="max-w-6xl mx-auto">
 *         <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center md:text-left">
 *           Filter by Category
 *         </h2>
 *
 *         <div
 *           className="flex flex-wrap gap-3 justify-center md:justify-start"
 *           role="tablist"
 *           aria-label="Recipe categories"
 *         >
 *           {categories.map((category) => {
 *             const isActive = category === activeCategory;
 *
 *             return (
 *               <button
 *                 key={category}
 *                 onClick={() => onCategoryChange(category)}
 *                 className={`
 *                   px-5 py-2.5 rounded-full font-medium transition-all duration-200
 *                   transform hover:scale-105 active:scale-95
 *                   focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2
 *                   ${
 *                     isActive
 *                       ? 'bg-green-primary text-white shadow-green-glow'
 *                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
 *                   }
 *                 `}
 *                 role="tab"
 *                 aria-selected={isActive}
 *                 aria-controls="recipe-grid"
 *               >
 *                 {category}
 *               </button>
 *             );
 *           })}
 *         </div>
 *
 *         <div className="sr-only" role="status" aria-live="polite">
 *           Showing {activeCategory} recipes
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 */
