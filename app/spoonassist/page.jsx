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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/spoonassist/logo.png"
                alt="SpoonAssist Logo"
                width={200}
                height={200}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              SpoonAssist
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl leading-relaxed drop-shadow-md">
              Compare local grocery prices for any recipe and create smart shopping lists that save you money
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold text-white">Price Comparison</div>
                <div className="text-sm text-white/90">Multiple stores</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="text-3xl mb-2">🥗</div>
                <div className="font-semibold text-white">Dietary Options</div>
                <div className="text-sm text-white/90">Filter preferences</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-semibold text-white">Smart Lists</div>
                <div className="text-sm text-white/90">Export to CSV</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
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
