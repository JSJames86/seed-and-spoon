'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PillButton from '@/components/spoonassist/PillButton';
import ChipToggle from '@/components/spoonassist/ChipToggle';
import RecipeCard from '@/components/spoonassist/RecipeCard';
import CoverageBar from '@/components/spoonassist/CoverageBar';
import SectionHeader from '@/components/spoonassist/SectionHeader';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import {
  savingsCarousel,
  highLeverageCarousel,
  newarkFavoritesCarousel,
  seedCoverageSnapshot,
  seedHousehold,
  dietaryOptions,
} from '@/data/spoonassistV2Seed';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RecipeCarousel({ recipes }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.slug} recipe={recipe} className="w-40 shrink-0 lg:w-auto" />
      ))}
    </div>
  );
}

export default function SpoonAssistHomePage() {
  const router = useRouter();
  const plan = usePlan();
  const hasRealPlan = plan.hydrated && plan.items.length > 0;
  const [search, setSearch] = useState('');
  const [householdSize, setHouseholdSize] = useState(seedHousehold.size);
  const [budgetCents, setBudgetCents] = useState(seedHousehold.weeklyBudgetCents);
  const [dietary, setDietary] = useState(seedHousehold.dietaryTags);

  const toggleDietary = (tag) => {
    setDietary((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const params = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : '';
    router.push(`/spoonassist/recipes${params}`);
  };

  return (
    <div className="space-y-10">
      {/* Greeting + search */}
      <section>
        <h1 className="text-[28px] font-semibold text-[var(--sa-ink)]">
          Let&rsquo;s stretch your groceries, neighbor
        </h1>
        <form
          onSubmit={submitSearch}
          className="mt-4 flex items-center gap-2 rounded-[var(--sa-radius-pill)] bg-[var(--sa-surface)] px-4 py-3 shadow-[var(--sa-shadow-card)]"
        >
          <button type="submit" aria-label="Search" className="shrink-0 text-[var(--sa-ink-soft)]">
            <SearchIcon />
          </button>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes, ingredients..."
            className="flex-1 bg-transparent text-[15px] text-[var(--sa-ink)] placeholder:text-[var(--sa-ink-soft)] outline-none"
          />
          <button
            type="button"
            aria-label="Filters"
            onClick={() => router.push('/spoonassist/recipes')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sa-surface-alt)] text-[var(--sa-ink-soft)]"
          >
            <FilterIcon />
          </button>
        </form>
      </section>

      {/* Coverage snapshot -- real session plan once one exists, otherwise
          a labeled example so first-run visitors see what this card means. */}
      <section className="rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
        <Link href="/spoonassist/plan" className="block">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-[var(--sa-ink-soft)]">
            {hasRealPlan ? 'Your week' : 'Your week (example)'}
          </p>
          {hasRealPlan ? (
            <>
              <p className="mt-1 text-[17px] font-semibold text-[var(--sa-ink)]">
                {plan.mealsPlanned} meal{plan.mealsPlanned === 1 ? '' : 's'} planned &middot;{' '}
                {plan.consolidatedItems.length} item{plan.consolidatedItems.length === 1 ? '' : 's'}
                {plan.mealsPlanned >= 2 && <> &middot; Leverage {plan.overallLeverage.toFixed(1)}</>}
              </p>
              {plan.mealsPlanned < 2 && (
                <p className="mt-0.5 text-[13px] text-[var(--sa-ink-soft)]">Add another meal to unlock leverage</p>
              )}
              <CoverageBar className="mt-3" value={plan.mealsPlanned} max={Math.max(plan.mealsPlanned, 7)} />
            </>
          ) : (
            <>
              <p className="mt-1 text-[17px] font-semibold text-[var(--sa-ink)]">
                {seedCoverageSnapshot.mealsPlanned} of {seedCoverageSnapshot.mealsTotal} meals planned &middot; est. $
                {(seedCoverageSnapshot.estCostCents / 100).toFixed(2)} &middot; Leverage {seedCoverageSnapshot.leverage.toFixed(1)}
              </p>
              <CoverageBar
                className="mt-3"
                value={seedCoverageSnapshot.mealsPlanned}
                max={seedCoverageSnapshot.mealsTotal}
              />
            </>
          )}
        </Link>
      </section>

      {/* Household quick-setup */}
      <section id="household" className="scroll-mt-6 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-5 shadow-[var(--sa-shadow-card)]">
        <h2 className="text-[17px] font-semibold text-[var(--sa-ink)]">Household</h2>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[15px] text-[var(--sa-ink-soft)]">Household size</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Decrease household size"
              onClick={() => setHouseholdSize((n) => Math.max(1, n - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sa-surface-alt)] text-[var(--sa-ink)] font-semibold"
            >
              &minus;
            </button>
            <span className="w-4 text-center text-[15px] font-semibold text-[var(--sa-ink)]">{householdSize}</span>
            <button
              type="button"
              aria-label="Increase household size"
              onClick={() => setHouseholdSize((n) => Math.min(12, n + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sa-surface-alt)] text-[var(--sa-ink)] font-semibold"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] text-[var(--sa-ink-soft)]">Weekly budget</span>
            <span className="text-[15px] font-semibold text-[var(--sa-ink)]">${(budgetCents / 100).toFixed(0)}</span>
          </div>
          <input
            type="range"
            min={3000}
            max={20000}
            step={500}
            value={budgetCents}
            onChange={(e) => setBudgetCents(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--sa-green-deep)]"
          />
        </div>

        <div className="mt-5">
          <span className="text-[15px] text-[var(--sa-ink-soft)]">Dietary needs</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {dietaryOptions.map((tag) => (
              <ChipToggle
                key={tag}
                label={tag}
                active={dietary.includes(tag)}
                onClick={() => toggleDietary(tag)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Carousels */}
      <section>
        <SectionHeader title="Biggest savings near you this week" seeAllHref="/spoonassist/recipes" />
        <RecipeCarousel recipes={savingsCarousel} />
      </section>

      <section>
        <SectionHeader title="High-leverage picks" seeAllHref="/spoonassist/recipes" />
        <RecipeCarousel recipes={highLeverageCarousel} />
      </section>

      <section>
        <SectionHeader title="Newark favorites" seeAllHref="/spoonassist/recipes" />
        <RecipeCarousel recipes={newarkFavoritesCarousel} />
      </section>

      {/* Banner CTA */}
      <section className="flex flex-col items-center gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-green-deep)] px-6 py-8 text-center">
        <p className="text-[17px] font-semibold text-[var(--sa-on-dark)]">
          Ready to plan? Turn a few recipes into one smart list.
        </p>
        <PillButton as={Link} href="/spoonassist/plan" size="lg">
          Build this week&rsquo;s plan &rarr;
        </PillButton>
      </section>
    </div>
  );
}
