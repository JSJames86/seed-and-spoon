'use client';

import { useEffect, useRef, useState } from 'react';

const SCALE_DEBOUNCE_MS = 400;

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

export default function IngredientTable({ ingredients, onChange }) {
  const [scaleInput, setScaleInput] = useState('1');

  // Raw text of each quantity field while it's being edited, so the input can
  // be cleared to empty (or an intermediate value like "1.") without snapping
  // back to the last valid quantity on every keystroke.
  const [quantityDrafts, setQuantityDrafts] = useState({});

  // Tracks the multiplier already baked into the current quantities, so a new
  // scale value can be applied as an incremental factor (newScale / prevScale)
  // rather than compounding from scratch each time.
  const appliedScaleRef = useRef(1);
  const ingredientsRef = useRef(ingredients);
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef(null);
  const isInternalUpdateRef = useRef(false);

  ingredientsRef.current = ingredients;
  onChangeRef.current = onChange;

  // Reset scale tracking when a new ingredient list arrives from outside this
  // component (e.g. a different recipe is selected or parsed in).
  useEffect(() => {
    if (!isInternalUpdateRef.current) {
      appliedScaleRef.current = 1;
      setScaleInput('1');
    }
    isInternalUpdateRef.current = false;
  }, [ingredients]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const emitChange = (updated) => {
    isInternalUpdateRef.current = true;
    onChangeRef.current(updated);
  };

  const handleFieldChange = (id, field, value) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, [field]: value };
      }
      return ing;
    });
    emitChange(updated);
  };

  const handleQuantityChange = (id, value) => {
    setQuantityDrafts(prev => ({ ...prev, [id]: value }));
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      handleFieldChange(id, 'quantity', numValue);
    }
  };

  const handleQuantityBlur = (id) => {
    setQuantityDrafts(prev => {
      if (!(id in prev)) return prev;
      const { [id]: _omit, ...rest } = prev;
      return rest;
    });
  };

  const handleRemove = (id) => {
    const updated = ingredients.filter(ing => ing.id !== id);
    emitChange(updated);
  };

  const handleAddRow = () => {
    const newIngredient = {
      id: `ingredient-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'each'
    };
    emitChange([...ingredients, newIngredient]);
  };

  const handleScaleInputChange = (e) => {
    const value = e.target.value;
    setScaleInput(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const newScale = parseFloat(value);
    if (isNaN(newScale) || newScale <= 0) return;

    debounceRef.current = setTimeout(() => {
      const prevScale = appliedScaleRef.current;
      if (newScale === prevScale) return;

      const factor = newScale / prevScale;
      const scaled = ingredientsRef.current.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity * factor * 100) / 100,
      }));

      appliedScaleRef.current = newScale;
      emitChange(scaled);
    }, SCALE_DEBOUNCE_MS);
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
                  <th className="px-4 py-2 text-center font-semibold text-gray-700">
                    <span className="sr-only">Remove</span>
                  </th>
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
                        value={quantityDrafts[ing.id] ?? ing.quantity}
                        onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                        onBlur={() => handleQuantityBlur(ing.id)}
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
                        aria-label={`Remove ${ing.name || 'ingredient'}`}
                        title="Remove"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="serving-scale" className="text-sm font-medium text-gray-700">
              Scale Servings:
            </label>
            <input
              id="serving-scale"
              type="number"
              value={scaleInput}
              onChange={handleScaleInputChange}
              min="0.1"
              step="0.5"
              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
            />
            <span className="text-xs text-gray-500">Quantities update automatically (e.g., 2 = double, 0.5 = halve)</span>
          </div>
        </>
      )}
    </div>
  );
}
