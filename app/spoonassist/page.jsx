'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';
import RecipeDropdown from '@/components/spoonassist/RecipeDropdown';
import RecipeTextInput from '@/components/spoonassist/RecipeTextInput';
import IngredientTable from '@/components/spoonassist/IngredientTable';
import StoreSelector from '@/components/spoonassist/StoreSelector';
import DietaryFilters from '@/components/spoonassist/DietaryFilters';
import CostResultsTable from '@/components/spoonassist/CostResultsTable';
import CSVExportButton from '@/components/spoonassist/CSVExportButton';
import PoweredBy from '@/components/spoonassist/PoweredBy';
import InstacartCTA from '@/components/spoonassist/InstacartCTA';
import InstacartRetailerSelector from '@/components/spoonassist/InstacartRetailerSelector';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function InlineError({ message, onDismiss }) {
  return (
    <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center justify-between gap-3">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-800 font-medium shrink-0"
      >
        Dismiss
      </button>
    </div>
  );
}

export default function SpoonAssistPage() {
  // State management
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [dietaryFilters, setDietaryFilters] = useState([]);
  const [costData, setCostData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [instacartUrl, setInstacartUrl] = useState(null);
  const [instacartRetailers, setInstacartRetailers] = useState([]);
  const [selectedRetailerKey, setSelectedRetailerKey] = useState(null);
  const [features, setFeatures] = useState({ kroger: false, instacart: false });
  const [loading, setLoading] = useState({
    recipes: false,
    stores: false,
    calculation: false,
    instacart: false,
    instacartRetailers: false,
  });
  const [recipeError, setRecipeError] = useState(null);
  const [storeError, setStoreError] = useState(null);
  const [costError, setCostError] = useState(null);
  const [instacartError, setInstacartError] = useState(null);

  // Fetch recipes + feature flags on mount
  useEffect(() => {
    captureEvent(EVENTS.SPOONASSIST_SESSION_STARTED, { user_type: 'anonymous' });
    fetchRecipes();
    fetch(`${API_BASE_URL}/features/`)
      .then(r => r.json())
      .then(data => setFeatures(data))
      .catch(() => {});
  }, []);

  const fetchRecipes = async () => {
    setLoading(prev => ({ ...prev, recipes: true }));
    setRecipeError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/`);
      if (!response.ok) throw new Error('Failed to fetch recipes');

      const data = await response.json();
      setRecipes(data.recipes || data || []);
    } catch (err) {
      setRecipeError('Could not load recipes. Please try again later.');
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
    setZipCode(zip);
    setSelectedRetailerKey(null);
    setLoading(prev => ({ ...prev, stores: true }));
    setStoreError(null);

    const fetches = [fetch(`${API_BASE_URL}/stores/?zip=${zip}`)];
    if (features.instacart) {
      fetches.push(fetch(`${API_BASE_URL}/instacart_retailers/?zip=${zip}`));
      setLoading(prev => ({ ...prev, instacartRetailers: true }));
    }

    const [storesRes, retailersRes] = await Promise.allSettled(fetches);

    try {
      if (storesRes.status === 'rejected' || !storesRes.value.ok) throw new Error('Failed to fetch stores');
      const data = await storesRes.value.json();
      const storesList = data.stores || data || [];
      setStores(storesList);
      setSelectedStores(storesList.map(s => s.id));
    } catch (err) {
      setStoreError('Could not find stores for this ZIP code.');
      console.error('Store fetch error:', err);
      setStores([]);
    } finally {
      setLoading(prev => ({ ...prev, stores: false }));
    }

    if (retailersRes) {
      try {
        if (retailersRes.status === 'fulfilled' && retailersRes.value.ok) {
          const data = await retailersRes.value.json();
          setInstacartRetailers(data.retailers || []);
        }
      } catch {
        setInstacartRetailers([]);
      } finally {
        setLoading(prev => ({ ...prev, instacartRetailers: false }));
      }
    }
  };

  const handleCalculateCost = async () => {
    if (ingredients.length === 0) {
      setCostError('Please add ingredients first.');
      return;
    }

    if (selectedStores.length === 0) {
      setCostError('Please select at least one store.');
      return;
    }

    setLoading(prev => ({ ...prev, calculation: true }));
    setCostError(null);

    captureEvent(EVENTS.SPOONASSIST_QUERY_SUBMITTED, {
      query_type: 'cost_calculation',
      user_type: 'anonymous',
    });

    const queryStart = Date.now();

    try {
      // Prepare request payload
      const payload = {
        ingredients: ingredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        storeIds: selectedStores,
        zipCode: zipCode,
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
      setSummary(data.summary || null);

      captureEvent(EVENTS.SPOONASSIST_RESPONSE_RECEIVED, {
        latency_ms: Date.now() - queryStart,
        query_type: 'cost_calculation',
      });
    } catch (err) {
      setCostError('Could not calculate costs. Please try again.');
      console.error('Cost calculation error:', err);
      captureEvent(EVENTS.SPOONASSIST_ERROR, {
        error_type: 'cost_calculation_failed',
        query_type: 'cost_calculation',
      });
    } finally {
      setLoading(prev => ({ ...prev, calculation: false }));
    }
  };

  // Cache helpers — store generated Instacart URLs in localStorage keyed by
  // recipe ID + ingredient fingerprint so we reuse them until they expire.
  const CACHE_TTL_MS = 29 * 24 * 60 * 60 * 1000; // 29 days (Instacart expires at 30)

  function instacartCacheKey(recipeId, ings) {
    const fingerprint = ings.map(i => `${i.name}:${i.quantity}:${i.unit}`).sort().join('|');
    return `instacart_url_${recipeId}_${fingerprint}`;
  }

  function readCachedUrl(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { url, expiresAt } = JSON.parse(raw);
      if (Date.now() > expiresAt) { localStorage.removeItem(key); return null; }
      return url;
    } catch { return null; }
  }

  function writeCachedUrl(key, url) {
    try {
      localStorage.setItem(key, JSON.stringify({ url, expiresAt: Date.now() + CACHE_TTL_MS }));
    } catch { /* storage full or unavailable */ }
  }

  const handleShopOnInstacart = async () => {
    captureEvent(EVENTS.SPOONASSIST_RECOMMENDATION_ACCEPTED, {
      recommendation_type: 'instacart_shop',
      confidence_score: 1,
    });

    setLoading(prev => ({ ...prev, instacart: true }));
    setInstacartError(null);
    setInstacartUrl(null);

    const isRecipe = !!selectedRecipe;
    const ingList  = ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit }));

    // Check cache for recipe pages (shopping lists have no stable ID to key on)
    if (isRecipe && selectedRecipe.id != null) {
      const cacheKey = instacartCacheKey(selectedRecipe.id, ingList);
      const cached   = readCachedUrl(cacheKey);
      if (cached) {
        setInstacartUrl(cached);
        window.open(cached, '_blank', 'noopener,noreferrer');
        setLoading(prev => ({ ...prev, instacart: false }));
        return;
      }
    }

    const endpoint = isRecipe
      ? `${API_BASE_URL}/instacart_list/`
      : `${API_BASE_URL}/instacart_shopping_list/`;

    const payload = isRecipe
      ? {
          recipeTitle:    selectedRecipe.title,
          recipeId:       selectedRecipe.id ?? null,
          imageUrl:       selectedRecipe.image || null,
          instructions:   selectedRecipe.instructions || [],
          dietaryFilters: dietaryFilters,
          retailerKey:    selectedRetailerKey,
          ingredients:    ingList,
        }
      : {
          title:          'My Ingredient List',
          dietaryFilters: dietaryFilters,
          retailerKey:    selectedRetailerKey,
          ingredients:    ingList,
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create shopping list');

      setInstacartUrl(data.url);
      window.open(data.url, '_blank', 'noopener,noreferrer');

      // Persist for future clicks on the same recipe + ingredient set
      if (isRecipe && selectedRecipe.id != null) {
        writeCachedUrl(instacartCacheKey(selectedRecipe.id, ingList), data.url);
      }
    } catch (err) {
      setInstacartError('Could not create Instacart shopping list. Please try again.');
      console.error('Instacart list error:', err);
      captureEvent(EVENTS.SPOONASSIST_ERROR, {
        error_type: 'instacart_list_failed',
        query_type: 'instacart_shop',
      });
    } finally {
      setLoading(prev => ({ ...prev, instacart: false }));
    }
  };

  // Progressive disclosure: reveal later steps only once the prior step has
  // produced something to act on, instead of showing the whole flow at once.
  const hasIngredients = ingredients.length > 0;
  const hasStores = stores.length > 0;

  const revealAnimation = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50 via-yellow-100 to-green-500 py-20 md:py-28">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-6 drop-shadow-sm">
              SpoonAssist
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl leading-relaxed">
              Compare local grocery prices for any recipe and create smart shopping lists that save you money
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full max-w-3xl">
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold text-gray-800">Price Comparison</div>
                <div className="text-sm text-gray-600">Multiple stores</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
                <div className="text-3xl mb-2">🥗</div>
                <div className="font-semibold text-gray-800">Dietary Options</div>
                <div className="text-sm text-gray-600">Filter preferences</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-semibold text-gray-800">Smart Lists</div>
                <div className="text-sm text-gray-600">Export to CSV</div>
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
          {recipeError && (
            <InlineError message={recipeError} onDismiss={() => setRecipeError(null)} />
          )}
        </section>

        {/* Section 2: Ingredients Table */}
        {hasIngredients && (
          <motion.section {...revealAnimation} className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Review & Edit Ingredients</h2>
            <IngredientTable ingredients={ingredients} onChange={setIngredients} />
          </motion.section>
        )}

        {/* Section 3: Store Selection */}
        {hasIngredients && (
          <motion.section {...revealAnimation} className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Select Stores</h2>
            <StoreSelector
              onFindStores={handleFindStores}
              stores={stores}
              selectedStores={selectedStores}
              onStoreChange={setSelectedStores}
              loading={loading.stores}
            />
            {features.instacart && (
              <InstacartRetailerSelector
                retailers={instacartRetailers}
                selectedKey={selectedRetailerKey}
                onChange={setSelectedRetailerKey}
                loading={loading.instacartRetailers}
              />
            )}
            {storeError && (
              <InlineError message={storeError} onDismiss={() => setStoreError(null)} />
            )}
          </motion.section>
        )}

        {/* Section 4: Dietary Filters */}
        {hasIngredients && (
          <motion.section {...revealAnimation} className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 4: Dietary Preferences (Optional)</h2>
            <DietaryFilters
              selectedFilters={dietaryFilters}
              onChange={setDietaryFilters}
            />
          </motion.section>
        )}

        {/* Section 5: Calculate Button + Results */}
        {hasStores && (
          <>
            <motion.section {...revealAnimation} className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md border-2 border-green-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Step 5: Get Price Comparison</h2>
                  <p className="text-gray-700 mt-1">
                    {ingredients.length} ingredients • {selectedStores.length} stores selected
                  </p>
                </div>
                {/* CTAs side-by-side per Instacart placement guidelines */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCalculateCost}
                    disabled={loading.calculation || ingredients.length === 0 || selectedStores.length === 0}
                    className="px-8 py-3 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
                  >
                    {loading.calculation ? 'Calculating...' : 'Calculate Costs'}
                  </button>
                  {features.instacart && (
                    <InstacartCTA
                      onClick={handleShopOnInstacart}
                      loading={loading.instacart}
                      disabled={ingredients.length === 0}
                      text="Shop ingredients"
                    />
                  )}
                </div>
              </div>
              {costError && (
                <InlineError message={costError} onDismiss={() => setCostError(null)} />
              )}
              {instacartError && (
                <InlineError message={instacartError} onDismiss={() => setInstacartError(null)} />
              )}
            </motion.section>

            {/* Section 6: Results */}
            {costData && costData.length > 0 && (
              <motion.section {...revealAnimation} className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Results</h2>
                  <CSVExportButton costData={costData} ingredients={ingredients} />
                </div>

                {/* Summary banner */}
                {summary && summary.cheapestStore && (
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap gap-4 items-center">
                    <div>
                      <span className="text-sm text-gray-500 font-medium">Best overall price:</span>
                      <span className="ml-2 text-lg font-bold text-forest-dark">{summary.cheapestStore}</span>
                      <span className="ml-2 text-gray-700">${summary.cheapestTotal.toFixed(2)} total</span>
                    </div>
                    {Object.entries(summary.storeTotals || {})
                      .sort((a, b) => a[1] - b[1])
                      .slice(1)
                      .map(([store, total]) => (
                        <div key={store} className="text-sm text-gray-500">
                          {store}: <span className="font-medium text-gray-700">${total.toFixed(2)}</span>
                          {summary.cheapestTotal > 0 && (
                            <span className="ml-1 text-gray-400">
                              (+${(total - summary.cheapestTotal).toFixed(2)})
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                <CostResultsTable costData={costData} />

                {/* Shop on Instacart CTA — only rendered when key is configured */}
                {features.instacart && (
                  <div className="mt-6 p-5 bg-[#F5FAF7] border border-[#003D29]/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Ready to shop?</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Add this recipe&apos;s ingredients to your cart via the Instacart® service — delivery or pickup at local stores.
                      </p>
                    </div>
                    <InstacartCTA
                      onClick={handleShopOnInstacart}
                      loading={loading.instacart}
                      disabled={ingredients.length === 0}
                      text="Shop ingredients"
                    />
                  </div>
                )}
              </motion.section>
            )}
          </>
        )}

        {/* Data Partners */}
        <section className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-3 text-center">
            Data Partners
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <PoweredBy compact sources={[
              ...(features.kroger    ? ['kroger']    : []),
              ...(features.instacart ? ['instacart'] : []),
              'usda',
            ]} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>SpoonAssist is a service by Seed &amp; Spoon</p>
          <p className="mt-1">Helping you save money on healthy, delicious meals</p>
          {features.instacart && (
            <p className="mt-4 text-xs text-gray-400 max-w-2xl mx-auto">
              Instacart® is a registered trademark of Maplebear Inc. d/b/a Instacart.
              Instacart may not be available in all zip codes.{' '}
              <a
                href="https://www.instacart.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600"
              >
                See Instacart Terms of Service for more details.
              </a>
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}
