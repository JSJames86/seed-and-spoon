'use client';

import { spoonInputClass, spoonLabelClass } from './ui/Input';

export default function RecipeDropdown({ recipes, onSelect, selectedRecipe }) {
  const handleChange = (e) => {
    const recipeId = e.target.value;
    if (recipeId) {
      const recipe = recipes.find(r => String(r.id) === recipeId);
      onSelect(recipe);
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="recipe-select" className={spoonLabelClass}>
        Select a Recipe
      </label>
      <select
        id="recipe-select"
        value={selectedRecipe?.id || ''}
        onChange={handleChange}
        className={spoonInputClass}
      >
        <option value="">-- Choose a recipe --</option>
        {recipes.map(recipe => (
          <option key={recipe.id} value={recipe.id}>
            {recipe.title}
          </option>
        ))}
      </select>
    </div>
  );
}
