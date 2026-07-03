'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CostBadge from '@/components/spoonassist/CostBadge';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import ServingsStepper from '@/components/spoonassist/ServingsStepper';
import IngredientRow from '@/components/spoonassist/IngredientRow';
import EmptyState from '@/components/spoonassist/EmptyState';
import PillButton from '@/components/spoonassist/PillButton';
import RecipePlaceholder from '@/components/spoonassist/RecipePlaceholder';
import SaveHeartButton from '@/components/spoonassist/SaveHeartButton';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import { Skeleton, ListRowSkeleton } from '@/components/spoonassist/Skeleton';
import { toPlanIngredients } from '@/lib/spoonassist/consolidateList';
import { formatMinutes } from '@/lib/spoonassist/formatTime';
import { seedRecipes } from '@/data/spoonassistV2Seed';
import { getRecipeBySlug } from '@/data/recipes';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = ['breakfast', 'lunch', 'dinner'];

function PlateImage({ image }) {
  return (
    <div className="sa-plate mx-auto my-6 h-48 w-48">
      {image ? (
        <Image src={image} alt="" fill sizes="192px" className="object-cover" />
      ) : (
        <RecipePlaceholder />
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
  const plan = usePlan();
  const [status, setStatus] = useState('loading'); // loading | db | fallback | not-found
  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(4);
  const [checked, setChecked] = useState(() => new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDay, setPickerDay] = useState(() => new Date().getDay());
  const [pickerSlot, setPickerSlot] = useState('dinner');
  const [addedMessage, setAddedMessage] = useState(null);

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

  // Shape DB ingredient rows into what PlanProvider.addRecipe/leverage.ts
  // expect. Only meaningful for status === 'db' -- fallback (seed) recipes
  // have no real ingredient list to build a plan item from.
  const planIngredients = useMemo(() => {
    if (status !== 'db' || !recipe) return [];
    return toPlanIngredients(recipe.ingredients);
  }, [status, recipe]);

  const dynamicLeverage = useMemo(() => {
    if (status !== 'db' || !recipe || planIngredients.length === 0) return null;
    return plan.leverageForCandidate({ id: recipe.id, servings, ingredientKeys: planIngredients.map((i) => i.key) });
  }, [status, recipe, servings, planIngredients, plan]);

  // The legacy /recipes catalog (data/recipes.js) shares slugs with the 19
  // pre-existing DB rows that predate the instructions/notes columns --
  // fall back to its hardcoded steps when the DB value is null.
  const legacyRecipe = useMemo(() => getRecipeBySlug(slug), [slug]);
  const instructions = recipe?.instructions?.length ? recipe.instructions : legacyRecipe?.instructions ?? null;
  const notes = recipe?.notes ?? null;

  const addToPlan = (day, slot) => {
    plan.addRecipe(
      { recipeId: recipe.id, slug: recipe.slug, title: recipe.title, image, baseServings: recipe.servings, ingredients: planIngredients },
      { day, slot, servings }
    );
    setPickerOpen(false);
    setAddedMessage(`Added to ${DAY_LABELS[day]} · ${slot[0].toUpperCase()}${slot.slice(1)}`);
    setTimeout(() => setAddedMessage(null), 3000);
  };

  if (status === 'loading') {
    return (
      <div>
        <Skeleton className="mx-auto my-6 h-48 w-48 !rounded-full" />
        <Skeleton className="mx-auto h-6 w-2/3" />
        <div className="mt-4 flex justify-center gap-2">
          <Skeleton className="h-7 w-20 !rounded-[var(--sa-radius-pill)]" />
          <Skeleton className="h-7 w-16 !rounded-[var(--sa-radius-pill)]" />
        </div>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
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
      <div className="relative">
        <PlateImage image={image} />
        {status === 'db' && (
          <SaveHeartButton recipeId={recipe.id} className="absolute right-[calc(50%-96px)] top-6" />
        )}
      </div>

      <h1 className="text-center text-[22px] font-semibold text-[var(--sa-ink)]">{recipe.title}</h1>
      {recipe.description && (
        <p className="mx-auto mt-2 max-w-md text-center text-[15px] text-[var(--sa-ink-soft)]">{recipe.description}</p>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <CostBadge perServing={recipe.costPerServing} />
        {totalMinutes != null && <MetaPill>{formatMinutes(totalMinutes)}</MetaPill>}
        {dynamicLeverage != null ? (
          <LeverageBadge score={dynamicLeverage} />
        ) : recipe.leverage != null ? (
          <LeverageBadge score={recipe.leverage} />
        ) : null}
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

          {instructions?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[17px] font-semibold text-[var(--sa-ink)] mb-3">Instructions</h2>
              <ol className="space-y-3">
                {instructions.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-[15px] text-[var(--sa-ink-soft)]">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--sa-surface-alt)] text-[var(--sa-ink)] text-[13px] font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {notes && (
            <div className="mt-6">
              <h2 className="text-[17px] font-semibold text-[var(--sa-ink)] mb-3">Notes</h2>
              <p className="text-[15px] text-[var(--sa-ink-soft)]">{notes}</p>
            </div>
          )}

          {/* Sticky actions -- spec §4.3: "both sticky on scroll" */}
          <div className="sticky bottom-[76px] z-30 mt-8 flex gap-3 rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-3 shadow-[var(--sa-shadow-card)] lg:bottom-4">
            <PillButton variant="secondary" className="flex-1" onClick={() => addToPlan(new Date().getDay(), 'dinner')}>
              Add to list
            </PillButton>
            <PillButton variant="primary" className="flex-1" onClick={() => setPickerOpen(true)}>
              Add to plan
            </PillButton>
          </div>

          {addedMessage && (
            <p className="mt-3 text-center text-[13px] font-medium text-[var(--sa-savings)]">{addedMessage}</p>
          )}

          {pickerOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setPickerOpen(false)}
                className="absolute inset-0 bg-[var(--sa-green-deep)]/40"
              />
              <div className="relative w-full max-w-[420px] rounded-t-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-6 shadow-[var(--sa-shadow-card)] lg:rounded-[var(--sa-radius-card)] lg:mb-6">
                <h2 className="text-[17px] font-semibold text-[var(--sa-ink)]">Add to which day?</h2>
                <div className="mt-4 grid grid-cols-7 gap-1.5">
                  {DAY_LABELS.map((label, day) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setPickerDay(day)}
                      className={`rounded-[var(--sa-radius-pill)] py-2 text-[13px] font-semibold spoon-transition ${
                        pickerDay === day ? 'bg-[var(--sa-green-deep)] text-[var(--sa-on-dark)]' : 'bg-[var(--sa-surface-alt)] text-[var(--sa-ink)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setPickerSlot(slot)}
                      className={`flex-1 rounded-[var(--sa-radius-pill)] py-2 text-[13px] font-semibold capitalize spoon-transition ${
                        pickerSlot === slot ? 'bg-[var(--sa-green-deep)] text-[var(--sa-on-dark)]' : 'bg-[var(--sa-surface-alt)] text-[var(--sa-ink)]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <PillButton
                  variant="primary"
                  className="mt-5 w-full"
                  onClick={() => addToPlan(pickerDay, pickerSlot)}
                >
                  Add {DAY_LABELS[pickerDay]} &middot; {pickerSlot}
                </PillButton>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mx-auto mt-8 max-w-sm text-center text-[15px] text-[var(--sa-ink-soft)]">
          Full ingredients and servings scaling will appear once this recipe&rsquo;s data is synced.
        </p>
      )}
    </div>
  );
}
