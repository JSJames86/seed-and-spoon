// ---------------------------------------------------------------------------
// Household Food Coverage Engine -- Spec v0.2 (formerly "Meal Leverage
// Engine (MLE)", Spec v0.1)
//
// The engine optimizes for a household, not a recipe: "what should I buy
// today so I can cook all week?" It finds the smallest purchase that turns
// a pantry of disconnected ingredients into the most meals.
//
// Two scorers, two altitudes (§2):
//
//   - Marginal scorer (mealLeverageScore, §2a) -- builds a single candidate
//     plan, greedily, picking the next purchase by each recipe's *marginal*
//     completion bundle:
//
//       MLS(recipe) = (servings * nutrition^nutritionWeight * depletion * preference) / bundleCost
//
//     bundleCost == 0 (fully covered by pantry/cart) -> MLS = Infinity, so
//     "free" pantry meals are always cooked first. preference == 0 anywhere
//     in a recipe is a hard skip (MLS = 0).
//
//   - Plan scorer (scoreCoveragePlan, §2b) -- selects between finished
//     candidate plans (a beam search over a few seeds, buildCoveragePlans):
//
//       planScore = 0.50*coverageScore + 0.20*nutritionScore
//                  + 0.20*overlapScore  + 0.10*preferenceScore
//                  - 0.40*wastePenalty
//
// This is greedy-with-recompute: after each recipe is committed, its
// ingredients move from "missing" to "owned" (pantry + cart), so the next
// recipe that reuses them sees a smaller bundle, a lower cost, and a higher
// score. Overlap is not a rule -- it emerges from recomputing each loop.
//
// Recipes whose nutrition is below NOURISHMENT_FLOOR never enter the
// candidate set (a gate, not a weight -- §2 "nourishment floor").
//
// `priceBasket(missing, storeId)` is an injected dependency that wraps the
// existing SpoonAssist PriceEngine (lib/spoonassist/priceEngine.js)'s
// 5-tier resolveIngredientPrice/calculateRecipeCost. It must resolve to
// `{ total: number, items: { id, amount, unit, price }[] }`.
// ---------------------------------------------------------------------------

const DEPLETION_THRESHOLD_DAYS = 3;
const DEPLETION_BONUS_PER_ITEM = 0.25;

// Flat rideshare estimate used by the store-switch gap branch until real
// distance-based trip costing is wired up (e.g. via googlePlacesClient).
export const DEFAULT_TRIP_COST = 10;

// SNAP/WIC variant (§6): nutrition is weighted harder so benefits buy
// sustenance, not filler.
export const SNAP_NUTRITION_WEIGHT = 2;

// SNAP/WIC variant (§6): cap how many dinners ahead we plan for, even if
// daysUntilReload is large.
export const MAX_SNAP_DINNERS = 14;

// §2 nourishment floor: recipes scoring below this on the static 0..1
// `nutrition` field are rejected before optimization -- a gate, not a
// weight, so a cheap "buttered noodles" recipe can never be dragged into
// the candidate set by price alone.
export const NOURISHMENT_FLOOR = 0.4;

// §5 Community Bridge: a remaining gap this cheap or cheaper is mintable as
// a Bridge Request (existing Stripe/Resend donor flow) instead of falling
// back to the generic Seed & Spoon referral.
export const DONATION_THRESHOLD = 15;

// §2 beam search: candidate CoveragePlans to build (1 unseeded + up to
// BEAM_WIDTH-1 anchor-recipe seeds) before picking the winner by planScore.
export const BEAM_WIDTH = 4;

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Section 1: per-recipe scoring primitives
// ---------------------------------------------------------------------------

/**
 * Ingredients a recipe still needs, given what's owned (pantry + cart so far).
 * @param {{ingredients: {id:string, amount:number, unit:string, optional?:boolean}[]}} recipe
 * @param {Map<string, number>} owned
 * @returns {{id:string, amount:number, unit:string}[]}
 */
export function shortfall(recipe, owned) {
  const miss = [];
  for (const ing of recipe.ingredients) {
    if (ing.optional) continue;
    const have = owned.get(ing.id) ?? 0;
    if (have < ing.amount) {
      miss.push({ id: ing.id, amount: round2(ing.amount - have), unit: ing.unit });
    }
  }
  return miss;
}

/**
 * >=1 multiplier that rewards recipes consuming near-expiry pantry stock.
 * @param {{ingredients: {id:string}[]}} recipe
 * @param {Map<string, {expiresInDays?: number|null}>} pantryMap
 */
export function depletionBonus(recipe, pantryMap) {
  let bonus = 1;
  for (const ing of recipe.ingredients) {
    const item = pantryMap.get(ing.id);
    if (item?.expiresInDays != null && item.expiresInDays <= DEPLETION_THRESHOLD_DAYS) {
      bonus += DEPLETION_BONUS_PER_ITEM;
    }
  }
  return bonus;
}

/**
 * Household taste multiplier. A weight of 0 on any ingredient is a hard skip.
 * @param {{ingredients: {id:string}[]}} recipe
 * @param {{prefs?: Map<string, number>}} household
 */
export function prefMultiplier(recipe, household) {
  let multiplier = 1;
  for (const ing of recipe.ingredients) {
    const weight = household.prefs?.get(ing.id) ?? 1;
    if (weight === 0) return 0;
    multiplier *= weight;
  }
  return multiplier;
}

/**
 * §2 nourishment floor (a gate, not a weight): recipes below this score
 * never enter the candidate set, regardless of how cheap they are.
 * @param {{nutrition: number}} recipe
 */
export function passesNourishmentFloor(recipe) {
  return (recipe.nutrition ?? 0) >= NOURISHMENT_FLOOR;
}

/**
 * MLS(recipe) = (servings * nutrition^nutritionWeight * depletion * preference) / bundleCost
 * bundleCost <= 0 (fully covered) -> Infinity. preference == 0 -> 0.
 */
export function mealLeverageScore({ recipe, cost, pantryMap, household, nutritionWeight = 1 }) {
  const pref = prefMultiplier(recipe, household);
  if (pref === 0) return 0;
  if (cost <= 0) return Infinity;
  const nutrition = Math.pow(Math.max(recipe.nutrition, 0), nutritionWeight);
  return (recipe.servings * nutrition * depletionBonus(recipe, pantryMap) * pref) / cost;
}

// ---------------------------------------------------------------------------
// Section 2: the greedy recompute loop (the leverage effect)
// ---------------------------------------------------------------------------

/**
 * @param {object} opts
 * @param {object[]} opts.recipes
 * @param {{id:string, remaining:number, expiresInDays?:number|null}[]} opts.pantry
 * @param {{size:number, dinnersNeeded:number, prefs?:Map<string,number>}} opts.household
 * @param {number} opts.budget
 * @param {string} opts.storeId
 * @param {(missing:{id:string,amount:number,unit:string}[], storeId:string) => Promise<{total:number, items:{id:string,amount:number,unit:string,price:number}[]}>} opts.priceBasket
 * @param {number} [opts.nutritionWeight]
 * @param {Set<string>} [opts.excludeRecipeIds]
 * @param {object} [opts.pinnedRecipe] §9 "recipe-in": a fixed node added to
 *   the plan *before* the greedy loop, regardless of budget. Its own cost
 *   may exceed `budget` (driving budgetLeft negative) -- that overshoot is
 *   the "$X away from this recipe" the caller reports. The loop then fills
 *   in *around* it with whatever budget remains. Also used by
 *   buildCoveragePlans (§2) to seed beam-search candidates.
 */
export async function planBuyList({
  recipes,
  pantry,
  household,
  budget,
  storeId,
  priceBasket,
  nutritionWeight = 1,
  excludeRecipeIds,
  pinnedRecipe,
}) {
  const owned = new Map();
  const pantryMap = new Map();
  for (const item of pantry) {
    owned.set(item.id, item.remaining);
    pantryMap.set(item.id, item);
  }

  const cart = new Map(); // id -> { amount, unit, price }
  const plan = [];
  const usedRecipeIds = new Set(excludeRecipeIds ?? []);
  let budgetLeft = budget;
  let servingsNeeded = household.size * household.dinnersNeeded;

  if (pinnedRecipe) {
    const miss = shortfall(pinnedRecipe, owned);
    const priced = miss.length === 0
      ? { total: 0, items: [] }
      : await priceBasket(miss, storeId);

    commitToCart(cart, priced.items);
    for (const m of miss) {
      owned.set(m.id, round2((owned.get(m.id) ?? 0) + m.amount));
    }

    plan.push({
      recipe: pinnedRecipe,
      cost: round2(priced.total),
      missing: miss,
      fromPantry: priced.total === 0,
      pinned: true,
    });
    usedRecipeIds.add(pinnedRecipe.id);
    budgetLeft = round2(budgetLeft - priced.total);
    servingsNeeded -= pinnedRecipe.servings;
  }

  while (servingsNeeded > 0) {
    let best = null;

    for (const recipe of recipes) {
      if (usedRecipeIds.has(recipe.id)) continue;

      const pref = prefMultiplier(recipe, household);
      if (pref === 0) continue;

      const miss = shortfall(recipe, owned);
      const priced = miss.length === 0
        ? { total: 0, items: [] }
        : await priceBasket(miss, storeId);

      // A pinned recipe can drive budgetLeft negative; free (pantry-covered)
      // recipes must still be pickable in that case, so compare against
      // max(budgetLeft, 0) rather than budgetLeft directly.
      if (priced.total > Math.max(budgetLeft, 0)) continue;

      const mls = mealLeverageScore({ recipe, cost: priced.total, pantryMap, household, nutritionWeight });
      if (mls <= 0) continue;

      if (!best || mls > best.mls) best = { recipe, miss, priced, mls };
    }

    if (!best) break; // GAP: nothing affordable adds a meal

    commitToCart(cart, best.priced.items);
    for (const m of best.miss) {
      owned.set(m.id, round2((owned.get(m.id) ?? 0) + m.amount)); // makes reuse free next loop
    }

    plan.push({
      recipe: best.recipe,
      cost: round2(best.priced.total),
      missing: best.miss,
      fromPantry: best.priced.total === 0,
    });
    usedRecipeIds.add(best.recipe.id);
    budgetLeft = round2(budgetLeft - best.priced.total);
    servingsNeeded -= best.recipe.servings;
  }

  return {
    plan,
    cart,
    owned,
    pantryMap,
    spent: round2(budget - budgetLeft),
    budgetLeft: round2(budgetLeft),
    stretched: servingsNeeded <= 0,
    gapServings: Math.max(0, servingsNeeded),
    usedRecipeIds,
  };
}

function commitToCart(cart, items) {
  for (const item of items) {
    const existing = cart.get(item.id) ?? { amount: 0, unit: item.unit, price: 0 };
    cart.set(item.id, {
      amount: round2(existing.amount + item.amount),
      unit: item.unit,
      price: round2(existing.price + item.price),
    });
  }
}

// ---------------------------------------------------------------------------
// Section 2b: the plan scorer (§2b) and beam search (§2)
//
// mealLeverageScore (§2a) *builds* one candidate plan, greedily. This
// section *selects* between a handful of finished candidates: planScore
// rewards coverage, mean nutrition, ingredient overlap (the leverage "moat"),
// and household preference, and penalizes "orphan" purchases that no other
// recipe in the plan reuses.
// ---------------------------------------------------------------------------

/**
 * planScore = 0.50*coverageScore + 0.20*nutritionScore + 0.20*overlapScore
 *           + 0.10*preferenceScore - 0.40*wastePenalty
 *
 * - coverageScore: servingsProduced / servingsNeeded, capped at 1.
 * - nutritionScore: mean `recipe.nutrition` across the plan's recipes.
 * - overlapScore: ingredient-uses contributed by ingredients shared across
 *   >=2 plan recipes, as a share of all ingredient-uses -- "the moat".
 * - preferenceScore: mean of min(1, prefMultiplier) across plan recipes.
 * - wastePenalty: $ spent on "orphan" ingredients (purchased for, and used
 *   by, only one recipe in the plan) as a share of total $ spent. Orphan
 *   plans must actually lose, so this term is *subtracted*.
 *
 * @param {object} opts
 * @param {Awaited<ReturnType<typeof planBuyList>>} opts.base
 * @param {{size:number, dinnersNeeded:number, prefs?:Map<string,number>}} opts.household
 */
export function scoreCoveragePlan({ base, household }) {
  const { plan, cart } = base;
  const servingsNeeded = household.size * household.dinnersNeeded;
  const unlocks = plan.reduce((sum, p) => sum + p.recipe.servings, 0);

  const coverageScore = servingsNeeded > 0
    ? Math.min(1, unlocks / servingsNeeded)
    : (plan.length > 0 ? 1 : 0);

  const nutritionScore = plan.length > 0
    ? plan.reduce((sum, p) => sum + Math.max(p.recipe.nutrition ?? 0, 0), 0) / plan.length
    : 0;

  // How many times each ingredient is used (non-optional) across the plan.
  const useCounts = new Map();
  let totalUses = 0;
  for (const p of plan) {
    for (const ing of p.recipe.ingredients) {
      if (ing.optional) continue;
      totalUses += 1;
      useCounts.set(ing.id, (useCounts.get(ing.id) ?? 0) + 1);
    }
  }

  let reusedUses = 0;
  for (const count of useCounts.values()) {
    if (count >= 2) reusedUses += count;
  }
  const overlapScore = totalUses > 0 ? reusedUses / totalUses : 0;

  const preferenceScore = plan.length > 0
    ? plan.reduce((sum, p) => sum + Math.min(1, prefMultiplier(p.recipe, household)), 0) / plan.length
    : 0;

  let purchasedValue = 0;
  let unusedValue = 0;
  for (const [id, item] of cart.entries()) {
    purchasedValue += item.price;
    if ((useCounts.get(id) ?? 0) <= 1) unusedValue += item.price;
  }
  const wastePenalty = purchasedValue > 0 ? unusedValue / purchasedValue : 0;

  const planScore = round2(
    0.50 * coverageScore
    + 0.20 * nutritionScore
    + 0.20 * overlapScore
    + 0.10 * preferenceScore
    - 0.40 * wastePenalty
  );

  return { coverageScore, nutritionScore, overlapScore, preferenceScore, wastePenalty, planScore };
}

/**
 * §2 beam search: "Compare plans against plans" without enumerating every
 * basket. Constructs 1-BEAM_WIDTH candidate CoveragePlans:
 *
 * - If `pinnedRecipe` is given (§9 recipe-in), it's the only seed -- the
 *   pin itself is the constraint, so there's nothing to vary.
 * - Otherwise, builds one unseeded plan plus one plan per "anchor" recipe,
 *   each pinned first via planBuyList's `pinnedRecipe`. Anchors fill
 *   BEAM_WIDTH-1 slots by interleaving two rankings: top recipes by marginal
 *   score against a flat cost of 1 (VALUE), and top recipes by overlap
 *   potential -- how many *other* eligible recipes share each of its
 *   ingredients, summed across the recipe (OVERLAP). Value-only seeding
 *   strands low-value "hub" recipes that would unlock a lot of overlap once
 *   bought, because a cheap non-overlapping recipe out-scores the hub on its
 *   own marginal value and the beam never sees what buying the hub would
 *   unlock (see beamSearchOverlap.test.js). Interleaving gives high-overlap
 *   recipes a seed slot even when their standalone value wouldn't earn one.
 *   Duplicate resulting plans (same recipe set) are collapsed.
 *
 * Each candidate is scored with scoreCoveragePlan (§2b); the caller picks
 * the winner with selectBestCoveragePlan.
 *
 * @param {object} opts same shape as planBuyList, plus:
 * @param {object} [opts.pinnedRecipe]
 * @param {number} [opts.beamWidth]
 * @returns {Promise<{base: Awaited<ReturnType<typeof planBuyList>>, score: ReturnType<typeof scoreCoveragePlan>}[]>}
 */
export async function buildCoveragePlans({
  recipes,
  pantry,
  household,
  budget,
  storeId,
  priceBasket,
  nutritionWeight = 1,
  pinnedRecipe = null,
  beamWidth = BEAM_WIDTH,
}) {
  if (pinnedRecipe) {
    const base = await planBuyList({ recipes, pantry, household, budget, storeId, priceBasket, nutritionWeight, pinnedRecipe });
    return [{ base, score: scoreCoveragePlan({ base, household }) }];
  }

  const pantryMap = new Map(pantry.map(p => [p.id, p]));

  // Eligible recipes: marginal score against a flat cost of 1 (i.e.
  // servings * nutrition^w * depletion * preference) -- a cost-agnostic
  // proxy for "inherently high-value", since real cost depends on pantry
  // state that only exists once a recipe is actually pinned. mls <= 0 means
  // a hard preference skip (or non-positive nutrition), so it can never be a
  // useful anchor.
  const eligible = recipes
    .map(recipe => ({ recipe, mls: mealLeverageScore({ recipe, cost: 1, pantryMap, household, nutritionWeight }) }))
    .filter(({ mls }) => mls > 0);

  const valueRanked = [...eligible].sort((a, b) => b.mls - a.mls).map(({ recipe }) => recipe);

  // Overlap potential: for each eligible recipe, sum across its (non-optional)
  // ingredients of how many *other* eligible recipes also use that
  // ingredient -- "how much leverage does pinning this recipe create for the
  // rest of the corpus."
  const ingredientRecipeCount = new Map();
  for (const { recipe } of eligible) {
    for (const id of new Set(recipe.ingredients.filter(i => !i.optional).map(i => i.id))) {
      ingredientRecipeCount.set(id, (ingredientRecipeCount.get(id) ?? 0) + 1);
    }
  }

  const overlapRanked = eligible
    .map(({ recipe }) => {
      const ids = new Set(recipe.ingredients.filter(i => !i.optional).map(i => i.id));
      let potential = 0;
      for (const id of ids) potential += (ingredientRecipeCount.get(id) ?? 1) - 1;
      return { recipe, potential };
    })
    .filter(({ potential }) => potential > 0)
    .sort((a, b) => b.potential - a.potential)
    .map(({ recipe }) => recipe);

  // Fill BEAM_WIDTH-1 anchor slots by interleaving the two rankings, so a
  // high-overlap "hub" recipe gets a seeded plan even when value-ranking
  // alone would never reach it.
  const beamSlots = Math.max(0, beamWidth - 1);
  const anchors = [];
  const anchorIds = new Set();
  let vi = 0, oi = 0;
  while (anchors.length < beamSlots && (vi < valueRanked.length || oi < overlapRanked.length)) {
    if (vi < valueRanked.length) {
      const recipe = valueRanked[vi++];
      if (!anchorIds.has(recipe.id)) {
        anchors.push(recipe);
        anchorIds.add(recipe.id);
      }
    }
    if (anchors.length >= beamSlots) break;
    if (oi < overlapRanked.length) {
      const recipe = overlapRanked[oi++];
      if (!anchorIds.has(recipe.id)) {
        anchors.push(recipe);
        anchorIds.add(recipe.id);
      }
    }
  }

  const seeds = [null, ...anchors];
  const candidates = [];
  const seen = new Set();

  for (const seed of seeds) {
    const base = await planBuyList({ recipes, pantry, household, budget, storeId, priceBasket, nutritionWeight, pinnedRecipe: seed ?? undefined });
    const key = base.plan.map(p => p.recipe.id).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ base, score: scoreCoveragePlan({ base, household }) });
  }

  return candidates;
}

/**
 * Picks the highest-planScore candidate from buildCoveragePlans.
 * @param {{base: object, score: {planScore: number}}[]} candidates
 */
export function selectBestCoveragePlan(candidates) {
  return candidates.reduce((best, c) => (!best || c.score.planScore > best.score.planScore) ? c : best, candidates[0]);
}

// ---------------------------------------------------------------------------
// Section 3: the gap branch (§5) -- "never just say you need $X"
// ---------------------------------------------------------------------------

/**
 * Bridge buy: continue the greedy loop past the original budget, picking up
 * exactly where planBuyList left off, until the remaining servings gap
 * closes (or candidates run out). Reports the *extra* spend required.
 * @param {object} opts
 * @param {object[]} opts.recipes
 * @param {object} opts.household
 * @param {string} opts.storeId
 * @param {Function} opts.priceBasket
 * @param {ReturnType<typeof planBuyList> extends Promise<infer T> ? T : never} opts.base
 * @param {number} [opts.nutritionWeight]
 */
export async function findBridgeBuy({ recipes, household, storeId, priceBasket, base, nutritionWeight = 1 }) {
  if (base.gapServings <= 0) return null;

  const owned = new Map(base.owned);
  const usedRecipeIds = new Set(base.usedRecipeIds);
  let servingsNeeded = base.gapServings;
  let extraCost = 0;
  const additions = [];
  const cart = new Map();

  while (servingsNeeded > 0) {
    let best = null;

    for (const recipe of recipes) {
      if (usedRecipeIds.has(recipe.id)) continue;

      const pref = prefMultiplier(recipe, household);
      if (pref === 0) continue;

      const miss = shortfall(recipe, owned);
      const priced = miss.length === 0
        ? { total: 0, items: [] }
        : await priceBasket(miss, storeId);

      const mls = mealLeverageScore({ recipe, cost: priced.total, pantryMap: base.pantryMap, household, nutritionWeight });
      if (mls <= 0) continue;

      if (!best || mls > best.mls) best = { recipe, miss, priced, mls };
    }

    if (!best) break;

    commitToCart(cart, best.priced.items);
    for (const m of best.miss) {
      owned.set(m.id, round2((owned.get(m.id) ?? 0) + m.amount));
    }

    additions.push({ recipe: best.recipe, cost: round2(best.priced.total), missing: best.miss });
    usedRecipeIds.add(best.recipe.id);
    extraCost = round2(extraCost + best.priced.total);
    servingsNeeded -= best.recipe.servings;
  }

  return {
    extraCost,
    cart,
    additions,
    closesGap: servingsNeeded <= 0,
    remainingGapServings: Math.max(0, servingsNeeded),
  };
}

/**
 * Store-switch math: re-run the full plan at an alternate, reachable store
 * and check whether it stretches to the full week within the same budget,
 * with a flat trip cost priced in.
 * @param {object} opts
 * @param {object[]} opts.recipes
 * @param {object[]} opts.pantry
 * @param {object} opts.household
 * @param {number} opts.budget
 * @param {{id:string, name:string}} opts.store
 * @param {Function} opts.priceBasket
 * @param {number} [opts.nutritionWeight]
 * @param {number} [opts.tripCost]
 */
export async function evaluateStoreSwitch({ recipes, pantry, household, budget, store, priceBasket, nutritionWeight = 1, tripCost = DEFAULT_TRIP_COST }) {
  const result = await planBuyList({ recipes, pantry, household, budget, storeId: store.id, priceBasket, nutritionWeight });
  if (!result.stretched) return null;

  return {
    storeId: store.id,
    storeName: store.name,
    spent: result.spent,
    tripCost: round2(tripCost),
    net: round2(budget - result.spent - tripCost),
  };
}

/**
 * The "no" becomes the referral, not a dead end: a real, unclosed gap routes
 * to Seed & Spoon's own pantry / Community Delivery path.
 */
function buildReferral(gapServings) {
  return {
    type: 'seed_and_spoon_referral',
    message:
      `We couldn't find an affordable way to close the last ${gapServings} ` +
      `meal${gapServings === 1 ? '' : 's'} this week. That gap is real -- ` +
      `Seed & Spoon's pantry network and Community Delivery program exist ` +
      `for exactly this.`,
    ctaLabel: 'Get help from Seed & Spoon',
    ctaUrl: '/get-help',
    gapServings,
  };
}

/**
 * §5 Community Bridge: when a real, unclosed gap is cheap enough
 * (<= DONATION_THRESHOLD), don't fall back to the generic referral -- mint a
 * request that plugs directly into the EXISTING Stripe/Resend donor flow
 * (POST /api/donations/checkout, lib/validation.js's donationCheckoutSchema).
 * This is not new infrastructure: `donation` is shaped to be posted as-is.
 * @param {object} opts
 * @param {string|null} opts.householdId
 * @param {number} opts.gapCost
 * @param {number} opts.shortfallServings
 */
export function buildBridgeRequest({ householdId, gapCost, shortfallServings }) {
  const cost = round2(gapCost);
  return {
    type: 'bridge_request',
    household_id: householdId,
    gapCost: cost,
    shortfallServings,
    blurb:
      `This household is $${cost.toFixed(2)} away from a full week of meals -- ` +
      `${shortfallServings} meal${shortfallServings === 1 ? '' : 's'} short.`,
    // donationCheckoutSchema requires amount >= 100 (i.e. >= $1.00).
    donation: {
      amount: Math.max(100, Math.round(cost * 100)),
      currency: 'usd',
      interval: 'one_time',
    },
  };
}

// ---------------------------------------------------------------------------
// Section 4: output contract (§7) -- emotional payload first
// ---------------------------------------------------------------------------

function formatQty(amount, unit) {
  const rounded = round2(amount);
  const trimmed = Number(rounded.toFixed(2)).toString();
  return unit === 'each' ? trimmed : `${trimmed} ${unit}`;
}

/**
 * §9 "recipe-in" output: the imported recipe is just another (pinned) entry
 * in `base.plan`, so this reshapes that single entry plus whatever the rest
 * of the plan adds on top of it into "what this recipe itself needs, and
 * what cooking it unlocks for the rest of the week."
 * @param {object} opts
 * @param {Awaited<ReturnType<typeof planBuyList>>} opts.base
 * @param {Map<string,{name:string}>} opts.ingredientCatalog
 * @returns {object|null}
 */
export function buildRecipeInResult({ base, ingredientCatalog }) {
  const pinned = base.plan.find(p => p.pinned);
  if (!pinned) return null;

  const missingIds = new Set(pinned.missing.map(m => m.id));

  const have = pinned.recipe.ingredients
    .filter(ing => !ing.optional && !missingIds.has(ing.id))
    .map(ing => ingredientCatalog.get(ing.id)?.name ?? ing.id);

  const need = pinned.missing.map(m => ({
    name: ingredientCatalog.get(m.id)?.name ?? m.id,
    qty: formatQty(m.amount, m.unit),
  }));

  const unlockedPlan = base.plan.filter(p => !p.pinned);

  return {
    name: pinned.recipe.name,
    have,
    need,
    cost: pinned.cost,
    missing: pinned.missing.map(m => ingredientCatalog.get(m.id)?.name ?? m.id),
    unlocks: unlockedPlan.map(p => p.recipe.name),
    unlocksServings: unlockedPlan.reduce((sum, p) => sum + p.recipe.servings, 0),
  };
}

/**
 * @param {object} opts
 * @param {Awaited<ReturnType<typeof planBuyList>>} opts.base
 * @param {{size:number, dinnersNeeded:number}} opts.household
 * @param {number} opts.budget
 * @param {string} opts.storeName
 * @param {Map<string,{name:string}>} opts.ingredientCatalog
 * @param {{bridge:object|null, storeSwitch:object|null, bridgeRequest:object|null, referral:object|null}|null} [opts.gap]
 * @param {ReturnType<typeof buildRecipeInResult>} [opts.recipeIn] §9 output
 *   block, present only when this run was seeded by an imported recipe.
 * @param {ReturnType<typeof scoreCoveragePlan>} [opts.coveragePlan] §2b score
 *   breakdown for the winning candidate, for transparency/debugging.
 */
export function buildVerdict({ base, household, budget, storeName, ingredientCatalog, gap, recipeIn = null, coveragePlan = null }) {
  const { plan, cart, spent, stretched, gapServings } = base;

  const unlocks = plan.reduce((sum, p) => sum + p.recipe.servings, 0);
  const targetServings = household.size * household.dinnersNeeded;
  const coversDays = household.size > 0 ? Math.floor(unlocks / household.size) : 0;

  const buy = [...cart.entries()].map(([id, item]) => ({
    name: ingredientCatalog.get(id)?.name ?? id,
    qty: formatQty(item.amount, item.unit),
    price: item.price,
  }));

  const planOut = plan.map(p => ({
    name: p.recipe.name,
    servings: p.recipe.servings,
    source: p.fromPantry ? 'pantry' : 'buy',
    missing: p.missing.map(m => ingredientCatalog.get(m.id)?.name ?? m.id),
    pinned: p.pinned ?? false,
  }));

  const headline = stretched
    ? `You're $${spent.toFixed(2)} away from ${unlocks} meals.`
    : `Your $${budget.toFixed(2)} covers ${unlocks} of ${targetServings} meals this week.`;

  return {
    verdict: stretched ? 'stretches' : 'gap',
    headline,
    spent,
    store: storeName,
    buy,
    unlocks,
    coversDays,
    plan: planOut,
    coveragePlan,
    recipeIn,
    // §5 Gap Report: a real, unclosed gap is never just "you need $X" -- it's
    // paired with how much was covered, and (if possible) a bridge, a
    // cheaper store, a donation request, or Seed & Spoon's own referral.
    gap: gapServings > 0 ? {
      neededServings: targetServings,
      coveredServings: unlocks,
      shortfallServings: gapServings,
      additionalCost: gap?.bridge?.extraCost ?? null,
      bridge: gap?.bridge ? {
        extraCost: gap.bridge.extraCost,
        unlocks: gap.bridge.additions.reduce((sum, a) => sum + a.recipe.servings, 0),
        closesGap: gap.bridge.closesGap,
        recipes: gap.bridge.additions.map(a => a.recipe.name),
      } : null,
      storeSwitch: gap?.storeSwitch ?? null,
      bridgeRequest: gap?.bridgeRequest ?? null,
      referral: gap?.referral ?? null,
    } : null,
  };
}

// ---------------------------------------------------------------------------
// Section 5: orchestrator -- ties the loop (§4) and the gap branch (§5)
// together, including the SNAP/WIC variant (§6): same engine, different
// budget window, with nutrition weighted harder.
// ---------------------------------------------------------------------------

/**
 * @param {object} input
 * @param {object[]} input.recipes
 * @param {object[]} input.pantry
 * @param {{size:number, dinnersNeeded:number, prefs?:Map<string,number>}} input.household
 * @param {Function} input.priceBasket
 * @param {Map<string,{name:string}>} input.ingredientCatalog
 * @param {{id:string, name:string}} input.store
 * @param {number} [input.budget] defaults to 0 -- §9 recipe-in calls may
 *   have no grocery budget at all, just an imported recipe to evaluate.
 * @param {{id:string, name:string, tripCost?:number}[]} [input.altStores]
 * @param {{balance:number, daysUntilReload:number}} [input.snap]
 * @param {object|null} [input.recipeIn] §9 "recipe-in": an imported recipe,
 *   pre-seeded into the plan via planBuyList's `pinnedRecipe`. recipe-in is
 *   just budget-in with this recipe (and its servings) committed first --
 *   the engine is not forked for it.
 * @param {string|null} [input.householdId] only needed to stamp a §5
 *   Community Bridge request with the household it's for.
 * @param {(base: Awaited<ReturnType<typeof planBuyList>>) => void} [input.onBase]
 *   optional hook invoked with the winning candidate's `base` (plan, cart,
 *   gapServings, ...) before the §7 verdict is built. Lets callers do
 *   side-effecting work -- e.g. logging requirement_events for each plan
 *   recipe's §4 shortfall (`base.plan[].missing`) -- without changing this
 *   function's JSON-serializable return shape.
 */
export async function runMealLeverageEngine(input) {
  const {
    recipes,
    pantry,
    household,
    priceBasket,
    ingredientCatalog,
    store,
    budget,
    altStores = [],
    snap = null,
    recipeIn = null,
    householdId = null,
    onBase = null,
  } = input;

  let effectiveBudget = typeof budget === 'number' ? budget : 0;
  let effectiveHousehold = household;
  let nutritionWeight = 1;
  // §2 nourishment floor: applied to the candidate pool before optimization,
  // not to a user-imported `recipeIn` -- that recipe is pinned regardless.
  let usableRecipes = recipes.filter(passesNourishmentFloor);

  // §6 SNAP/WIC variant: maximize nutritious servings before benefits
  // reload, instead of optimizing within a fixed grocery budget.
  if (snap) {
    effectiveBudget = snap.balance;
    effectiveHousehold = {
      ...household,
      dinnersNeeded: Math.min(snap.daysUntilReload, MAX_SNAP_DINNERS),
    };
    nutritionWeight = SNAP_NUTRITION_WEIGHT;
    usableRecipes = usableRecipes.filter(r => r.snapEligible !== false);
  }

  const candidates = await buildCoveragePlans({
    recipes: usableRecipes,
    pantry,
    household: effectiveHousehold,
    budget: effectiveBudget,
    storeId: store.id,
    priceBasket,
    nutritionWeight,
    pinnedRecipe: recipeIn ?? undefined,
  });

  const { base, score } = selectBestCoveragePlan(candidates);

  onBase?.(base);

  let gap = null;
  if (base.gapServings > 0) {
    const bridge = await findBridgeBuy({
      recipes: usableRecipes,
      household: effectiveHousehold,
      storeId: store.id,
      priceBasket,
      base,
      nutritionWeight,
    });

    let storeSwitch = null;
    for (const alt of altStores) {
      storeSwitch = await evaluateStoreSwitch({
        recipes: usableRecipes,
        pantry,
        household: effectiveHousehold,
        budget: effectiveBudget,
        store: alt,
        priceBasket,
        nutritionWeight,
        tripCost: alt.tripCost,
      });
      if (storeSwitch) break;
    }

    let bridgeRequest = null;
    let referral = null;
    if (!bridge?.closesGap && !storeSwitch) {
      // §5 Community Bridge: a cheap-enough real gap becomes a donation
      // request instead of a referral. extraCost === 0 means nothing
      // affordable was even found to bridge with -- that's a referral, not
      // a $0 donation ask.
      if (bridge && bridge.extraCost > 0 && bridge.extraCost <= DONATION_THRESHOLD) {
        bridgeRequest = buildBridgeRequest({
          householdId,
          gapCost: bridge.extraCost,
          shortfallServings: bridge.remainingGapServings,
        });
      } else {
        referral = buildReferral(base.gapServings);
      }
    }

    gap = { bridge, storeSwitch, bridgeRequest, referral };
  }

  return buildVerdict({
    base,
    household: effectiveHousehold,
    budget: effectiveBudget,
    storeName: store.name,
    ingredientCatalog,
    gap,
    recipeIn: recipeIn ? buildRecipeInResult({ base, ingredientCatalog }) : null,
    coveragePlan: score,
  });
}
