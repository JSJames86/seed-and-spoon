'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlassCard from '@/components/spoonassist/ui/GlassCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function PricingSpineRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/spoonassist/pricing-spine/recipes`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load recipes');
        return res.json();
      })
      .then(data => setRecipes(data.recipes || []))
      .catch(err => {
        console.error('Recipe list fetch error:', err);
        setError('Could not load recipes. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-bold text-spoon-ink mb-2">Recipe Price Index</h1>
        <p className="text-spoon-subtext mb-8 max-w-2xl">
          Real per-store totals built from community-submitted prices. If a store
          is missing data for an ingredient, we say so instead of guessing —
          incomplete baskets never show a total.
        </p>

        {loading && <p className="text-spoon-subtext">Loading recipes…</p>}
        {error && (
          <p role="alert" className="text-red-700">{error}</p>
        )}
        {!loading && !error && recipes.length === 0 && (
          <p className="text-spoon-subtext">No recipes yet.</p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {recipes.map(recipe => (
            <Link key={recipe.id} href={`/spoonassist/recipes/${recipe.id}`} className="block">
              <GlassCard className="h-full cursor-pointer hover:bg-white/80">
                <h2 className="text-xl font-bold text-spoon-ink">{recipe.title}</h2>
                <p className="text-sm text-spoon-subtext mt-1">
                  {recipe.servings} serving{recipe.servings === 1 ? '' : 's'} ·{' '}
                  {recipe.ingredientCount} ingredient{recipe.ingredientCount === 1 ? '' : 's'}
                </p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
