'use client';

import { useState } from 'react';

// Parse ingredient text into structured data
function parseIngredients(text) {
  const lines = text.split('\n').filter(line => line.trim());
  const ingredients = [];

  // Fraction to decimal mapping
  const fractionMap = {
    '½': 0.5, '⅓': 0.333, '⅔': 0.667, '¼': 0.25, '¾': 0.75,
    '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 0.167,
    '⅚': 0.833, '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
  };

  // Units to detect (prioritized by length to match longest first)
  const units = ['tablespoon', 'tablespoons', 'teaspoon', 'teaspoons', 'tbsp', 'tsp',
                 'cup', 'cups', 'ounce', 'ounces', 'oz', 'pound', 'pounds', 'lb', 'lbs',
                 'gram', 'grams', 'g', 'kilogram', 'kilograms', 'kg', 'each', 'pinch', 'dash', 'whole'];

  lines.forEach((line, index) => {
    let cleaned = line.trim().toLowerCase();

    // Remove bullet points, numbers, dashes at start
    cleaned = cleaned.replace(/^[-•*\d.)\]]+\s*/, '');

    // Try to extract quantity and unit
    let quantity = 1;
    let unit = 'each';
    let name = cleaned;

    // Pattern: look for numbers (including fractions) at start
    const quantityPattern = /^([\d\s\/½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞.]+)\s*/;
    const match = cleaned.match(quantityPattern);

    if (match) {
      let quantityStr = match[1].trim();

      // Handle fractions
      Object.keys(fractionMap).forEach(frac => {
        if (quantityStr.includes(frac)) {
          quantityStr = quantityStr.replace(frac, fractionMap[frac].toString());
        }
      });

      // Handle "1/2" style fractions
      const fractionPattern = /(\d+)\s*\/\s*(\d+)/g;
      quantityStr = quantityStr.replace(fractionPattern, (match, num, denom) => {
        return (parseFloat(num) / parseFloat(denom)).toString();
      });

      // Handle "1 1/2" style (mixed numbers)
      const mixedPattern = /(\d+)\s+([\d.]+)/;
      const mixedMatch = quantityStr.match(mixedPattern);
      if (mixedMatch) {
        quantity = parseFloat(mixedMatch[1]) + parseFloat(mixedMatch[2]);
      } else {
        quantity = parseFloat(quantityStr) || 1;
      }

      // Remove quantity from name
      name = cleaned.substring(match[0].length).trim();
    }

    // Extract unit
    for (const u of units) {
      const unitRegex = new RegExp(`^${u}\\b`, 'i');
      if (unitRegex.test(name)) {
        unit = u;
        name = name.substring(u.length).trim();
        break;
      }
    }

    // Clean up name (remove "of", extra spaces, etc.)
    name = name.replace(/^(of|to)\s+/, '').trim();

    // Only add if we have a valid name
    if (name) {
      ingredients.push({
        id: `ingredient-${index}-${Date.now()}`,
        name: name,
        quantity: Math.max(0.01, quantity), // Ensure positive
        unit: unit
      });
    }
  });

  return ingredients;
}

export default function RecipeTextInput({ onParsed }) {
  const [recipeText, setRecipeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = () => {
    if (!recipeText.trim()) return;

    setIsParsing(true);

    // Parse ingredients
    const ingredients = parseIngredients(recipeText);

    // Simulate brief processing delay for UX
    setTimeout(() => {
      onParsed(ingredients);
      setIsParsing(false);
      setRecipeText(''); // Clear after parsing
    }, 300);
  };

  return (
    <div className="w-full">
      <label htmlFor="recipe-text" className="block text-sm font-medium text-gray-700 mb-2">
        Or Paste Recipe Text
      </label>
      <textarea
        id="recipe-text"
        value={recipeText}
        onChange={(e) => setRecipeText(e.target.value)}
        placeholder="Paste your recipe here... (e.g., '2 cups flour, 1/2 tsp salt, 3 eggs')"
        rows={6}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm resize-y"
      />
      <button
        onClick={handleParse}
        disabled={!recipeText.trim() || isParsing}
        className="mt-3 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isParsing ? 'Parsing...' : 'Parse & Add Ingredients'}
      </button>
      <p className="mt-2 text-xs text-gray-500">
        Tip: Each ingredient on a new line. Supports fractions (½, 1/2) and common units (cup, tbsp, oz, lb, g, kg).
      </p>
    </div>
  );
}
