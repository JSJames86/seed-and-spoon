'use client';

import { useState } from 'react';

export default function IngredientTable({ ingredients, onChange }) {
  const [servingScale, setServingScale] = useState(1);

  const handleFieldChange = (id, field, value) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, [field]: value };
      }
      return ing;
    });
    onChange(updated);
  };

  const handleQuantityChange = (id, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleFieldChange(id, 'quantity', numValue);
    }
  };

  const handleRemove = (id) => {
    const updated = ingredients.filter(ing => ing.id !== id);
    onChange(updated);
  };

  const handleAddRow = () => {
    const newIngredient = {
      id: `ingredient-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'each'
    };
    onChange([...ingredients, newIngredient]);
  };

  const handleScaleServings = () => {
    if (servingScale <= 0) return;
    const scaled = ingredients.map(ing => ({
      ...ing,
      quantity: ing.quantity * servingScale
    }));
    onChange(scaled);
    setServingScale(1); // Reset
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Ingredients</h3>
        <button
          onClick={handleAddRow}
          className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
        >
          + Add Row
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
          No ingredients yet. Add manually or parse from recipe text above.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Ingredient</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Unit</th>
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, idx) => (
                  <tr key={ing.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) => handleFieldChange(ing.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        placeholder="e.g., flour"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                        min="0.01"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={ing.unit}
                        onChange={(e) => handleFieldChange(ing.id, 'unit', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                      >
                        <option value="each">each</option>
                        <option value="cup">cup</option>
                        <option value="cups">cups</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="pinch">pinch</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleRemove(ing.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Scale Servings:</label>
            <input
              type="number"
              value={servingScale}
              onChange={(e) => setServingScale(parseFloat(e.target.value) || 1)}
              min="0.1"
              step="0.5"
              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={handleScaleServings}
              disabled={servingScale <= 0 || servingScale === 1}
              className="px-4 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Apply Scale
            </button>
            <span className="text-xs text-gray-500">(e.g., 2 = double, 0.5 = halve)</span>
          </div>
        </>
      )}
    </div>
  );
}
