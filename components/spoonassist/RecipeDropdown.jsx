'use client';

export default function RecipeDropdown({ recipes, onSelect, selectedRecipe }) {
  const handleChange = (e) => {
    const recipeId = e.target.value;
    if (recipeId) {
      const recipe = recipes.find(r => r.id === recipeId);
      onSelect(recipe);
    } else {
      onSelect(null);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="recipe-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select a Recipe
      </label>
      <select
        id="recipe-select"
        value={selectedRecipe?.id || ''}
        onChange={handleChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
      >
        <option value="">-- Choose a recipe --</option>
        {recipes.map(recipe => (
          <option key={recipe.id} value={recipe.id}>
            {recipe.name}
          </option>
        ))}
      </select>
    </div>
  );
}
