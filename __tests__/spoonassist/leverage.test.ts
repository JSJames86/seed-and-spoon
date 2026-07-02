import { expect, test, describe } from 'bun:test';
import {
  overlapCount,
  newItemsCount,
  recipeLeverage,
  planLeverage,
  planIngredientUnion,
  rankByLeverage,
  type LeverageRecipe,
} from '@/lib/spoonassist/leverage';

const recipe = (id: string, servings: number, ingredientKeys: string[]): LeverageRecipe => ({
  id,
  servings,
  ingredientKeys,
});

describe('planIngredientUnion', () => {
  test('unions ingredient keys across recipes, deduped', () => {
    const union = planIngredientUnion([
      recipe('a', 4, ['onion', 'rice']),
      recipe('b', 2, ['rice', 'garlic']),
    ]);
    expect([...union].sort()).toEqual(['garlic', 'onion', 'rice']);
  });

  test('empty plan -> empty union', () => {
    expect(planIngredientUnion([]).size).toBe(0);
  });
});

describe('overlapCount / newItemsCount', () => {
  test('no overlap against an empty plan', () => {
    const r = recipe('a', 4, ['onion', 'rice', 'garlic']);
    expect(overlapCount(r, [])).toBe(0);
    expect(newItemsCount(r, [])).toBe(3);
  });

  test('partial overlap', () => {
    const r = recipe('a', 4, ['onion', 'rice', 'garlic']);
    const plan = new Set(['onion', 'black-beans']);
    expect(overlapCount(r, plan)).toBe(1);
    expect(newItemsCount(r, plan)).toBe(2);
  });

  test('full overlap -- every ingredient already in the plan', () => {
    const r = recipe('a', 4, ['onion', 'rice']);
    const plan = new Set(['onion', 'rice', 'garlic']);
    expect(overlapCount(r, plan)).toBe(2);
    expect(newItemsCount(r, plan)).toBe(0);
  });

  test('duplicate ingredient keys within a recipe are deduped', () => {
    const r = recipe('a', 4, ['onion', 'onion', 'rice']);
    expect(overlapCount(r, [])).toBe(0);
    expect(newItemsCount(r, [])).toBe(2);
  });

  test('accepts an array or a Set for planIngredientKeys', () => {
    const r = recipe('a', 4, ['onion', 'rice']);
    expect(overlapCount(r, ['onion'])).toBe(overlapCount(r, new Set(['onion'])));
  });
});

describe('recipeLeverage', () => {
  test('servings / max(newItems, 1), against an empty plan', () => {
    // 4 servings, 4 brand-new ingredients -> 4/4 = 1.0
    const r = recipe('a', 4, ['a', 'b', 'c', 'd']);
    expect(recipeLeverage(r, [])).toBe(1);
  });

  test('higher overlap raises leverage for the same recipe', () => {
    const r = recipe('a', 4, ['onion', 'rice', 'garlic', 'chicken']);
    const noOverlap = recipeLeverage(r, []);
    const someOverlap = recipeLeverage(r, ['onion', 'rice']);
    const fullOverlap = recipeLeverage(r, ['onion', 'rice', 'garlic', 'chicken']);
    expect(someOverlap).toBeGreaterThan(noOverlap);
    expect(fullOverlap).toBeGreaterThan(someOverlap);
  });

  test('fully covered by the plan -> newItems=0 -> divides by 1, not 0', () => {
    const r = recipe('a', 6, ['onion', 'rice']);
    // max(newItems, 1) = max(0, 1) = 1 -> 6/1 = 6
    expect(recipeLeverage(r, ['onion', 'rice'])).toBe(6);
  });

  test('a recipe with no ingredients never divides by zero', () => {
    const r = recipe('a', 4, []);
    expect(recipeLeverage(r, [])).toBe(4);
  });

  test('normalizes/clamps to a 0-10 display range', () => {
    // 40 servings, 1 new item -> raw 40, clamped to the 10 ceiling.
    const r = recipe('a', 40, ['onion']);
    expect(recipeLeverage(r, [])).toBe(10);
  });

  test('rounds to one decimal', () => {
    // 5 servings / 3 new items = 1.666... -> 1.7
    const r = recipe('a', 5, ['a', 'b', 'c']);
    expect(recipeLeverage(r, [])).toBe(1.7);
  });

  test('defaults planIngredientKeys to empty when omitted', () => {
    const r = recipe('a', 4, ['a', 'b', 'c', 'd']);
    expect(recipeLeverage(r)).toBe(1);
  });
});

describe('planLeverage', () => {
  test('total planned servings / unique shopping-list items', () => {
    // "14 meals from 22 items" example from the spec, roughly
    expect(planLeverage(14, 22)).toBe(0.6);
  });

  test('zero unique items -> 0, not NaN/Infinity', () => {
    expect(planLeverage(0, 0)).toBe(0);
    expect(planLeverage(10, 0)).toBe(0);
  });

  test('clamps to the 0-10 display ceiling', () => {
    expect(planLeverage(100, 2)).toBe(10);
  });
});

describe('rankByLeverage', () => {
  test('sorts candidates highest-leverage-against-the-plan first', () => {
    const plan = [recipe('in-plan', 4, ['onion', 'rice', 'garlic'])];
    const candidates = [
      recipe('low', 4, ['shrimp', 'saffron', 'fennel', 'anise']), // no overlap, 4 new items
      recipe('high', 4, ['onion', 'rice', 'chicken']), // 2/3 overlap, 1 new item
    ];

    const ranked = rankByLeverage(candidates, plan);
    expect(ranked.map((r) => r.id)).toEqual(['high', 'low']);
    expect(ranked[0].leverage).toBeGreaterThan(ranked[1].leverage);
  });

  test('empty plan ranks purely by servings-per-new-item', () => {
    const candidates = [recipe('a', 2, ['x', 'y']), recipe('b', 8, ['x'])];
    const ranked = rankByLeverage(candidates, []);
    expect(ranked.map((r) => r.id)).toEqual(['b', 'a']);
  });
});
