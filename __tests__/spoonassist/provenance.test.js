import { expect, test, describe } from 'bun:test';
import {
  drawFromLots,
  attributeMeal,
  rollUpWeeklyShares,
  OWN_RESOURCE_SOURCES,
  DELIVERY_SOURCE,
} from '@/lib/spoonassist/provenance';

describe('drawFromLots', () => {
  test('a single lot covering the need draws exactly that much and leaves no shortfall', () => {
    const lots = [
      { id: 'lot1', ingredientId: 'rice', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 5 },
    ];

    const result = drawFromLots(lots, 'rice', 3);

    expect(result).toEqual({ draws: [{ lotId: 'lot1', source: 'pre_existing', qty: 3 }], shortfall: 0 });
    expect(lots[0].qtyRemaining).toBe(2);
  });

  test('draws FIFO by acquiredAt across lots, source-blind', () => {
    const lots = [
      { id: 'lot1', ingredientId: 'rice', source: 'self_purchase', acquiredAt: '2026-06-10', qtyRemaining: 2 },
      { id: 'lot2', ingredientId: 'rice', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 3 },
    ];

    const result = drawFromLots(lots, 'rice', 4);

    // Oldest lot (lot2, pre_existing) is drawn first despite coming second in
    // the array and despite lot1 being a "newer" source.
    expect(result.draws).toEqual([
      { lotId: 'lot2', source: 'pre_existing', qty: 3 },
      { lotId: 'lot1', source: 'self_purchase', qty: 1 },
    ]);
    expect(result.shortfall).toBe(0);
    expect(lots[1].qtyRemaining).toBe(0);
    expect(lots[0].qtyRemaining).toBe(1);
  });

  test('reports a shortfall when no combination of lots covers the need', () => {
    const lots = [
      { id: 'lot1', ingredientId: 'rice', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 2 },
    ];

    const result = drawFromLots(lots, 'rice', 5);

    expect(result.draws).toEqual([{ lotId: 'lot1', source: 'pre_existing', qty: 2 }]);
    expect(result.shortfall).toBe(3);
    expect(lots[0].qtyRemaining).toBe(0);
  });

  test('skips lots with no quantity remaining', () => {
    const lots = [
      { id: 'lot1', ingredientId: 'rice', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 0 },
      { id: 'lot2', ingredientId: 'rice', source: 'self_purchase', acquiredAt: '2026-06-05', qtyRemaining: 2 },
    ];

    const result = drawFromLots(lots, 'rice', 2);

    expect(result.draws).toEqual([{ lotId: 'lot2', source: 'self_purchase', qty: 2 }]);
    expect(result.shortfall).toBe(0);
    expect(lots[0].qtyRemaining).toBe(0); // untouched
  });

  test('ignores lots for other ingredients', () => {
    const lots = [
      { id: 'lot1', ingredientId: 'beans', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 5 },
      { id: 'lot2', ingredientId: 'rice', source: 'pre_existing', acquiredAt: '2026-06-01', qtyRemaining: 5 },
    ];

    const result = drawFromLots(lots, 'rice', 2);

    expect(result.draws).toEqual([{ lotId: 'lot2', source: 'pre_existing', qty: 2 }]);
    expect(lots[0].qtyRemaining).toBe(5); // beans lot untouched
  });
});

describe('attributeMeal', () => {
  test('a fully pre_existing, priced meal is 100% own-resource', () => {
    const result = attributeMeal({
      items: [{ source: 'pre_existing', value: 6 }],
      servings: 4,
    });

    expect(result).toEqual({ ownShare: 1, deliveredShare: 0, ownServings: 4, deliveredServings: 0 });
  });

  test('splits a mixed-source priced meal by value, including a third category that counts toward neither line', () => {
    const result = attributeMeal({
      items: [
        { source: 'pre_existing', value: 2 },        // own
        { source: 'self_purchase', value: 1 },       // own
        { source: 'five_loaves_delivery', value: 3 }, // delivered
        { source: 'food_pantry', value: 4 },         // neither line
      ],
      servings: 4,
    });

    // own = (2+1)/10 = 0.3, delivered = 3/10 = 0.3 -- the remaining 0.4 (food_pantry)
    // counts toward neither line, by design.
    expect(result.ownShare).toBeCloseTo(0.3, 5);
    expect(result.deliveredShare).toBeCloseTo(0.3, 5);
    expect(result.ownServings).toBeCloseTo(1.2, 5);
    expect(result.deliveredServings).toBeCloseTo(1.2, 5);
  });

  test('falls back to ingredient-slot counting when any item has no resolvable price', () => {
    const result = attributeMeal({
      items: [
        { source: 'pre_existing', value: null },
        { source: 'five_loaves_delivery', value: 5 },
      ],
      servings: 4,
    });

    // 1 own slot / 2 total slots = 0.5, regardless of the $5 on the priced item.
    expect(result.ownShare).toBeCloseTo(0.5, 5);
    expect(result.deliveredShare).toBeCloseTo(0.5, 5);
    expect(result.ownServings).toBe(2);
    expect(result.deliveredServings).toBe(2);
  });

  test('returns all zeros for a meal with no logged consumption', () => {
    const result = attributeMeal({ items: [], servings: 4 });

    expect(result).toEqual({ ownShare: 0, deliveredShare: 0, ownServings: 0, deliveredServings: 0 });
  });
});

describe('rollUpWeeklyShares', () => {
  test('sums per-meal servings into the two weekly trend lines', () => {
    const mealAttributions = [
      { ownServings: 1.2, deliveredServings: 1.2 },
      { ownServings: 4, deliveredServings: 0 },
    ];

    const result = rollUpWeeklyShares(mealAttributions, 8);

    expect(result.ownResourceShare).toBeCloseTo(0.65, 5);
    expect(result.deliveryDependenceShare).toBeCloseTo(0.15, 5);
  });

  test('returns zeros instead of dividing by zero when there are no tracked servings', () => {
    const result = rollUpWeeklyShares([], 0);

    expect(result).toEqual({ ownResourceShare: 0, deliveryDependenceShare: 0 });
  });
});

describe('source category constants', () => {
  test('OWN_RESOURCE_SOURCES and DELIVERY_SOURCE are disjoint', () => {
    expect(OWN_RESOURCE_SOURCES.has(DELIVERY_SOURCE)).toBe(false);
    expect(OWN_RESOURCE_SOURCES.has('pre_existing')).toBe(true);
    expect(OWN_RESOURCE_SOURCES.has('self_purchase')).toBe(true);
    expect(OWN_RESOURCE_SOURCES.has('regenerative')).toBe(true);
    expect(OWN_RESOURCE_SOURCES.has('food_pantry')).toBe(false);
  });
});
