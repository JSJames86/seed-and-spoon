'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import RecipeDropdown from '@/components/spoonassist/RecipeDropdown';
import RecipeTextInput from '@/components/spoonassist/RecipeTextInput';
import IngredientTable from '@/components/spoonassist/IngredientTable';
import StoreSelector from '@/components/spoonassist/StoreSelector';
import DietaryFilters from '@/components/spoonassist/DietaryFilters';
import CostResultsTable from '@/components/spoonassist/CostResultsTable';
import CSVExportButton from '@/components/spoonassist/CSVExportButton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function SpoonAssistPage() {
  // State management
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState({
    recipes: false,
    stores: false,
    calculation: false
  });
  const [error, setError] = useState(null);

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(prev => ({ ...prev, recipes: true }));
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/`);
      if (!response.ok) throw new Error('Failed to fetch recipes');

      const data = await response.json();
      setRecipes(data.recipes || data || []);
    } catch (err) {
      setError('Could not load recipes. Please try again later.');
      console.error('Recipe fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, recipes: false }));
    }
  };

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
    if (recipe?.ingredients) {
      // Map recipe ingredients to our format
      const formattedIngredients = recipe.ingredients.map((ing, idx) => ({
        id: `recipe-ingredient-${idx}-${Date.now()}`,
        name: ing.name || ing.ingredient || ing,
        quantity: ing.quantity || 1,
        unit: ing.unit || 'each'
      }));
      setIngredients(formattedIngredients);
    }
  };

  const handleParsedIngredients = (parsedIngredients) => {
    // Add parsed ingredients to existing ones
    setIngredients(prev => [...prev, ...parsedIngredients]);
  };

  const handleFindStores = async (zip) => {
    setLoading(prev => ({ ...prev, stores: true }));
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/stores/?zip=${zip}`);
      if (!response.ok) throw new Error('Failed to fetch stores');

      const data = await response.json();
      const storesList = data.stores || data || [];
      setStores(storesList);
      // Auto-select all stores
      setSelectedStores(storesList.map(s => s.id));
    } catch (err) {
      setError('Could not find stores for this ZIP code.');
      console.error('Store fetch error:', err);
      setStores([]);
    } finally {
      setLoading(prev => ({ ...prev, stores: false }));
    }
  };

  const handleCalculateCost = async () => {
    if (ingredients.length === 0) {
      setError('Please add ingredients first.');
      return;
    }

    if (selectedStores.length === 0) {
      setError('Please select at least one store.');
      return;
    }

    setLoading(prev => ({ ...prev, calculation: true }));
    setError(null);

    try {
      // Prepare request payload
      const payload = {
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        storeIds: selectedStores,
        dietaryFilters: dietaryFilters
      };

      const response = await fetch(`${API_BASE_URL}/calc_recipe_cost/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to calculate costs');

      const data = await response.json();
      setCostData(data.costData || data.results || data || []);
    } catch (err) {
      setError('Could not calculate costs. Please try again.');
      console.error('Cost calculation error:', err);
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Image
              src="/spoonassist/logo.png"
              alt="SpoonAssist Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SpoonAssist</h1>
              <p className="text-gray-600">Compare local grocery prices and save on recipes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Recipe Selection */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Choose or Enter Recipe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <RecipeDropdown
              recipes={recipes}
              onSelect={handleRecipeSelect}
              selectedRecipe={selectedRecipe}
            />
            <RecipeTextInput onParsed={handleParsedIngredients} />
          </div>
        </section>

        {/* Section 2: Ingredients Table */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Review & Edit Ingredients</h2>
          <IngredientTable ingredients={ingredients} onChange={setIngredients} />
        </section>

        {/* Section 3: Store Selection */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Select Stores</h2>
          <StoreSelector
            onFindStores={handleFindStores}
            stores={stores}
            selectedStores={selectedStores}
            onStoreChange={setSelectedStores}
            loading={loading.stores}
          />
        </section>

        {/* Section 4: Dietary Filters */}
        <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 4: Dietary Preferences (Optional)</h2>
          <DietaryFilters
            selectedFilters={dietaryFilters}
            onChange={setDietaryFilters}
          />
        </section>

        {/* Section 5: Calculate Button */}
        <section className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md border-2 border-green-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Step 5: Get Price Comparison</h2>
              <p className="text-gray-700 mt-1">
                {ingredients.length} ingredients • {selectedStores.length} stores selected
              </p>
            </div>
            <button
              onClick={handleCalculateCost}
              disabled={loading.calculation || ingredients.length === 0 || selectedStores.length === 0}
              className="px-8 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {loading.calculation ? 'Calculating...' : 'Calculate Costs'}
            </button>
          </div>
        </section>

        {/* Section 6: Results */}
        {costData && costData.length > 0 && (
          <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Results</h2>
              <CSVExportButton costData={costData} ingredients={ingredients} />
            </div>
            <CostResultsTable costData={costData} />
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>SpoonAssist is a service by Seed & Spoon</p>
          <p className="mt-1">Helping you save money on healthy, delicious meals</p>
        </footer>
      </main>
    </div>
  );
}
