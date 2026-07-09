'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { consolidateIngredients, groupByCategory, deriveIngredientKey, itemRowKey } from '@/lib/spoonassist/consolidateList';
import { recipeLeverage, planLeverage, planIngredientUnion } from '@/lib/spoonassist/leverage';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';

const MANUAL_RECIPE_ID = 'manual';

// ---------------------------------------------------------------------------
// Session-local weekly plan (spec §2: unauthenticated visitors build a plan
// "stored in memory/URL state"; saving to the household's account is a
// separate, explicit step -- see app/api/spoonassist/plan/route.js). This
// context persists to localStorage rather than memory-only so a reload
// doesn't discard someone's half-built week; it never talks to Supabase on
// its own.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'spoonassist_plan_v1';
const PlanContext = createContext(null);

const EMPTY_STATE = { items: [], checkedKeys: [], excludedKeys: [], manualItems: [] };

function loadFromStorage() {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      checkedKeys: Array.isArray(parsed.checkedKeys) ? parsed.checkedKeys : [],
      excludedKeys: Array.isArray(parsed.excludedKeys) ? parsed.excludedKeys : [],
      manualItems: Array.isArray(parsed.manualItems) ? parsed.manualItems : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

function scaleIngredients(ingredients, ratio) {
  return (ingredients || []).map((ing) => ({
    ...ing,
    quantity: ing.quantity != null ? Math.round(ing.quantity * ratio * 100) / 100 : null,
  }));
}

export function PlanProvider({ children }) {
  const [items, setItems] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [excludedKeys, setExcludedKeys] = useState([]);
  const [manualItems, setManualItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount (client only -- localStorage doesn't exist during SSR).
  useEffect(() => {
    const stored = loadFromStorage();
    setItems(stored.items);
    setCheckedKeys(stored.checkedKeys);
    setExcludedKeys(stored.excludedKeys);
    setManualItems(stored.manualItems);
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated (avoids clobbering storage with
  // the initial empty state before the load effect above has run).
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, checkedKeys, excludedKeys, manualItems }));
    } catch {
      // storage full/unavailable -- the plan still works for this tab.
    }
  }, [items, checkedKeys, excludedKeys, manualItems, hydrated]);

  const addRecipe = useCallback((recipe, { day, slot, servings }) => {
    const baseServings = recipe.baseServings || recipe.servings || 4;
    const targetServings = servings || baseServings;
    const ratio = targetServings / baseServings;

    const item = {
      id: `${recipe.recipeId}-${day}-${slot}-${Date.now()}`,
      recipeId: recipe.recipeId,
      slug: recipe.slug,
      title: recipe.title,
      image: recipe.image || null,
      day,
      slot,
      baseServings,
      servings: targetServings,
      // Immutable at-base-servings amounts; `ingredients` below is always
      // re-derived from this, so repeated servings edits never compound
      // rounding error against a previously-scaled value.
      baseIngredients: recipe.ingredients || [],
      ingredients: scaleIngredients(recipe.ingredients, ratio),
    };

    // Slots hold multiple recipes (a real meal is often a composition --
    // omelette + bacon + fruit, salad + dressing) -- picking a recipe always
    // appends a new item rather than replacing whatever's already in the
    // day+slot. PlanDayColumn renders every item for a slot, each with its
    // own remove affordance.
    setItems((prev) => {
      const next = [...prev, item];
      if (prev.length === 0) captureEvent(EVENTS.SPOONASSIST_V2_PLAN_CREATED, { recipe_count: next.length });
      return next;
    });
    return item.id;
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateItemServings = useCallback((itemId, servings) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const ratio = servings / item.baseServings;
        return { ...item, servings, ingredients: scaleIngredients(item.baseIngredients, ratio) };
      })
    );
  }, []);

  const toggleChecked = useCallback((rowKey) => {
    setCheckedKeys((prev) => (prev.includes(rowKey) ? prev.filter((k) => k !== rowKey) : [...prev, rowKey]));
  }, []);

  const removeConsolidatedItem = useCallback((rowKey) => {
    setExcludedKeys((prev) => (prev.includes(rowKey) ? prev : [...prev, rowKey]));
  }, []);

  const addManualItem = useCallback((name, quantity, unit) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setManualItems((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, key: deriveIngredientKey(null, trimmed), name: trimmed, quantity: quantity ?? null, unit: unit ?? null },
    ]);
  }, []);

  const removeManualItem = useCallback((manualId) => {
    setManualItems((prev) => prev.filter((m) => m.id !== manualId));
  }, []);

  const clearPlan = useCallback(() => {
    setItems([]);
    setCheckedKeys([]);
    setExcludedKeys([]);
    setManualItems([]);
  }, []);

  const consolidated = useMemo(() => {
    const recipeEntries = items.map((i) => ({ recipeId: i.recipeId, ingredients: i.ingredients }));
    const manualEntry = manualItems.length > 0
      ? [{ recipeId: MANUAL_RECIPE_ID, ingredients: manualItems.map((m) => ({ key: m.key, name: m.name, quantity: m.quantity, unit: m.unit })) }]
      : [];
    const { items: allItems } = consolidateIngredients([...recipeEntries, ...manualEntry]);
    return { items: allItems.filter((item) => !excludedKeys.includes(itemRowKey(item))) };
  }, [items, manualItems, excludedKeys]);

  const groupedList = useMemo(() => groupByCategory(consolidated.items), [consolidated.items]);

  const totalServings = useMemo(() => items.reduce((sum, i) => sum + (i.servings || 0), 0), [items]);

  // A "meal" is a filled day+slot; a slot can hold multiple recipes, so this
  // is distinct from (and never greater than) the recipe count below.
  const mealsPlanned = useMemo(() => new Set(items.map((i) => `${i.day}:${i.slot}`)).size, [items]);

  const overallLeverage = useMemo(
    () => planLeverage(totalServings, consolidated.items.length),
    [totalServings, consolidated.items.length]
  );

  const ingredientUnion = useMemo(
    () => planIngredientUnion(items.map((i) => ({ id: i.id, servings: i.servings, ingredientKeys: (i.ingredients || []).map((ing) => ing.key) }))),
    [items]
  );

  const leverageForCandidate = useCallback(
    (candidateRecipe) => recipeLeverage(candidateRecipe, ingredientUnion),
    [ingredientUnion]
  );

  const value = useMemo(
    () => ({
      hydrated,
      items,
      addRecipe,
      removeItem,
      updateItemServings,
      checkedKeys,
      toggleChecked,
      removeConsolidatedItem,
      manualItems,
      addManualItem,
      removeManualItem,
      clearPlan,
      consolidatedItems: consolidated.items,
      groupedList,
      totalServings,
      overallLeverage,
      leverageForCandidate,
      mealsPlanned,
      recipesPlanned: items.length,
    }),
    [
      hydrated, items, addRecipe, removeItem, updateItemServings, checkedKeys, toggleChecked,
      removeConsolidatedItem, manualItems, addManualItem, removeManualItem, clearPlan,
      consolidated.items, groupedList, totalServings, overallLeverage, leverageForCandidate, mealsPlanned,
    ]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan() must be used within a PlanProvider');
  return ctx;
}
