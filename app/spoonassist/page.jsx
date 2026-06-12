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
import StoreFilterBar from '@/components/spoonassist/StoreFilterBar';
import DietaryFilters from '@/components/spoonassist/DietaryFilters';
import CostResultsTable from '@/components/spoonassist/CostResultsTable';
import CSVExportButton from '@/components/spoonassist/CSVExportButton';
import PoweredBy from '@/components/spoonassist/PoweredBy';
import InstacartCTA from '@/components/spoonassist/InstacartCTA';
import GlassCard from '@/components/spoonassist/ui/GlassCard';
import SpoonButton from '@/components/spoonassist/ui/Button';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function InlineError({ message, onDismiss }) {
  return (
    <div role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-center justify-between gap-3 spoon-transition">
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-red-800 font-medium shrink-0 spoon-transition"
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
  const [selectedRetailerKeys, setSelectedRetailerKeys] = useState([]);
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
    setSelectedRetailerKeys([]);
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
          imageUrl:       selectedRecipe.instacartImage || selectedRecipe.image || null,
          instructions:   selectedRecipe.instructions || [],
          dietaryFilters: dietaryFilters,
          retailerKey:    selectedRetailerKeys[0] ?? null,
          ingredients:    ingList,
        }
      : {
          title:          'My Ingredient List',
          dietaryFilters: dietaryFilters,
          retailerKey:    selectedRetailerKeys[0] ?? null,
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
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8 spoon-transition hover:scale-105">
              <Image
                src="/spoonassist/logo.png"
                alt="SpoonAssist Logo"
                width={200}
                height={200}
                className="rounded-spoon-card shadow-spoon-glass"
                priority
              />
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-spoon-ink mb-6">
              SpoonAssist
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-spoon-subtext mb-8 max-w-2xl leading-relaxed">
              Compare local grocery prices for any recipe and create smart shopping lists that save you money
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-3xl">
              <div className="spoon-glass rounded-spoon-card p-4">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold text-spoon-ink">Price Comparison</div>
                <div className="text-sm text-spoon-subtext">Multiple stores</div>
              </div>
              <div className="spoon-glass rounded-spoon-card p-4">
                <div className="text-3xl mb-2">🥗</div>
                <div className="font-semibold text-spoon-ink">Dietary Options</div>
                <div className="text-sm text-spoon-subtext">Filter preferences</div>
              </div>
              <div className="spoon-glass rounded-spoon-card p-4">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-semibold text-spoon-ink">Smart Lists</div>
                <div className="text-sm text-spoon-subtext">Export to CSV</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Section 1: Recipe Selection */}
        <GlassCard as="section" className="mb-8">
          <h2 className="text-2xl font-bold text-spoon-ink mb-4">Step 1: Choose or Enter Recipe</h2>
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
        </GlassCard>

        {/* Section 2: Ingredients Table */}
        {hasIngredients && (
          <GlassCard as={motion.section} {...revealAnimation} className="mb-8">
            <h2 className="text-2xl font-bold text-spoon-ink mb-4">Step 2: Review & Edit Ingredients</h2>
            <IngredientTable ingredients={ingredients} onChange={setIngredients} />
          </GlassCard>
        )}

        {/* Section 3: Store Selection */}
        {hasIngredients && (
          <GlassCard as={motion.section} {...revealAnimation} className="mb-8">
            <h2 className="text-2xl font-bold text-spoon-ink mb-4">Step 3: Select Stores</h2>
            <StoreSelector
              onFindStores={handleFindStores}
              stores={stores}
              selectedStores={selectedStores}
              onStoreChange={setSelectedStores}
              loading={loading.stores}
            />
            {features.instacart && (
              <StoreFilterBar
                retailers={instacartRetailers}
                selectedKeys={selectedRetailerKeys}
                onChange={setSelectedRetailerKeys}
                loading={loading.instacartRetailers}
              />
            )}
            {storeError && (
              <InlineError message={storeError} onDismiss={() => setStoreError(null)} />
            )}
          </GlassCard>
        )}

        {/* Section 4: Dietary Filters */}
        {hasIngredients && (
          <GlassCard as={motion.section} {...revealAnimation} className="mb-8">
            <h2 className="text-2xl font-bold text-spoon-ink mb-4">Step 4: Dietary Preferences (Optional)</h2>
            <DietaryFilters
              selectedFilters={dietaryFilters}
              onChange={setDietaryFilters}
            />
          </GlassCard>
        )}

        {/* Section 5: Calculate Button + Results */}
        {hasStores && (
          <>
            <GlassCard as={motion.section} {...revealAnimation} className="mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-spoon-ink">Step 5: Get Price Comparison</h2>
                  <p className="text-spoon-subtext mt-1">
                    {ingredients.length} ingredients • {selectedStores.length} stores selected
                  </p>
                </div>
                {/* CTAs side-by-side per Instacart placement guidelines */}
                <div className="flex flex-wrap items-center gap-3">
                  <SpoonButton
                    variant="primary"
                    size="lg"
                    onClick={handleCalculateCost}
                    disabled={loading.calculation || ingredients.length === 0 || selectedStores.length === 0}
                  >
                    {loading.calculation ? 'Calculating...' : 'Calculate Costs'}
                  </SpoonButton>
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
            </GlassCard>

            {/* Section 6: Results */}
            {costData && costData.length > 0 && (
              <GlassCard as={motion.section} {...revealAnimation} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-spoon-ink">Results</h2>
                  <CSVExportButton costData={costData} ingredients={ingredients} />
                </div>

                {/* Summary banner */}
                {summary && summary.cheapestStore && (
                  <div className="mb-4 p-4 spoon-glass-lite rounded-spoon-card flex flex-wrap gap-4 items-center">
                    <div>
                      <span className="text-sm text-spoon-subtext font-medium">Best overall price:</span>
                      <span className="ml-2 text-lg font-bold text-spoon-mint">{summary.cheapestStore}</span>
                      <span className="ml-2 text-spoon-ink">${summary.cheapestTotal.toFixed(2)} total</span>
                    </div>
                    {Object.entries(summary.storeTotals || {})
                      .sort((a, b) => a[1] - b[1])
                      .slice(1)
                      .map(([store, total]) => (
                        <div key={store} className="text-sm text-spoon-subtext">
                          {store}: <span className="font-medium text-spoon-ink">${total.toFixed(2)}</span>
                          {summary.cheapestTotal > 0 && (
                            <span className="ml-1 text-spoon-subtext/70">
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
                  <div className="mt-6 p-5 spoon-glass-lite rounded-spoon-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-spoon-ink">Ready to shop?</p>
                      <p className="text-sm text-spoon-subtext mt-0.5">
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
              </GlassCard>
            )}
          </>
        )}

        {/* Data Partners */}
        <section className="mt-10 pt-8 border-t border-white/60">
          <p className="text-xs text-spoon-subtext uppercase tracking-wide font-semibold mb-3 text-center">
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
        <footer className="mt-8 text-center text-sm text-spoon-subtext">
          <p>SpoonAssist is a service by Seed &amp; Spoon</p>
          <p className="mt-1">Helping you save money on healthy, delicious meals</p>
          {features.instacart && (
            <p className="mt-4 text-xs text-spoon-subtext max-w-2xl mx-auto">
              Instacart® is a registered trademark of Maplebear Inc. d/b/a Instacart.
              Instacart may not be available in all zip codes.{' '}
              <a
                href="https://www.instacart.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-spoon-ink"
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
