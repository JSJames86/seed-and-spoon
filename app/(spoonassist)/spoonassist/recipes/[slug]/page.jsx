import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CostBadge from '@/components/spoonassist/CostBadge';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import { seedRecipes } from '@/data/spoonassistV2Seed';

export function generateStaticParams() {
  return seedRecipes.map((recipe) => ({ slug: recipe.slug }));
}

export default async function SpoonAssistRecipeDetailPage({ params }) {
  const { slug } = await params;
  const recipe = seedRecipes.find((r) => r.slug === slug);
  if (!recipe) notFound();

  return (
    <div>
      <Link href="/spoonassist/recipes" className="text-[13px] font-semibold text-[var(--sa-ink-soft)]">
        &larr; Back
      </Link>

      <div className="sa-plate mx-auto my-6 h-48 w-48">
        {recipe.image ? (
          <Image src={recipe.image} alt="" fill sizes="192px" className="object-cover" />
        ) : (
          <div className="sa-plate-fallback">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 3v8a2 2 0 002 2h0M6 3v18M10 3v10M18 3v18M18 3a3 3 0 013 3v4a3 3 0 01-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      <h1 className="text-center text-[22px] font-semibold text-[var(--sa-ink)]">{recipe.title}</h1>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <CostBadge perServing={recipe.costPerServing} />
        <span className="inline-flex items-center rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface-alt)] px-2.5 py-1 text-[13px] font-semibold text-[var(--sa-ink-soft)]">
          {recipe.totalMinutes} min
        </span>
        <LeverageBadge score={recipe.leverage} />
      </div>

      <p className="mx-auto mt-8 max-w-sm text-center text-[15px] text-[var(--sa-ink-soft)]">
        Ingredients, servings scaling, and price lookups per store land in Phase 2.
      </p>
    </div>
  );
}
