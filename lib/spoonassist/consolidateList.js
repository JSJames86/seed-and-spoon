// ---------------------------------------------------------------------------
// SpoonAssist v2 -- Smart List consolidation (spec §4.5, §6 `list/consolidate`)
//
// Pure function, no DB/network dependency -- used both client-side (instant
// consolidation for a session-local plan) and server-side (POST
// /api/spoonassist/list/consolidate re-runs this before persisting, so a
// saved list is never trusted from an unverified client payload).
//
// Dedup identity is the same `key` concept leverage.ts uses: canonical_id
// when known, else a normalized ingredient name. Two lines with the same key
// but a DIFFERENT unit are summed only when the unit matches; otherwise they
// stay as separate rows and are flagged `ambiguousUnit` -- "convert units
// where safe; flag ambiguous conversions instead of guessing" (spec §4.5).
// ---------------------------------------------------------------------------

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Dedup identity for an ingredient: its canonical_id when known, else a
 * normalized name. Shared by PlanProvider (building each plan item's
 * ingredient keys) and this module (grouping by that same key).
 */
export function deriveIngredientKey(canonicalId, name) {
  if (canonicalId) return canonicalId;
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Shapes recipe_ingredients rows from GET /api/spoonassist/recipes/[slug]
 * into what PlanProvider.addRecipe / leverage.ts expect: `{ key, name,
 * quantity, unit, canonicalId, category }`.
 */
export function toPlanIngredients(dbIngredients) {
  return (dbIngredients ?? []).map((ing) => ({
    key: deriveIngredientKey(ing.canonical_id, ing.ingredient_name || ing.raw_text),
    name: ing.ingredient_name || ing.raw_text,
    quantity: ing.quantity,
    unit: ing.unit,
    canonicalId: ing.canonical_id ?? null,
    category: ing.category ?? null,
  }));
}

/**
 * @param {{
 *   recipeId: string,
 *   ingredients: { key: string, name: string, quantity: number|null, unit: string|null,
 *                  canonicalId?: string|null, category?: string|null }[],
 * }[]} planRecipes
 * @returns {{ items: {
 *   key: string, name: string, quantity: number|null, unit: string|null,
 *   canonicalId: string|null, category: string|null,
 *   sourceRecipeIds: string[], ambiguousUnit: boolean,
 * }[] }}
 */
export function consolidateIngredients(planRecipes) {
  const groups = new Map(); // `${key}::${unit}` -> aggregated item
  const unitsByKey = new Map(); // key -> Set of units seen across all recipes

  for (const entry of planRecipes ?? []) {
    for (const ing of entry.ingredients ?? []) {
      if (!ing || !ing.key) continue;
      const unit = ing.unit || null;
      const groupKey = `${ing.key}::${unit ?? ''}`;

      if (!unitsByKey.has(ing.key)) unitsByKey.set(ing.key, new Set());
      unitsByKey.get(ing.key).add(unit ?? '');

      const existing = groups.get(groupKey);
      if (existing) {
        existing.quantity = existing.quantity != null && ing.quantity != null
          ? round2(existing.quantity + ing.quantity)
          : existing.quantity ?? ing.quantity ?? null;
        existing.sourceRecipeIds.add(entry.recipeId);
      } else {
        groups.set(groupKey, {
          key: ing.key,
          name: ing.name,
          unit,
          quantity: ing.quantity ?? null,
          canonicalId: ing.canonicalId ?? null,
          category: ing.category ?? null,
          sourceRecipeIds: new Set([entry.recipeId]),
        });
      }
    }
  }

  const items = [...groups.values()].map((item) => ({
    ...item,
    sourceRecipeIds: [...item.sourceRecipeIds],
    ambiguousUnit: unitsByKey.get(item.key).size > 1,
  }));

  return { items };
}

/**
 * Stable per-row identity for a consolidated item -- the same key+unit pair
 * consolidateIngredients grouped by. Used to key checkbox/delete state on
 * the Smart List page, since two rows can share `key` when their units
 * differ (ambiguousUnit).
 */
export function itemRowKey(item) {
  return `${item.key}::${item.unit ?? ''}`;
}

const CATEGORY_FALLBACK = 'Other';

/**
 * Groups consolidated items by aisle/department (spec §4.5) for display.
 * @param {ReturnType<typeof consolidateIngredients>['items']} items
 * @returns {{ category: string, items: object[] }[]} sorted, "Other" last.
 */
export function groupByCategory(items) {
  const byCategory = new Map();
  for (const item of items) {
    const category = item.category || CATEGORY_FALLBACK;
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(item);
  }

  return [...byCategory.entries()]
    .sort(([a], [b]) => {
      if (a === CATEGORY_FALLBACK) return 1;
      if (b === CATEGORY_FALLBACK) return -1;
      return a.localeCompare(b);
    })
    .map(([category, categoryItems]) => ({ category, items: categoryItems }));
}
