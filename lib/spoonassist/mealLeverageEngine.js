// ---------------------------------------------------------------------------
// Meal Leverage Engine (MLE) -- Spec v0.1
//
// MLE optimizes for a household, not a recipe: "what should I buy today so
// I can cook all week?" It finds the smallest purchase that turns a pantry
// of disconnected ingredients into the most meals, scored by the Meal
// Leverage Score (MLS), evaluated over each recipe's *marginal* completion
// bundle:
//
//   MLS(recipe) = (servings * nutrition^nutritionWeight * depletion * preference) / bundleCost
//
// bundleCost == 0 (fully covered by pantry/cart) -> MLS = Infinity, so
// "free" pantry meals are always cooked first. preference == 0 anywhere in
// a recipe is a hard skip (MLS = 0).
//
// This is greedy-with-recompute: after each recipe is committed, its
// ingredients move from "missing" to "owned" (pantry + cart), so the next
// recipe that reuses them sees a smaller bundle, a lower cost, and a higher
// score. Overlap is not a rule -- it emerges from recomputing each loop.
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

      if (priced.total > budgetLeft) continue;

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

// ---------------------------------------------------------------------------
// Section 4: output contract (§7) -- emotional payload first
// ---------------------------------------------------------------------------

function formatQty(amount, unit) {
  const rounded = round2(amount);
  const trimmed = Number(rounded.toFixed(2)).toString();
  return unit === 'each' ? trimmed : `${trimmed} ${unit}`;
}

/**
 * @param {object} opts
 * @param {Awaited<ReturnType<typeof planBuyList>>} opts.base
 * @param {{size:number, dinnersNeeded:number}} opts.household
 * @param {number} opts.budget
 * @param {string} opts.storeName
 * @param {Map<string,{name:string}>} opts.ingredientCatalog
 * @param {{bridge:object|null, storeSwitch:object|null, referral:object|null}|null} [opts.gap]
 */
export function buildVerdict({ base, household, budget, storeName, ingredientCatalog, gap }) {
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
    gap: gapServings > 0 ? {
      servings: gapServings,
      bridge: gap?.bridge ? {
        extraCost: gap.bridge.extraCost,
        unlocks: gap.bridge.additions.reduce((sum, a) => sum + a.recipe.servings, 0),
        closesGap: gap.bridge.closesGap,
        recipes: gap.bridge.additions.map(a => a.recipe.name),
      } : null,
      storeSwitch: gap?.storeSwitch ?? null,
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
 * @param {number} [input.budget]
 * @param {{id:string, name:string, tripCost?:number}[]} [input.altStores]
 * @param {{balance:number, daysUntilReload:number}} [input.snap]
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
  } = input;

  let effectiveBudget = budget;
  let effectiveHousehold = household;
  let nutritionWeight = 1;
  let usableRecipes = recipes;

  // §6 SNAP/WIC variant: maximize nutritious servings before benefits
  // reload, instead of optimizing within a fixed grocery budget.
  if (snap) {
    effectiveBudget = snap.balance;
    effectiveHousehold = {
      ...household,
      dinnersNeeded: Math.min(snap.daysUntilReload, MAX_SNAP_DINNERS),
    };
    nutritionWeight = SNAP_NUTRITION_WEIGHT;
    usableRecipes = recipes.filter(r => r.snapEligible !== false);
  }

  const base = await planBuyList({
    recipes: usableRecipes,
    pantry,
    household: effectiveHousehold,
    budget: effectiveBudget,
    storeId: store.id,
    priceBasket,
    nutritionWeight,
  });

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

    const referral = (!bridge?.closesGap && !storeSwitch)
      ? buildReferral(base.gapServings)
      : null;

    gap = { bridge, storeSwitch, referral };
  }

  return buildVerdict({
    base,
    household: effectiveHousehold,
    budget: effectiveBudget,
    storeName: store.name,
    ingredientCatalog,
    gap,
  });
}
