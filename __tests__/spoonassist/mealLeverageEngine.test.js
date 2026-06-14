import { expect, test, describe } from 'bun:test';
import {
  shortfall,
  depletionBonus,
  prefMultiplier,
  mealLeverageScore,
  planBuyList,
  findBridgeBuy,
  evaluateStoreSwitch,
  buildVerdict,
  runMealLeverageEngine,
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
    expect(verdict.plan[0]).toEqual({ name: 'Recipe One', servings: 4, source: 'buy', missing: ['Rice'] });
    expect(verdict.headline).toBe("You're $8.00 away from 4 meals.");
    expect(verdict.gap).toBeNull();
  });

  test('gap verdict reports bridge, store switch, and referral', () => {
    const base = { plan: [], cart: new Map(), spent: 0, stretched: false, gapServings: 4 };
    const gap = {
      bridge: { extraCost: 12, additions: [{ recipe: { id: 'b', name: 'Bridge Recipe', servings: 4 } }], closesGap: true },
      storeSwitch: null,
      referral: null,
    };

    const verdict = buildVerdict({
      base, household: { size: 4, dinnersNeeded: 1 }, budget: 20, storeName: 'ShopRite', ingredientCatalog: new Map(), gap,
    });

    expect(verdict.verdict).toBe('gap');
    expect(verdict.gap.servings).toBe(4);
    expect(verdict.gap.bridge).toEqual({ extraCost: 12, unlocks: 4, closesGap: true, recipes: ['Bridge Recipe'] });
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
    expect(result.gap.servings).toBe(4);
    expect(result.gap.bridge.closesGap).toBe(false);
    expect(result.gap.storeSwitch).toBeNull();
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
});
