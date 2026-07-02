import { expect, test, describe } from 'bun:test';
import { consolidateIngredients, groupByCategory, deriveIngredientKey, toPlanIngredients, itemRowKey } from '@/lib/spoonassist/consolidateList';

describe('itemRowKey', () => {
  test('combines key and unit', () => {
    expect(itemRowKey({ key: 'onion', unit: 'each' })).toBe('onion::each');
  });

  test('distinguishes the same key with different units', () => {
    expect(itemRowKey({ key: 'flour', unit: 'cup' })).not.toBe(itemRowKey({ key: 'flour', unit: 'lb' }));
  });

  test('handles a null unit', () => {
    expect(itemRowKey({ key: 'salt', unit: null })).toBe('salt::');
  });
});

describe('deriveIngredientKey', () => {
  test('prefers canonical_id when present', () => {
    expect(deriveIngredientKey('onion', 'yellow onion')).toBe('onion');
  });

  test('falls back to a normalized name', () => {
    expect(deriveIngredientKey(null, '  Orange Zest  ')).toBe('orange zest');
  });

  test('collapses internal whitespace', () => {
    expect(deriveIngredientKey(undefined, 'fresh   sage leaves')).toBe('fresh sage leaves');
  });

  test('empty/missing name -> empty string key', () => {
    expect(deriveIngredientKey(null, null)).toBe('');
  });
});

describe('consolidateIngredients', () => {
  test('sums quantities for the same key + unit across recipes', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: 'onion', name: 'onion', quantity: 1, unit: 'each' }] },
      { recipeId: 'r2', ingredients: [{ key: 'onion', name: 'onion', quantity: 2, unit: 'each' }] },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ key: 'onion', quantity: 3, unit: 'each', ambiguousUnit: false });
    expect(items[0].sourceRecipeIds.sort()).toEqual(['r1', 'r2']);
  });

  test('keeps separate line items for the same key with different units, and flags them', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: 'flour', name: 'flour', quantity: 2, unit: 'cup' }] },
      { recipeId: 'r2', ingredients: [{ key: 'flour', name: 'flour', quantity: 1, unit: 'lb' }] },
    ]);

    expect(items).toHaveLength(2);
    expect(items.every((i) => i.ambiguousUnit)).toBe(true);
    const units = items.map((i) => i.unit).sort();
    expect(units).toEqual(['cup', 'lb']);
  });

  test('does not flag a key that only ever appears with one unit', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: 'rice', name: 'rice', quantity: 1, unit: 'cup' }] },
      { recipeId: 'r2', ingredients: [{ key: 'garlic', name: 'garlic', quantity: 2, unit: 'clove' }] },
    ]);
    expect(items.every((i) => i.ambiguousUnit === false)).toBe(true);
  });

  test('different recipes contributing the same ingredient twice tracks both source recipes', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: 'garlic', name: 'garlic', quantity: 1, unit: 'clove' }] },
      { recipeId: 'r2', ingredients: [{ key: 'garlic', name: 'garlic', quantity: 3, unit: 'clove' }] },
      { recipeId: 'r3', ingredients: [{ key: 'garlic', name: 'garlic', quantity: 1, unit: 'clove' }] },
    ]);
    expect(items[0].quantity).toBe(5);
    expect(items[0].sourceRecipeIds).toHaveLength(3);
  });

  test('a null quantity (unparsable amount) does not poison a real sum', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: 'salt', name: 'salt to taste', quantity: null, unit: null }] },
      { recipeId: 'r2', ingredients: [{ key: 'salt', name: 'salt', quantity: 1, unit: 'tsp' }] },
    ]);
    // Different units (null vs 'tsp') by design keeps these as separate rows.
    expect(items).toHaveLength(2);
    expect(items.find((i) => i.unit === null).quantity).toBeNull();
    expect(items.find((i) => i.unit === 'tsp').quantity).toBe(1);
  });

  test('ignores entries with no key', () => {
    const { items } = consolidateIngredients([
      { recipeId: 'r1', ingredients: [{ key: null, name: 'mystery item', quantity: 1, unit: 'each' }] },
    ]);
    expect(items).toHaveLength(0);
  });

  test('empty plan -> empty list', () => {
    expect(consolidateIngredients([]).items).toHaveLength(0);
    expect(consolidateIngredients(undefined).items).toHaveLength(0);
  });
});

describe('toPlanIngredients', () => {
  test('shapes DB rows into PlanProvider ingredient objects', () => {
    const shaped = toPlanIngredients([
      { canonical_id: 'onion', ingredient_name: 'onion', raw_text: '1 onion, diced', quantity: 1, unit: 'each', category: 'Produce' },
      { canonical_id: null, ingredient_name: null, raw_text: 'orange zest', quantity: 1, unit: 'each', category: null },
    ]);

    expect(shaped).toEqual([
      { key: 'onion', name: 'onion', quantity: 1, unit: 'each', canonicalId: 'onion', category: 'Produce' },
      { key: 'orange zest', name: 'orange zest', quantity: 1, unit: 'each', canonicalId: null, category: null },
    ]);
  });

  test('handles missing/undefined input', () => {
    expect(toPlanIngredients(undefined)).toEqual([]);
    expect(toPlanIngredients(null)).toEqual([]);
  });
});

describe('groupByCategory', () => {
  test('groups items by category', () => {
    const groups = groupByCategory([
      { key: 'onion', category: 'Produce' },
      { key: 'milk', category: 'Dairy' },
      { key: 'garlic', category: 'Produce' },
    ]);
    expect(groups).toHaveLength(2);
    const produce = groups.find((g) => g.category === 'Produce');
    expect(produce.items.map((i) => i.key).sort()).toEqual(['garlic', 'onion']);
  });

  test('items with no category fall into "Other", sorted last', () => {
    const groups = groupByCategory([
      { key: 'onion', category: 'Produce' },
      { key: 'mystery', category: null },
    ]);
    expect(groups.map((g) => g.category)).toEqual(['Produce', 'Other']);
  });

  test('categories otherwise sort alphabetically', () => {
    const groups = groupByCategory([
      { key: 'a', category: 'Pantry' },
      { key: 'b', category: 'Dairy' },
      { key: 'c', category: 'Meat' },
    ]);
    expect(groups.map((g) => g.category)).toEqual(['Dairy', 'Meat', 'Pantry']);
  });
});
