'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * RecipeCard Component
 *
 * Displays a single recipe in card format with image, title, metadata, and quick info.
 * Clickable to open full recipe details in a modal.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.recipe - Recipe object containing all recipe data
 * @param {Function} props.onClick - Callback when card is clicked
 * @param {number} props.index - Index for staggered animation
 *
 * @example
 * <RecipeCard
 *   recipe={recipeObject}
 *   onClick={() => openModal(recipeObject)}
 *   index={0}
 * />
 */
export default function RecipeCard({ recipe, onClick, index = 0 }) {
  const {
    slug,
    title,
    category,
    difficulty,
    prepTime,
    cookTime,
    servings,
    description,
    image,
    tags,
  } = recipe;

  // Fallback image if recipe image is not available
  const imageSrc = image || '/images/recipes/placeholder.png';

  const handlePreviewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <motion.article
      className="relative bg-white rounded-xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-lg hover:-translate-y-1 focus-within:ring-2 focus-within:ring-green-primary focus-within:ring-offset-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/recipes/${slug}`} className="block" aria-label={`View recipe: ${title}`}>
        {/* Recipe Image */}
        <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = '/images/recipes/placeholder.png';
            }}
          />

          {/* Difficulty Badge */}
          {difficulty && (
            <div className="absolute top-3 right-3">
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm
                ${
                  difficulty === 'Easy'
                    ? 'bg-green-primary/90'
                    : difficulty === 'Medium'
                    ? 'bg-orange-primary/90'
                    : 'bg-red-500/90'
                }
              `}
              >
                {difficulty}
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Category */}
          <div className="text-sm text-green-primary font-medium mb-2">
            {category}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>

          {/* Recipe Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            {(prepTime || cookTime) && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{prepTime && cookTime ? `${prepTime} + ${cookTime}` : prepTime || cookTime}</span>
              </div>
            )}
            {servings && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{servings}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Quick preview button - opens the modal without leaving the grid.
          Anchored to the fixed-height image area (not the card bottom,
          which shifts with variable tag/description content) and kept as
          a sibling of the Link, not nested inside its anchor. */}
      <button
        type="button"
        onClick={handlePreviewClick}
        className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 shadow-md hover:bg-white hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2"
        aria-label={`Quick preview: ${title}`}
      >
        Quick preview
      </button>
    </motion.article>
  );
}

/**
 * FALLBACK VERSION (without framer-motion):
 *
 * Replace motion.article with regular article and remove motion-specific props:
 *
 * <article
 *   className="bg-white rounded-xl shadow-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card-lg hover:-translate-y-1 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-green-primary focus-within:ring-offset-2"
 *   onClick={onClick}
 *   role="button"
 *   tabIndex={0}
 *   onKeyDown={(e) => {
 *     if (e.key === 'Enter' || e.key === ' ') {
 *       e.preventDefault();
 *       onClick();
 *     }
 *   }}
 *   aria-label={`View recipe: ${title}`}
 * >
 *   {/* Rest of the component stays the same *\/}
 * </article>
 */
