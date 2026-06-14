'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import GlassCard from '@/components/spoonassist/ui/GlassCard';
import StoreCostCard from '@/components/spoonassist/pricing/StoreCostCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function RecipePricingDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/spoonassist/pricing-spine/recipes/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load recipe');
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error('Recipe detail fetch error:', err);
        setError('Could not load this recipe.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <p className="text-spoon-subtext">Loading recipe…</p>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <p role="alert" className="text-red-700">{error || 'Recipe not found.'}</p>
          <Link href="/spoonassist/recipes" className="text-spoon-mint hover:underline mt-4 inline-block">
            ← All recipes
          </Link>
        </main>
      </div>
    );
  }

  const { recipe, ingredients, storeCosts } = data;

  // Only complete baskets are eligible to "win" — an incomplete store can
  // never look cheaper just because it's missing data.
  const completeCosts = storeCosts.filter(sc => sc.cost?.is_basket_complete);
  const cheapest = completeCosts.length
    ? completeCosts.reduce((min, sc) =>
        Number(sc.cost.total_estimated_cost) < Number(min.cost.total_estimated_cost) ? sc : min
      )
    : null;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/spoonassist/recipes" className="text-sm text-spoon-mint hover:underline">
          ← All recipes
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-spoon-ink mt-2 mb-2">{recipe.title}</h1>
        <p className="text-spoon-subtext mb-8">{recipe.servings} serving{recipe.servings === 1 ? '' : 's'}</p>

        <GlassCard className="mb-8">
          <h2 className="text-lg font-bold text-spoon-ink mb-3">Ingredients</h2>
          <ul className="divide-y divide-white/60">
            {ingredients.map(ing => (
              <li key={ing.id} className="py-2 text-sm flex items-center justify-between gap-3">
                <span className="text-spoon-ink">{ing.rawText || ing.name}</span>
                <span className="text-spoon-subtext shrink-0">{ing.quantity} {ing.unit}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <h2 className="text-lg font-bold text-spoon-ink mb-3">Price by store</h2>
        {!cheapest && (
          <p className="text-sm text-spoon-subtext mb-3">
            No store has every ingredient priced yet, so we can&apos;t name a cheapest
            option. Expand a store below to see what&apos;s missing.
          </p>
        )}
        <div className="flex flex-col gap-3">
          {storeCosts.map(sc => (
            <StoreCostCard
              key={sc.store.id}
              recipeId={recipe.id}
              store={sc.store}
              cost={sc.cost}
              isCheapest={cheapest?.store.id === sc.store.id}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
