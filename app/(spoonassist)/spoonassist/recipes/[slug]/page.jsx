'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CostBadge from '@/components/spoonassist/CostBadge';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import ServingsStepper from '@/components/spoonassist/ServingsStepper';
import IngredientRow from '@/components/spoonassist/IngredientRow';
import EmptyState from '@/components/spoonassist/EmptyState';
import { seedRecipes } from '@/data/spoonassistV2Seed';

function PlateImage({ image }) {
  return (
    <div className="sa-plate mx-auto my-6 h-48 w-48">
      {image ? (
        <Image src={image} alt="" fill sizes="192px" className="object-cover" />
      ) : (
        <div className="sa-plate-fallback">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 3v8a2 2 0 002 2h0M6 3v18M10 3v10M18 3v18M18 3a3 3 0 013 3v4a3 3 0 01-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function MetaPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-2.5 py-1 text-[13px] font-semibold text-[var(--sa-ink-soft)]">
      {children}
    </span>
  );
}

export default function SpoonAssistRecipeDetailPage() {
  const { slug } = useParams();
  const [status, setStatus] = useState('loading'); // loading | db | fallback | not-found
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/spoonassist/recipes/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not-found' : 'request-failed');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRecipe(data.recipe);
        setServings(data.recipe.servings || 4);
        setStatus('db');
      })
      .catch((err) => {
        if (cancelled) return;
        const seedMatch = seedRecipes.find((r) => r.slug === slug);
        if (err.message === 'not-found' && !seedMatch) {
          setStatus('not-found');
          return;
        }
        // API/DB not migrated yet, or the recipe only exists in Phase 1
        // seed data -- fall back so the page still demonstrates the flow.
        if (seedMatch) {
          setRecipe(seedMatch);
          setServings(4);
          setStatus('fallback');
        } else {
          setStatus('not-found');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const scale = status === 'db' && recipe?.servings ? servings / recipe.servings : 1;

  const toggleChecked = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (status === 'loading') {
    return <p className="text-[15px] text-[var(--sa-ink-soft)]">Loading recipe...</p>;
  }

  if (status === 'not-found') {
    return (
      <EmptyState
        title="Recipe not found"
        action={
          <Link href="/spoonassist/recipes" className="text-[15px] font-semibold text-[var(--sa-ink)] underline">
            Back to recipes
          </Link>
        }
      />
    );
  }

  const image = recipe.image_url ?? recipe.image ?? null;
  const totalMinutes = recipe.total_minutes ?? recipe.totalMinutes ?? null;

  return (
    <div>
      <Link href="/spoonassist/recipes" className="text-[13px] font-semibold text-[var(--sa-ink-soft)]">
        &larr; Back
      </Link>

      <PlateImage image={image} />

      <h1 className="text-center text-[22px] font-semibold text-[var(--sa-ink)]">{recipe.title}</h1>
      {recipe.description && (
        <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-[var(--sa-ink-soft)]">{recipe.description}</p>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <CostBadge perServing={recipe.costPerServing} />
        {totalMinutes != null && <MetaPill>{totalMinutes} min</MetaPill>}
        {recipe.leverage != null && <LeverageBadge score={recipe.leverage} />}
      </div>

      {status === 'db' ? (
        <>
          <div className="mt-6 flex justify-center">
            <ServingsStepper value={servings} onChange={setServings} min={1} max={24} />
          </div>

          <div className="mt-6">
            <h2 className="text-[17px] font-semibold text-[var(--sa-ink)] mb-3">Ingredients</h2>
            {recipe.ingredients?.length ? (
              <div className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <IngredientRow
                    key={ing.id}
                    ingredient={ing}
                    scale={scale}
                    checked={checked.has(ing.id)}
                    onToggle={() => toggleChecked(ing.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-[var(--sa-ink-soft)]">No ingredients listed.</p>
            )}
          </div>
        </>
      ) : (
        <p className="mx-auto mt-8 max-w-sm text-center text-[15px] text-[var(--sa-ink-soft)]">
          Full ingredients and servings scaling will appear once this recipe&rsquo;s data is synced.
        </p>
      )}
    </div>
  );
}
