import { expect, test, describe } from 'bun:test';
import {
  shortfall,
  depletionBonus,
  prefMultiplier,
  passesNourishmentFloor,
  mealLeverageScore,
  planBuyList,
  scoreCoveragePlan,
  buildCoveragePlans,
  selectBestCoveragePlan,
  findBridgeBuy,
  evaluateStoreSwitch,
  buildBridgeRequest,
  buildRecipeInResult,
  buildVerdict,
  runMealLeverageEngine,
  NOURISHMENT_FLOOR,
  DONATION_THRESHOLD,
} from '@/lib/spoonassist/mealLeverageEngine';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Deterministic stand-in for the real PriceEngine-backed priceBasket().
// basePrices: { ingredientId: pricePerUnit }. storeMultipliers: per-storeId
// multiplier (defaults to 1), so store-switch tests can model a cheaper store.
function makePriceBasket(basePrices, storeMultipliers = {}) {
  return async (missing, storeId) => {
    const mult = storeMultipliers[storeId] ?? 1;
    const items = missing.map(m => ({
      id: m.id,
      amount: m.amount,
      unit: m.unit,
      price: round2(m.amount * (basePrices[m.id] ?? 0) * mult),
    }));
    return { total: round2(items.reduce((sum, i) => sum + i.price, 0)), items };
  };
}

describe('shortfall', () => {
  test('returns unmet, non-optional ingredients with the missing amount', () => {
    const recipe = {
      ingredients: [
        { id: 'rice', amount: 4, unit: 'oz' },
        { id: 'beans', amount: 2, unit: 'oz', optional: true },
        { id: 'cheese', amount: 1, unit: 'oz' },
      ],
    };
    const owned = new Map([['rice', 1], ['cheese', 1]]);

    expect(shortfall(recipe, owned)).toEqual([{ id: 'rice', amount: 3, unit: 'oz' }]);
  });

  test('returns an empty array when everything needed is already owned', () => {
    const recipe = { ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }] };
    const owned = new Map([['rice', 10]]);

    expect(shortfall(recipe, owned)).toEqual([]);
  });
});

describe('depletionBonus', () => {
  test('returns 1 with no near-expiry pantry items', () => {
    const recipe = { ingredients: [{ id: 'rice' }] };
    const pantryMap = new Map([['rice', { expiresInDays: 10 }]]);

    expect(depletionBonus(recipe, pantryMap)).toBe(1);
  });

  test('adds 0.25 per ingredient expiring within 3 days', () => {
    const recipe = { ingredients: [{ id: 'rice' }, { id: 'spinach' }] };
    const pantryMap = new Map([
      ['rice', { expiresInDays: 2 }],
      ['spinach', { expiresInDays: 1 }],
    ]);

    expect(depletionBonus(recipe, pantryMap)).toBe(1.5);
  });

  test('ignores ingredients absent from the pantry or with null expiry', () => {
    const recipe = { ingredients: [{ id: 'rice' }, { id: 'flour' }] };
    const pantryMap = new Map([['rice', { expiresInDays: null }]]);

    expect(depletionBonus(recipe, pantryMap)).toBe(1);
  });
});

describe('prefMultiplier', () => {
  test('defaults to 1 when the household has no preferences', () => {
    const recipe = { ingredients: [{ id: 'rice' }, { id: 'beans' }] };

    expect(prefMultiplier(recipe, {})).toBe(1);
  });

  test('multiplies favorite weights (>1) together', () => {
    const recipe = { ingredients: [{ id: 'rice' }, { id: 'beans' }] };
    const household = { prefs: new Map([['rice', 1.5], ['beans', 2]]) };

    expect(prefMultiplier(recipe, household)).toBe(3);
  });

  test('a weight of 0 on any ingredient is a hard skip', () => {
    const recipe = { ingredients: [{ id: 'rice' }, { id: 'beans' }] };
    const household = { prefs: new Map([['rice', 1], ['beans', 0]]) };

    expect(prefMultiplier(recipe, household)).toBe(0);
  });
});

describe('mealLeverageScore', () => {
  const recipe = { ingredients: [{ id: 'rice' }], servings: 4, nutrition: 0.5 };

  test('returns Infinity when the bundle cost is 0 (pantry-covered)', () => {
    const score = mealLeverageScore({ recipe, cost: 0, pantryMap: new Map(), household: {} });
    expect(score).toBe(Infinity);
  });

  test('returns 0 when the household hard-skips an ingredient', () => {
    const household = { prefs: new Map([['rice', 0]]) };
    const score = mealLeverageScore({ recipe, cost: 5, pantryMap: new Map(), household });
    expect(score).toBe(0);
  });

  test('computes servings * nutrition^weight * depletion * pref / cost', () => {
    // 4 * 0.5^2 * 1 (depletion) * 1 (pref) / 2 = 4 * 0.25 / 2 = 0.5
    const score = mealLeverageScore({ recipe, cost: 2, pantryMap: new Map(), household: {}, nutritionWeight: 2 });
    expect(score).toBeCloseTo(0.5, 5);
  });
});

describe('planBuyList', () => {
  test('greedy recompute: buying shared rice for one recipe makes the next cheaper', async () => {
    const riceAndBeans = {
      id: 'rice-beans', name: 'Rice & Beans', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'beans', amount: 2, unit: 'oz' }],
    };
    const cheesyRice = {
      id: 'cheesy-rice', name: 'Cheesy Rice', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'cheese', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 2, cheese: 3 });

    const result = await planBuyList({
      recipes: [riceAndBeans, cheesyRice],
      pantry: [],
      household: { size: 4, dinnersNeeded: 2 },
      budget: 100,
      storeId: 'test-store',
      priceBasket,
    });

    // Cheesy Rice (4*1 + 1*3 = 7) edges out Rice & Beans (4*1 + 2*2 = 8) first.
    expect(result.plan.map(p => p.recipe.id)).toEqual(['cheesy-rice', 'rice-beans']);
    expect(result.plan[0].cost).toBe(7);
    // Rice & Beans now only pays for beans -- rice is already owned from the first buy.
    expect(result.plan[1].cost).toBe(4);
    expect(result.spent).toBe(11);
    expect(result.stretched).toBe(true);
    expect(result.gapServings).toBe(0);
  });

  test('pantry-covered (free) recipes are always cooked first', async () => {
    const free = {
      id: 'free', name: 'Free Meal', servings: 4, nutrition: 0.1,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const costly = {
      id: 'costly', name: 'Costly Meal', servings: 4, nutrition: 0.9,
      ingredients: [{ id: 'beans', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ beans: 1 });

    const result = await planBuyList({
      recipes: [costly, free],
      pantry: [{ id: 'rice', remaining: 10 }],
      household: { size: 4, dinnersNeeded: 2 },
      budget: 100,
      storeId: 'test-store',
      priceBasket,
    });

    expect(result.plan[0].recipe.id).toBe('free');
    expect(result.plan[0].fromPantry).toBe(true);
    expect(result.plan[0].cost).toBe(0);
  });

  test('a hard-disliked ingredient excludes its recipe entirely', async () => {
    const disliked = {
      id: 'disliked', name: 'Disliked', servings: 4, nutrition: 0.9,
      ingredients: [{ id: 'beans', amount: 1, unit: 'oz' }],
    };
    const ok = {
      id: 'ok', name: 'OK', servings: 4, nutrition: 0.5,
      ingredients: [{ id: 'rice', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ beans: 1, rice: 1 });

    const result = await planBuyList({
      recipes: [disliked, ok],
      pantry: [],
      household: { size: 4, dinnersNeeded: 1, prefs: new Map([['beans', 0]]) },
      budget: 100,
      storeId: 'test-store',
      priceBasket,
    });

    expect(result.plan.map(p => p.recipe.id)).toEqual(['ok']);
  });

  test('stops and reports a gap when nothing affordable adds a meal', async () => {
    const pricey = {
      id: 'pricey', name: 'Pricey', servings: 4, nutrition: 0.9,
      ingredients: [{ id: 'truffle', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ truffle: 1000 });

    const result = await planBuyList({
      recipes: [pricey],
      pantry: [],
      household: { size: 4, dinnersNeeded: 1 },
      budget: 10,
      storeId: 'test-store',
      priceBasket,
    });

    expect(result.plan).toEqual([]);
    expect(result.stretched).toBe(false);
    expect(result.gapServings).toBe(4);
    expect(result.budgetLeft).toBe(10);
  });
});

describe('findBridgeBuy', () => {
  test('returns null when the base plan has no gap', async () => {
    const base = { gapServings: 0 };
    const bridge = await findBridgeBuy({
      recipes: [], household: {}, storeId: 'test-store', priceBasket: async () => ({ total: 0, items: [] }), base,
    });
    expect(bridge).toBeNull();
  });

  test('ignores the budget and keeps going until the gap closes', async () => {
    const expensive = {
      id: 'expensive', name: 'Expensive Extra', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'steak', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ steak: 50 });
    const base = { gapServings: 4, owned: new Map(), usedRecipeIds: new Set(), pantryMap: new Map() };

    const bridge = await findBridgeBuy({
      recipes: [expensive],
      household: { size: 4, dinnersNeeded: 1 },
      storeId: 'test-store',
      priceBasket,
      base,
    });

    expect(bridge.closesGap).toBe(true);
    expect(bridge.extraCost).toBe(50);
    expect(bridge.remainingGapServings).toBe(0);
    expect(bridge.additions[0].recipe.id).toBe('expensive');
  });

  test('reports the remaining gap when no candidates can close it', async () => {
    const used = { id: 'used', name: 'Used', servings: 4, nutrition: 0.8, ingredients: [] };
    const base = { gapServings: 4, owned: new Map(), usedRecipeIds: new Set(['used']), pantryMap: new Map() };

    const bridge = await findBridgeBuy({
      recipes: [used],
      household: { size: 4, dinnersNeeded: 1 },
      storeId: 'test-store',
      priceBasket: async () => ({ total: 0, items: [] }),
      base,
    });

    expect(bridge.closesGap).toBe(false);
    expect(bridge.remainingGapServings).toBe(4);
    expect(bridge.additions).toEqual([]);
  });
});

describe('evaluateStoreSwitch', () => {
  const recipe = {
    id: 'r1', name: 'R1', servings: 4, nutrition: 0.8,
    ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
  };

  test('returns null when the alt store does not stretch either', async () => {
    const priceBasket = makePriceBasket({ rice: 100 });

    const result = await evaluateStoreSwitch({
      recipes: [recipe], pantry: [], household: { size: 4, dinnersNeeded: 1 }, budget: 10,
      store: { id: 'alt', name: 'Alt Store' }, priceBasket,
    });

    expect(result).toBeNull();
  });

  test('returns net savings when the alt store stretches within budget', async () => {
    const priceBasket = makePriceBasket({ rice: 1 }, { alt: 1 });

    const result = await evaluateStoreSwitch({
      recipes: [recipe], pantry: [], household: { size: 4, dinnersNeeded: 1 }, budget: 10,
      store: { id: 'alt', name: 'Alt Store' }, priceBasket, tripCost: 3,
    });

    expect(result.storeId).toBe('alt');
    expect(result.storeName).toBe('Alt Store');
    expect(result.spent).toBe(4);
    expect(result.tripCost).toBe(3);
    expect(result.net).toBe(3);
  });
});

describe('buildVerdict', () => {
  test('stretches verdict reports buy list, plan, and coversDays', () => {
    const cart = new Map([['rice', { amount: 8, unit: 'oz', price: 8 }]]);
    const base = {
      plan: [
        { recipe: { id: 'r1', name: 'Recipe One', servings: 4 }, cost: 8, missing: [{ id: 'rice', amount: 8, unit: 'oz' }], fromPantry: false },
      ],
      cart,
      spent: 8,
      stretched: true,
      gapServings: 0,
    };
    const ingredientCatalog = new Map([['rice', { name: 'Rice' }]]);

    const verdict = buildVerdict({
      base, household: { size: 4, dinnersNeeded: 1 }, budget: 20, storeName: 'ShopRite', ingredientCatalog, gap: null,
    });

    expect(verdict.verdict).toBe('stretches');
    expect(verdict.unlocks).toBe(4);
    expect(verdict.coversDays).toBe(1);
    expect(verdict.store).toBe('ShopRite');
    expect(verdict.buy).toEqual([{ name: 'Rice', qty: '8 oz', price: 8 }]);
    expect(verdict.plan[0]).toEqual({ name: 'Recipe One', servings: 4, source: 'buy', missing: ['Rice'], pinned: false });
    expect(verdict.headline).toBe("You're $8.00 away from 4 meals.");
    expect(verdict.gap).toBeNull();
  });

  test('gap verdict reports a Gap Report with bridge, store switch, and referral', () => {
    const base = { plan: [], cart: new Map(), spent: 0, stretched: false, gapServings: 4 };
    const gap = {
      bridge: { extraCost: 12, additions: [{ recipe: { id: 'b', name: 'Bridge Recipe', servings: 4 } }], closesGap: true },
      storeSwitch: null,
      bridgeRequest: null,
      referral: null,
    };

    const verdict = buildVerdict({
      base, household: { size: 4, dinnersNeeded: 1 }, budget: 20, storeName: 'ShopRite', ingredientCatalog: new Map(), gap,
    });

    expect(verdict.verdict).toBe('gap');
    expect(verdict.gap.neededServings).toBe(4);
    expect(verdict.gap.coveredServings).toBe(0);
    expect(verdict.gap.shortfallServings).toBe(4);
    expect(verdict.gap.additionalCost).toBe(12);
    expect(verdict.gap.bridge).toEqual({ extraCost: 12, unlocks: 4, closesGap: true, recipes: ['Bridge Recipe'] });
    expect(verdict.gap.bridgeRequest).toBeNull();
    expect(verdict.gap.referral).toBeNull();
  });
});

describe('runMealLeverageEngine', () => {
  const ingredientCatalog = new Map([
    ['rice', { name: 'Rice' }],
    ['beans', { name: 'Black Beans' }],
    ['cheese', { name: 'Cheddar Cheese' }],
  ]);

  test('produces a stretches verdict with leverage-driven plan ordering', async () => {
    const riceAndBeans = {
      id: 'rice-beans', name: 'Rice & Beans', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'beans', amount: 2, unit: 'oz' }],
    };
    const cheesyRice = {
      id: 'cheesy-rice', name: 'Cheesy Rice', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'cheese', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 2, cheese: 3 });

    const result = await runMealLeverageEngine({
      recipes: [riceAndBeans, cheesyRice],
      pantry: [],
      household: { size: 4, dinnersNeeded: 2 },
      priceBasket,
      ingredientCatalog,
      store: { id: 'test-store', name: 'Test Store' },
      budget: 100,
    });

    expect(result.verdict).toBe('stretches');
    expect(result.spent).toBe(11);
    expect(result.unlocks).toBe(8);
    expect(result.coversDays).toBe(2);
    expect(result.plan.map(p => p.name)).toEqual(['Cheesy Rice', 'Rice & Beans']);
    expect(result.gap).toBeNull();
  });

  test('builds a Seed & Spoon referral when the gap cannot be closed', async () => {
    const onlyRecipe = {
      id: 'r1', name: 'Only Recipe', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1 });

    const result = await runMealLeverageEngine({
      recipes: [onlyRecipe],
      pantry: [],
      household: { size: 4, dinnersNeeded: 2 }, // needs 8 servings; only one 4-serving recipe exists
      priceBasket,
      ingredientCatalog,
      store: { id: 'test-store', name: 'Test Store' },
      budget: 100,
    });

    expect(result.verdict).toBe('gap');
    expect(result.gap.neededServings).toBe(8);
    expect(result.gap.coveredServings).toBe(4);
    expect(result.gap.shortfallServings).toBe(4);
    expect(result.gap.additionalCost).toBe(0);
    expect(result.gap.bridge.closesGap).toBe(false);
    expect(result.gap.storeSwitch).toBeNull();
    expect(result.gap.bridgeRequest).toBeNull();
    expect(result.gap.referral.type).toBe('seed_and_spoon_referral');
    expect(result.gap.referral.ctaUrl).toBe('/get-help');
  });

  test('finds a cheaper alt store that stretches the budget', async () => {
    const recipeA = {
      id: 'a', name: 'Recipe A', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const recipeB = {
      id: 'b', name: 'Recipe B', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'beans', amount: 4, unit: 'oz' }],
    };
    // At the primary store, beans are too expensive to afford Recipe B.
    const priceBasket = makePriceBasket({ rice: 1, beans: 5 }, { 'alt-store': 0.2 });

    const result = await runMealLeverageEngine({
      recipes: [recipeA, recipeB],
      pantry: [],
      household: { size: 4, dinnersNeeded: 2 },
      priceBasket,
      ingredientCatalog,
      store: { id: 'primary', name: 'Primary Store' },
      altStores: [{ id: 'alt-store', name: 'Alt Store', tripCost: 2 }],
      budget: 10,
    });

    expect(result.verdict).toBe('gap');
    expect(result.gap.storeSwitch.storeId).toBe('alt-store');
    expect(result.gap.storeSwitch.net).toBeGreaterThan(0);
  });

  test('SNAP variant uses the SNAP balance as budget and excludes SNAP-ineligible recipes', async () => {
    const eligible = {
      id: 'e', name: 'Eligible Recipe', servings: 4, nutrition: 0.5, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const hotBar = {
      id: 'i', name: 'Hot Bar Special', servings: 4, nutrition: 0.9, snapEligible: false,
      ingredients: [{ id: 'beans', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 1 });

    const result = await runMealLeverageEngine({
      recipes: [eligible, hotBar],
      pantry: [],
      household: { size: 2, dinnersNeeded: 1 },
      priceBasket,
      ingredientCatalog,
      store: { id: 'test-store', name: 'Test Store' },
      snap: { balance: 20, daysUntilReload: 5 },
    });

    expect(result.plan.map(p => p.name)).toEqual(['Eligible Recipe']);
    expect(result.spent).toBeLessThanOrEqual(20);
  });

  test('excludes recipes below NOURISHMENT_FLOOR from the candidate pool entirely', async () => {
    const junk = {
      id: 'junk', name: 'Buttered Noodles', servings: 4, nutrition: NOURISHMENT_FLOOR - 0.01, snapEligible: true,
      ingredients: [{ id: 'noodles', amount: 1, unit: 'oz' }],
    };
    const healthy = {
      id: 'healthy', name: 'Healthy Bowl', servings: 4, nutrition: 0.6, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ noodles: 0.01, rice: 1 });

    const result = await runMealLeverageEngine({
      recipes: [junk, healthy],
      pantry: [],
      household: { size: 4, dinnersNeeded: 1 },
      priceBasket,
      ingredientCatalog: new Map([...ingredientCatalog, ['noodles', { name: 'Noodles' }]]),
      store: { id: 'test-store', name: 'Test Store' },
      budget: 10,
    });

    expect(result.plan.map(p => p.name)).toEqual(['Healthy Bowl']);
  });

  test('mints a bridge_request when the unclosed gap is within DONATION_THRESHOLD', async () => {
    const recipeA = {
      id: 'a', name: 'Recipe A', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const recipeB = {
      id: 'b', name: 'Recipe B', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'beans', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 2 });

    const result = await runMealLeverageEngine({
      recipes: [recipeA, recipeB],
      pantry: [],
      household: { size: 4, dinnersNeeded: 3 }, // needs 12 servings
      priceBasket,
      ingredientCatalog,
      store: { id: 'test-store', name: 'Test Store' },
      budget: 4, // only covers Recipe A
      householdId: 'house-1',
    });

    expect(result.verdict).toBe('gap');
    expect(result.gap.neededServings).toBe(12);
    expect(result.gap.coveredServings).toBe(4);
    expect(result.gap.shortfallServings).toBe(8);
    expect(result.gap.additionalCost).toBe(8);
    expect(result.gap.bridge.closesGap).toBe(false);
    expect(result.gap.referral).toBeNull();
    expect(result.gap.bridgeRequest).toEqual({
      type: 'bridge_request',
      household_id: 'house-1',
      gapCost: 8,
      shortfallServings: 4,
      blurb: "This household is $8.00 away from a full week of meals -- 4 meals short.",
      donation: { amount: 800, currency: 'usd', interval: 'one_time' },
    });
  });

  test('recipe-in: pre-seeds the imported recipe and reports what cooking it unlocks', async () => {
    const imported = {
      id: 'imported', name: 'Imported Skillet', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'beans', amount: 2, unit: 'oz' }],
    };
    const riceBowl = {
      id: 'rice-bowl', name: 'Rice Bowl', servings: 4, nutrition: 0.8, snapEligible: true,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 2 });

    const result = await runMealLeverageEngine({
      recipes: [riceBowl],
      pantry: [],
      household: { size: 4, dinnersNeeded: 2 }, // needs 8 servings
      priceBasket,
      ingredientCatalog,
      store: { id: 'test-store', name: 'Test Store' },
      recipeIn: imported,
      householdId: 'house-1',
    });

    expect(result.plan[0]).toMatchObject({ name: 'Imported Skillet', servings: 4, source: 'buy', pinned: true });
    expect(result.plan[1]).toMatchObject({ name: 'Rice Bowl', servings: 4, source: 'pantry', pinned: false });
    expect(result.recipeIn).toEqual({
      name: 'Imported Skillet',
      have: [],
      need: [{ name: 'Rice', qty: '4 oz' }, { name: 'Black Beans', qty: '2 oz' }],
      cost: 8,
      missing: ['Rice', 'Black Beans'],
      unlocks: ['Rice Bowl'],
      unlocksServings: 4,
    });
    expect(result.gap).toBeNull();
  });
});

describe('passesNourishmentFloor', () => {
  test('passes recipes at or above NOURISHMENT_FLOOR', () => {
    expect(passesNourishmentFloor({ nutrition: NOURISHMENT_FLOOR })).toBe(true);
    expect(passesNourishmentFloor({ nutrition: 0.9 })).toBe(true);
  });

  test('rejects recipes below NOURISHMENT_FLOOR, including those missing a nutrition field', () => {
    expect(passesNourishmentFloor({ nutrition: NOURISHMENT_FLOOR - 0.01 })).toBe(false);
    expect(passesNourishmentFloor({})).toBe(false);
  });
});

describe('scoreCoveragePlan', () => {
  test('rewards coverage, nutrition, overlap, and preference; penalizes single-use spend', async () => {
    const riceAndBeans = {
      id: 'rice-beans', name: 'Rice & Beans', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'beans', amount: 2, unit: 'oz' }],
    };
    const cheesyRice = {
      id: 'cheesy-rice', name: 'Cheesy Rice', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }, { id: 'cheese', amount: 1, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, beans: 2, cheese: 3 });
    const household = { size: 4, dinnersNeeded: 2 }; // needs 8 servings

    const base = await planBuyList({
      recipes: [riceAndBeans, cheesyRice],
      pantry: [],
      household,
      budget: 100,
      storeId: 'test-store',
      priceBasket,
    });

    const score = scoreCoveragePlan({ base, household });

    expect(score.coverageScore).toBe(1); // 8 servings produced / 8 needed
    expect(score.nutritionScore).toBeCloseTo(0.8, 5);
    // rice is used by both recipes -- 2 of 4 total ingredient-uses are shared
    expect(score.overlapScore).toBeCloseTo(0.5, 5);
    expect(score.preferenceScore).toBe(1);
    // beans ($4) and cheese ($3) are each used by only one recipe -> 7 of 11 $ wasted
    expect(score.wastePenalty).toBeCloseTo(7 / 11, 5);
    expect(score.planScore).toBeCloseTo(0.61, 5);
  });

  test('returns zeroed scores for an empty plan', () => {
    const base = { plan: [], cart: new Map() };
    const score = scoreCoveragePlan({ base, household: { size: 4, dinnersNeeded: 2 } });

    expect(score).toEqual({
      coverageScore: 0, nutritionScore: 0, overlapScore: 0, preferenceScore: 0, wastePenalty: 0, planScore: 0,
    });
  });
});

describe('buildCoveragePlans / selectBestCoveragePlan', () => {
  test('builds deduped candidates across seeds and picks the highest planScore', async () => {
    const highNutrition = {
      id: 'high', name: 'High Nutrition', servings: 4, nutrition: 0.9,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const lowNutrition = {
      id: 'low', name: 'Low Nutrition', servings: 4, nutrition: 0.5,
      ingredients: [{ id: 'junk', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1, junk: 1 });
    const household = { size: 4, dinnersNeeded: 1 }; // needs 4 servings, budget covers only one recipe

    const candidates = await buildCoveragePlans({
      recipes: [highNutrition, lowNutrition],
      pantry: [],
      household,
      budget: 4,
      storeId: 'test-store',
      priceBasket,
    });

    // 3 seeds (null + 2 anchors), but seed=null and seed=highNutrition produce
    // the same plan -- only 2 distinct candidates survive dedup.
    expect(candidates.length).toBe(2);

    const best = selectBestCoveragePlan(candidates);
    expect(best.base.plan.map(p => p.recipe.id)).toEqual(['high']);
  });

  test('pinnedRecipe collapses the beam to a single candidate', async () => {
    const recipe = {
      id: 'r1', name: 'Recipe', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ rice: 1 });

    const candidates = await buildCoveragePlans({
      recipes: [recipe],
      pantry: [],
      household: { size: 4, dinnersNeeded: 1 },
      budget: 10,
      storeId: 'test-store',
      priceBasket,
      pinnedRecipe: recipe,
    });

    expect(candidates.length).toBe(1);
    expect(candidates[0].base.plan[0].pinned).toBe(true);
  });
});

describe('planBuyList with pinnedRecipe', () => {
  test('commits the pinned recipe first, even over budget, and still picks free recipes after', async () => {
    const pricey = {
      id: 'pricey', name: 'Pricey Pinned', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'steak', amount: 1, unit: 'oz' }],
    };
    const free = {
      id: 'free', name: 'Free Meal', servings: 4, nutrition: 0.5,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };
    const priceBasket = makePriceBasket({ steak: 50 });

    const result = await planBuyList({
      recipes: [free],
      pantry: [{ id: 'rice', remaining: 10 }],
      household: { size: 4, dinnersNeeded: 2 }, // needs 8 servings
      budget: 10,
      storeId: 'test-store',
      priceBasket,
      pinnedRecipe: pricey,
    });

    expect(result.plan[0]).toMatchObject({ cost: 50, pinned: true });
    expect(result.budgetLeft).toBe(10 - 50);
    // Free, pantry-covered recipe still gets picked despite negative budgetLeft.
    expect(result.plan[1]).toMatchObject({ recipe: free, cost: 0, fromPantry: true });
    expect(result.stretched).toBe(true); // pinned (4) + free (4) = 8 servings needed
  });

  test('a pinned recipe fully covered by pantry is free and still subtracts its servings', async () => {
    const recipe = {
      id: 'r1', name: 'Recipe', servings: 4, nutrition: 0.8,
      ingredients: [{ id: 'rice', amount: 4, unit: 'oz' }],
    };

    const result = await planBuyList({
      recipes: [],
      pantry: [{ id: 'rice', remaining: 10 }],
      household: { size: 4, dinnersNeeded: 1 },
      budget: 10,
      storeId: 'test-store',
      priceBasket: async () => ({ total: 0, items: [] }),
      pinnedRecipe: recipe,
    });

    expect(result.plan).toEqual([{ recipe, cost: 0, missing: [], fromPantry: true, pinned: true }]);
    expect(result.budgetLeft).toBe(10);
    expect(result.stretched).toBe(true);
    expect(result.gapServings).toBe(0);
  });
});

describe('buildBridgeRequest', () => {
  test('shapes a donation request matching donationCheckoutSchema', () => {
    const req = buildBridgeRequest({ householdId: 'house-1', gapCost: 8.5, shortfallServings: 2 });

    expect(req.type).toBe('bridge_request');
    expect(req.household_id).toBe('house-1');
    expect(req.gapCost).toBe(8.5);
    expect(req.shortfallServings).toBe(2);
    expect(req.blurb).toBe('This household is $8.50 away from a full week of meals -- 2 meals short.');
    expect(req.donation).toEqual({ amount: 850, currency: 'usd', interval: 'one_time' });
  });

  test('enforces the $1.00 donationCheckoutSchema minimum even for sub-dollar gaps', () => {
    const req = buildBridgeRequest({ householdId: 'house-1', gapCost: 0.5, shortfallServings: 1 });
    expect(req.donation.amount).toBe(100);
  });
});

describe('buildRecipeInResult', () => {
  test('returns null when no recipe is pinned', () => {
    const base = { plan: [{ recipe: { id: 'r', name: 'R', servings: 4, ingredients: [] }, cost: 4, missing: [], fromPantry: false }] };
    expect(buildRecipeInResult({ base, ingredientCatalog: new Map() })).toBeNull();
  });
});
