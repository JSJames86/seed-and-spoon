'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlan } from '@/components/spoonassist/PlanProvider';
import PlanDayColumn from '@/components/spoonassist/PlanDayColumn';
import PillButton from '@/components/spoonassist/PillButton';
import LeverageBadge from '@/components/spoonassist/LeverageBadge';
import EmptyState from '@/components/spoonassist/EmptyState';
import ServingsStepper from '@/components/spoonassist/ServingsStepper';
import { ListRowSkeleton } from '@/components/spoonassist/Skeleton';
import { rankByLeverage } from '@/lib/spoonassist/leverage';
import { toPlanIngredients } from '@/lib/spoonassist/consolidateList';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = ['breakfast', 'lunch', 'dinner'];
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

function AddMealPicker({ picker, ranked, onPick, onConfirm, onServingsChange, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[var(--sa-green-deep)]/40" />
      <div className="relative flex max-h-[80vh] w-full max-w-[420px] flex-col rounded-t-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-6 shadow-[var(--sa-shadow-card)] lg:rounded-[var(--sa-radius-card)] lg:mb-6">
        <h2 className="text-[17px] font-semibold text-[var(--sa-ink)]">
          {DAY_LABELS[picker.day]} &middot; {picker.slot}
        </h2>

        {picker.step === 'recipe' && (
          <div className="mt-4 space-y-2 overflow-y-auto">
            {ranked.length === 0 && (
              <p className="text-[15px] text-[var(--sa-ink-soft)]">No recipes available yet.</p>
            )}
            {ranked.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onPick(r)}
                className="flex w-full items-center justify-between rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] px-4 py-3 text-left spoon-transition hover:opacity-90"
              >
                <span className="text-[15px] font-medium text-[var(--sa-ink)]">{r.title}</span>
                <LeverageBadge score={r.leverage} />
              </button>
            ))}
          </div>
        )}

        {picker.step === 'loading' && (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListRowSkeleton key={i} />
            ))}
          </div>
        )}

        {picker.step === 'confirm' && picker.detail && (
          <div className="mt-4">
            <p className="text-[15px] font-medium text-[var(--sa-ink)]">{picker.detail.title}</p>
            <div className="mt-3 flex justify-center">
              <ServingsStepper value={picker.servings} onChange={onServingsChange} min={1} max={24} />
            </div>
            <PillButton variant="primary" className="mt-5 w-full" onClick={onConfirm}>
              Add to {DAY_LABELS[picker.day]} &middot; {picker.slot}
            </PillButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpoonAssistPlanPage() {
  const plan = usePlan();
  const [catalog, setCatalog] = useState([]);
  const [picker, setPicker] = useState(null); // { day, slot, step, detail?, servings? }

  useEffect(() => {
    fetch('/api/spoonassist/recipes?limit=100')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCatalog(data.recipes || []))
      .catch(() => setCatalog([]));
  }, []);

  const ranked = useMemo(() => {
    const planAsLeverageRecipes = plan.items.map((i) => ({
      id: i.id,
      servings: i.servings,
      ingredientKeys: (i.ingredients || []).map((ing) => ing.key),
    }));
    return rankByLeverage(
      catalog.map((r) => ({ id: r.id, slug: r.slug, title: r.title, servings: r.servings, ingredientKeys: r.ingredientKeys || [] })),
      planAsLeverageRecipes
    );
  }, [catalog, plan.items]);

  const openPicker = (day, slot) => setPicker({ day, slot, step: 'recipe' });
  const closePicker = () => setPicker(null);

  const pickRecipe = async (candidate) => {
    setPicker((p) => ({ ...p, step: 'loading' }));
    try {
      const res = await fetch(`/api/spoonassist/recipes/${candidate.slug}`);
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setPicker((p) => ({ ...p, step: 'confirm', detail: data.recipe, servings: data.recipe.servings || 4 }));
    } catch {
      setPicker((p) => ({ ...p, step: 'recipe' }));
    }
  };

  const confirmAdd = () => {
    const { day, slot, detail, servings } = picker;

    // Gentle guardrail, not a hard cap -- catches mis-taps when a slot
    // already has a handful of recipes stacked in it.
    const existingInSlot = plan.items.filter((i) => i.day === day && i.slot === slot).length;
    if (existingInSlot >= 5) {
      const proceed = window.confirm(
        `${SLOT_LABELS[slot] || slot} on ${DAY_LABELS[day]} already has ${existingInSlot} recipes. Add ${detail.title} anyway?`
      );
      if (!proceed) return;
    }

    plan.addRecipe(
      {
        recipeId: detail.id,
        slug: detail.slug,
        title: detail.title,
        image: detail.image_url,
        baseServings: detail.servings,
        ingredients: toPlanIngredients(detail.ingredients),
      },
      { day, slot, servings }
    );
    closePicker();
  };

  const today = new Date().getDay();
  const itemsByDay = (day) => plan.items.filter((i) => i.day === day);
  const sharedIngredientCount = plan.consolidatedItems.filter((i) => i.sourceRecipeIds.length > 1).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--sa-ink)]">This week</h1>
          <p className="text-[15px] text-[var(--sa-ink-soft)]">
            {plan.mealsPlanned} meal{plan.mealsPlanned === 1 ? '' : 's'} planned
            {plan.recipesPlanned > plan.mealsPlanned && ` · ${plan.recipesPlanned} recipes`}
          </p>
        </div>
        {plan.items.length > 0 && <LeverageBadge score={plan.overallLeverage} />}
      </div>

      {plan.items.length > 0 && (
        <div className="mt-4 rounded-[var(--sa-radius-card)] bg-[var(--sa-green-deep)] p-5 text-[var(--sa-on-dark)]">
          <p className="text-[15px] leading-relaxed">
            Your <strong>{plan.items.length}</strong> recipe{plan.items.length === 1 ? '' : 's'} share{' '}
            <strong>{sharedIngredientCount}</strong> ingredient{sharedIngredientCount === 1 ? '' : 's'} &mdash; you&rsquo;re
            getting <strong>{plan.totalServings}</strong> meals from <strong>{plan.consolidatedItems.length}</strong> items.
          </p>
        </div>
      )}

      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-visible lg:px-0">
        {DAY_LABELS.map((label, day) => (
          <PlanDayColumn
            key={label}
            dayLabel={label}
            isToday={day === today}
            slots={SLOTS}
            items={itemsByDay(day)}
            onAdd={(slot) => openPicker(day, slot)}
            onRemove={plan.removeItem}
            className="w-40 shrink-0 lg:w-auto"
          />
        ))}
      </div>

      {plan.items.length === 0 && (
        <EmptyState
          variant="plate"
          className="mt-4"
          title="No meals planned yet"
          description="Tap + Add on any day to start building this week's plan."
          action={
            <PillButton as={Link} href="/spoonassist/recipes">
              Browse recipes
            </PillButton>
          }
        />
      )}

      {plan.items.length > 0 && (
        <div className="mt-6 flex justify-center">
          <PillButton
            as={Link}
            href="/spoonassist/list"
            size="lg"
            onClick={() =>
              captureEvent(EVENTS.SPOONASSIST_V2_LIST_BUILT, {
                item_count: plan.consolidatedItems.length,
                recipe_count: plan.items.length,
              })
            }
          >
            Build my list &rarr;
          </PillButton>
        </div>
      )}

      {picker && (
        <AddMealPicker
          picker={picker}
          ranked={ranked}
          onPick={pickRecipe}
          onConfirm={confirmAdd}
          onServingsChange={(servings) => setPicker((p) => ({ ...p, servings }))}
          onClose={closePicker}
        />
      )}
    </div>
  );
}
