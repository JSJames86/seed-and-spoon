'use client';

import { useEffect, useMemo, useState } from 'react';
import RecipeCard from '@/components/spoonassist/RecipeCard';
import SectionHeader from '@/components/spoonassist/SectionHeader';
import FilterSheet, { MAX_MINUTES_CEILING } from '@/components/spoonassist/FilterSheet';
import PillButton from '@/components/spoonassist/PillButton';
import EmptyState from '@/components/spoonassist/EmptyState';
import { seedRecipes } from '@/data/spoonassistV2Seed';

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'quickest', label: 'Quickest' },
];

export default function SpoonAssistRecipesPage() {
  const [recipes, setRecipes] = useState(null); // null = loading
  const [usingFallback, setUsingFallback] = useState(false);
  const [sort, setSort] = useState('newest');

  // The full, unfiltered catalog -- fetched once, used only to build the
  // category/dietary chip universes so they don't shrink to whatever's
  // currently filtered (see the filtered `recipes` fetch below).
  const [catalog, setCatalog] = useState([]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [dietary, setDietary] = useState([]);
  const [maxMinutes, setMaxMinutes] = useState(MAX_MINUTES_CEILING);

  // Pending values edited inside the sheet, only committed on Apply.
  const [pendingCategory, setPendingCategory] = useState(null);
  const [pendingDietary, setPendingDietary] = useState([]);
  const [pendingMaxMinutes, setPendingMaxMinutes] = useState(MAX_MINUTES_CEILING);

  useEffect(() => {
    fetch('/api/spoonassist/recipes?limit=100')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCatalog(data.recipes || []))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ sort });
    if (category) params.set('category', category);
    if (dietary.length) params.set('dietary', dietary.join(','));
    if (maxMinutes < MAX_MINUTES_CEILING) params.set('maxMinutes', String(maxMinutes));

    let cancelled = false;
    setRecipes(null);

    fetch(`/api/spoonassist/recipes?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('request failed');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setRecipes(data.recipes || []);
        setUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Catalog not migrated/imported yet -- keep the grid usable with
        // Phase 1's static seed set instead of a dead page.
        setRecipes(seedRecipes);
        setUsingFallback(true);
      });

    return () => {
      cancelled = true;
    };
  }, [sort, category, dietary, maxMinutes]);

  const categories = useMemo(
    () => [...new Set(catalog.map((r) => r.category).filter(Boolean))].sort(),
    [catalog]
  );

  const dietaryTags = useMemo(
    () => [...new Set(catalog.flatMap((r) => r.dietary_tags || []))].sort(),
    [catalog]
  );

  const openFilters = () => {
    setPendingCategory(category);
    setPendingDietary(dietary);
    setPendingMaxMinutes(maxMinutes);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setCategory(pendingCategory);
    setDietary(pendingDietary);
    setMaxMinutes(pendingMaxMinutes);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setPendingCategory(null);
    setPendingDietary([]);
    setPendingMaxMinutes(MAX_MINUTES_CEILING);
  };

  const activeFilterCount = (category ? 1 : 0) + dietary.length + (maxMinutes < MAX_MINUTES_CEILING ? 1 : 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionHeader title="All recipes" className="mb-0" />
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-[var(--sa-radius-pill)] border border-[var(--sa-surface-alt)] bg-[var(--sa-surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--sa-ink)]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <PillButton variant="secondary" size="sm" onClick={openFilters}>
            <FilterIcon /> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </PillButton>
        </div>
      </div>

      {usingFallback && (
        <p className="mb-4 text-[13px] text-[var(--sa-ink-soft)]">
          Showing sample recipes -- the full catalog will appear once it&rsquo;s synced.
        </p>
      )}

      {recipes === null ? (
        <p className="text-[15px] text-[var(--sa-ink-soft)]">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <EmptyState title="No recipes match" description="Try clearing a filter." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              recipe={{
                slug: recipe.slug,
                title: recipe.title,
                image: recipe.image_url ?? recipe.image ?? null,
                totalMinutes: recipe.total_minutes ?? recipe.totalMinutes ?? null,
                costPerServing: recipe.costPerServing ?? null,
                leverage: recipe.leverage ?? null,
              }}
            />
          ))}
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        selectedCategory={pendingCategory}
        onCategoryChange={setPendingCategory}
        dietaryOptions={dietaryTags}
        selectedDietary={pendingDietary}
        onDietaryChange={setPendingDietary}
        maxMinutes={pendingMaxMinutes}
        onMaxMinutesChange={setPendingMaxMinutes}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </div>
  );
}
