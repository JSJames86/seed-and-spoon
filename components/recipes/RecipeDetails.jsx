import Image from 'next/image';

/**
 * RecipeDetails
 *
 * Presentational recipe content (image, header, ingredients, instructions,
 * notes, nutrition, tags) shared between RecipeModal (quick preview) and the
 * standalone /recipes/[slug] page, so both render identical markup without
 * duplicating JSX.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.recipe - Recipe object to display
 * @param {string} [props.titleId] - Optional id for the title heading (e.g. for aria-labelledby)
 */
export default function RecipeDetails({ recipe, titleId }) {
  const {
    title,
    category,
    difficulty,
    prepTime,
    cookTime,
    servings,
    description,
    image,
    ingredients,
    instructions,
    notes,
    tags,
    nutrition,
  } = recipe;

  const imageSrc = image || '/images/recipes/placeholder.png';

  return (
    <>
      {/* Recipe Image */}
      <div className="relative h-64 md:h-80 w-full bg-gray-200">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 900px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-green-primary">{category}</span>
            {difficulty && (
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold text-white
                  ${
                    difficulty === 'Easy'
                      ? 'bg-green-primary'
                      : difficulty === 'Medium'
                      ? 'bg-orange-primary'
                      : 'bg-red-500'
                  }
                `}
              >
                {difficulty}
              </span>
            )}
          </div>

          <h1 id={titleId} className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>

          {description && <p className="text-gray-600 text-lg">{description}</p>}
        </div>

        {/* Quick Info */}
        {(prepTime || cookTime || servings) && (
          <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b border-gray-200">
            {prepTime && (
              <div>
                <div className="text-sm text-gray-500">Prep Time</div>
                <div className="text-lg font-semibold text-gray-900">{prepTime}</div>
              </div>
            )}
            {cookTime && (
              <div>
                <div className="text-sm text-gray-500">Cook Time</div>
                <div className="text-lg font-semibold text-gray-900">{cookTime}</div>
              </div>
            )}
            {servings && (
              <div>
                <div className="text-sm text-gray-500">Servings</div>
                <div className="text-lg font-semibold text-gray-900">{servings}</div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout for Ingredients and Instructions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ingredients */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
            {ingredients?.length > 0 ? (
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-green-primary mt-1.5 flex-shrink-0">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No ingredients listed.</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
            {instructions?.length > 0 ? (
              <ol className="space-y-4">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">No instructions listed.</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Notes</h2>
            <p className="text-gray-700">{notes}</p>
          </div>
        )}

        {/* Nutrition Info */}
        {nutrition && (
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nutrition (per serving)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Calories</div>
                <div className="text-lg font-semibold text-gray-900">{nutrition.calories}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Protein</div>
                <div className="text-lg font-semibold text-gray-900">{nutrition.protein}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Carbs</div>
                <div className="text-lg font-semibold text-gray-900">{nutrition.carbs}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Fat</div>
                <div className="text-lg font-semibold text-gray-900">{nutrition.fat}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
