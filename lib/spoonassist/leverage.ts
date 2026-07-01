/**
 * SpoonAssist v2 -- Meal Leverage Score (spec §5, v1 definition)
 *
 * This is deliberately separate from lib/spoonassist/mealLeverageEngine.js
 * (the v0.1/v0.2 Household Food Coverage Engine): that engine optimizes a
 * budget-constrained purchase plan against a nutrition-scored recipe corpus
 * with canonical-unit pantry math. This module is the simple, marketing-
 * facing "meals per item you buy" score shown on cards, recipe detail, and
 * the weekly plan for the v2 editorial catalog -- pure ingredient-overlap
 * counting, no cost/nutrition/budget involved. It is intentionally
 * defensible on its own terms:
 *
 *   overlap(r,P)  = count of r's ingredients already in P's union
 *   newItems(r,P) = r.ingredients - overlap
 *   leverage(r,P) = servings(r) / max(newItems, 1)   -> normalized 0-10
 *
 * Plan-level score: total planned servings / unique shopping-list items,
 * normalized 0-10.
 *
 * "Ingredient" here is caller-defined identity, not necessarily a DB
 * canonical_id -- the caller passes deduped `ingredientKeys` per recipe
 * (canonical_id when known, else a normalized ingredient name), so this
 * module has no DB/network dependency and stays pure/unit-testable.
 */

export interface LeverageRecipe {
  id: string;
  servings: number;
  /** Deduped identifiers for this recipe's ingredients (canonical_id, or a
   *  normalized name when no canonical match exists). */
  ingredientKeys: string[];
}

const MAX_DISPLAY_SCORE = 10;

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function clampDisplay(raw: number): number {
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return round1(Math.min(raw, MAX_DISPLAY_SCORE));
}

/** The union of ingredient keys across every recipe currently in a plan. */
export function planIngredientUnion(recipes: LeverageRecipe[]): Set<string> {
  const union = new Set<string>();
  for (const recipe of recipes) {
    for (const key of recipe.ingredientKeys) union.add(key);
  }
  return union;
}

/** Count of `recipe`'s ingredients already present in the plan's union. */
export function overlapCount(recipe: LeverageRecipe, planIngredientKeys: Iterable<string>): number {
  const union = planIngredientKeys instanceof Set ? planIngredientKeys : new Set(planIngredientKeys);
  let count = 0;
  for (const key of new Set(recipe.ingredientKeys)) {
    if (union.has(key)) count += 1;
  }
  return count;
}

/** Count of `recipe`'s ingredients NOT already present in the plan's union. */
export function newItemsCount(recipe: LeverageRecipe, planIngredientKeys: Iterable<string>): number {
  const uniqueKeys = new Set(recipe.ingredientKeys).size;
  return uniqueKeys - overlapCount(recipe, planIngredientKeys);
}

/**
 * How much adding `recipe` to a plan already containing `planIngredientKeys`
 * leverages what's already being bought. Normalized 0-10, one decimal.
 * Tooltip copy (per spec): "Higher = more meals per item you buy."
 */
export function recipeLeverage(recipe: LeverageRecipe, planIngredientKeys: Iterable<string> = []): number {
  const newItems = newItemsCount(recipe, planIngredientKeys);
  const raw = recipe.servings / Math.max(newItems, 1);
  return clampDisplay(raw);
}

/**
 * Plan-level leverage: total planned servings / unique shopping-list items.
 * Normalized 0-10, one decimal. 0 when there are no items yet (nothing to
 * divide by, and nothing planned means no leverage to claim).
 */
export function planLeverage(totalPlannedServings: number, uniqueShoppingListItemCount: number): number {
  if (uniqueShoppingListItemCount <= 0) return 0;
  return clampDisplay(totalPlannedServings / uniqueShoppingListItemCount);
}

/**
 * Ranks candidate recipes by leverage against the current plan, highest
 * first -- the "Add a meal" picker's default sort (spec §4.4).
 */
export function rankByLeverage(candidates: LeverageRecipe[], planRecipes: LeverageRecipe[]): (LeverageRecipe & { leverage: number })[] {
  const union = planIngredientUnion(planRecipes);
  return candidates
    .map((recipe) => ({ ...recipe, leverage: recipeLeverage(recipe, union) }))
    .sort((a, b) => b.leverage - a.leverage);
}
