import { expect, test, describe } from 'bun:test';
import {
  resolveIngredientLine,
  resolveRecipeIngredients,
  buildAliasMap,
  buildConversionMap,
} from '../../lib/spoonassist/ingredientResolver.js';

// ---------------------------------------------------------------------------
// Fixtures mirroring supabase/migrations/20260614000003 (canonical_ingredients)
// and 20260614000004 (ingredient_aliases, ingredient_conversions).
// ---------------------------------------------------------------------------

const CANONICAL_INGREDIENTS = [
  { id: 'rice', name: 'Rice', standard_unit: 'oz' },
  { id: 'pasta', name: 'Pasta', standard_unit: 'oz' },
  { id: 'eggs', name: 'Eggs', standard_unit: 'each' },
  { id: 'chicken-thighs', name: 'Chicken Thighs', standard_unit: 'oz' },
  { id: 'ground-beef', name: 'Ground Beef', standard_unit: 'oz' },
  { id: 'onion', name: 'Onion', standard_unit: 'each' },
  { id: 'garlic', name: 'Garlic', standard_unit: 'each' },
  { id: 'carrots', name: 'Carrots', standard_unit: 'oz' },
  { id: 'potatoes', name: 'Potatoes', standard_unit: 'oz' },
  { id: 'sweet-potatoes', name: 'Sweet Potatoes', standard_unit: 'oz' },
  { id: 'spinach', name: 'Spinach', standard_unit: 'oz' },
  { id: 'bell-peppers', name: 'Bell Peppers', standard_unit: 'each' },
  { id: 'broccoli', name: 'Broccoli', standard_unit: 'each' },
  { id: 'zucchini', name: 'Zucchini', standard_unit: 'oz' },
  { id: 'cheddar-cheese', name: 'Cheddar Cheese', standard_unit: 'oz' },
  { id: 'milk', name: 'Milk', standard_unit: 'oz' },
  { id: 'yogurt', name: 'Yogurt', standard_unit: 'oz' },
  { id: 'oats', name: 'Oats', standard_unit: 'oz' },
  { id: 'bananas', name: 'Bananas', standard_unit: 'each' },
  { id: 'apples', name: 'Apples', standard_unit: 'each' },
  { id: 'frozen-mixed-veg', name: 'Frozen Mixed Vegetables', standard_unit: 'oz' },
  { id: 'chicken-broth', name: 'Chicken Broth', standard_unit: 'oz' },
  { id: 'black-beans', name: 'Black Beans', standard_unit: 'oz' },
  { id: 'tortillas', name: 'Tortillas', standard_unit: 'each' },
  { id: 'canned-tuna', name: 'Canned Tuna', standard_unit: 'oz' },
];

const ALIAS_ROWS = [
  { alias: 'penne', canonical_id: 'pasta' },
  { alias: 'rotini', canonical_id: 'pasta' },
  { alias: 'spaghetti', canonical_id: 'pasta' },
  { alias: 'macaroni', canonical_id: 'pasta' },
  { alias: 'fettuccine', canonical_id: 'pasta' },
  { alias: 'noodle', canonical_id: 'pasta' },
  { alias: 'scallion', canonical_id: 'onion' },
  { alias: 'green onion', canonical_id: 'onion' },
  { alias: 'spring onion', canonical_id: 'onion' },
  { alias: 'shallot', canonical_id: 'onion' },
  { alias: 'garlic clove', canonical_id: 'garlic' },
  { alias: 'frozen vegetable', canonical_id: 'frozen-mixed-veg' },
  { alias: 'frozen veggie', canonical_id: 'frozen-mixed-veg' },
  { alias: 'mixed veggie', canonical_id: 'frozen-mixed-veg' },
];

const WEIGHT_UNITS = [
  { from_unit: 'lb', multiplier: 16, is_estimate: false },
  { from_unit: 'g', multiplier: 0.0353, is_estimate: false },
  { from_unit: 'kg', multiplier: 35.27, is_estimate: false },
  { from_unit: 'cup', multiplier: 8, is_estimate: true },
  { from_unit: 'tbsp', multiplier: 0.5, is_estimate: true },
  { from_unit: 'tsp', multiplier: 0.167, is_estimate: true },
];

const COUNT_UNITS = [
  { from_unit: 'clove', multiplier: 1, is_estimate: true },
  { from_unit: 'slice', multiplier: 1, is_estimate: true },
  { from_unit: 'head', multiplier: 1, is_estimate: true },
  { from_unit: 'bunch', multiplier: 1, is_estimate: true },
];

const CONVERSION_ROWS = CANONICAL_INGREDIENTS.flatMap((ci) => {
  const units = ci.standard_unit === 'oz' ? WEIGHT_UNITS : COUNT_UNITS;
  return units.map((u) => ({
    canonical_id: ci.id,
    from_unit: u.from_unit,
    to_unit: ci.standard_unit,
    multiplier: u.multiplier,
    is_estimate: u.is_estimate,
  }));
});

const ctx = {
  canonicalIngredients: CANONICAL_INGREDIENTS,
  aliasMap: buildAliasMap(ALIAS_ROWS),
  conversions: buildConversionMap(CONVERSION_ROWS),
};

describe('resolveIngredientLine', () => {
  test('resolves a weight-unit line via substring match + lb->oz conversion', () => {
    const result = resolveIngredientLine('1 lb boneless chicken thighs', ctx);
    expect(result).toEqual({
      raw: '1 lb boneless chicken thighs',
      resolved: true,
      canonicalId: 'chicken-thighs',
      name: 'Chicken Thighs',
      amount: 16,
      unit: 'oz',
      isEstimate: false,
    });
  });

  test('resolves "frozen mixed vegetables" via substring match + estimated cup->oz conversion', () => {
    const result = resolveIngredientLine('2 cups frozen mixed vegetables', ctx);
    expect(result).toEqual({
      raw: '2 cups frozen mixed vegetables',
      resolved: true,
      canonicalId: 'frozen-mixed-veg',
      name: 'Frozen Mixed Vegetables',
      amount: 16,
      unit: 'oz',
      isEstimate: true,
    });
  });

  test('resolves "scallions" via the alias table to Onion (each, identity conversion)', () => {
    const result = resolveIngredientLine('2 scallions', ctx);
    expect(result).toEqual({
      raw: '2 scallions',
      resolved: true,
      canonicalId: 'onion',
      name: 'Onion',
      amount: 2,
      unit: 'each',
      isEstimate: false,
    });
  });

  test('resolves "garlic clove" via the alias table to Garlic (identity conversion)', () => {
    const result = resolveIngredientLine('1 garlic clove, minced', ctx);
    expect(result).toEqual({
      raw: '1 garlic clove, minced',
      resolved: true,
      canonicalId: 'garlic',
      name: 'Garlic',
      amount: 1,
      unit: 'each',
      isEstimate: false,
    });
  });

  test('resolves "cloves garlic" via substring match + estimated clove->each conversion', () => {
    const result = resolveIngredientLine('2 cloves garlic, minced', ctx);
    expect(result).toEqual({
      raw: '2 cloves garlic, minced',
      resolved: true,
      canonicalId: 'garlic',
      name: 'Garlic',
      amount: 2,
      unit: 'each',
      isEstimate: true,
    });
  });

  test('returns unresolved/unparsable for header-style lines ending in ":"', () => {
    const result = resolveIngredientLine('Sweet Potato Filling:', ctx);
    expect(result).toEqual({ raw: 'Sweet Potato Filling:', resolved: false, reason: 'unparsable' });
  });

  test('returns unresolved/free_ingredient for "drippings"', () => {
    const result = resolveIngredientLine('2 tbsp drippings', ctx);
    expect(result.resolved).toBe(false);
    expect(result.reason).toBe('free_ingredient');
  });

  test('returns unresolved/no_canonical_match for an ingredient with no canonical mapping', () => {
    const result = resolveIngredientLine('1 lemon', ctx);
    expect(result.resolved).toBe(false);
    expect(result.reason).toBe('no_canonical_match');
    expect(result.normalized).toBe('lemon');
  });

  test('returns unresolved/no_unit_conversion when the canonical is found but the unit has no bridge', () => {
    const result = resolveIngredientLine('1 can black beans', ctx);
    expect(result.resolved).toBe(false);
    expect(result.reason).toBe('no_unit_conversion');
    expect(result.canonicalId).toBe('black-beans');
  });
});

describe('resolveRecipeIngredients', () => {
  test('merges multiple lines resolving to the same canonical ingredient by summing amounts', () => {
    const { ingredients, unresolved } = resolveRecipeIngredients(
      ['1 onion, diced', '2 scallions'],
      ctx
    );

    expect(unresolved).toEqual([]);
    expect(ingredients).toEqual([
      { id: 'onion', name: 'Onion', amount: 3, unit: 'each', isEstimate: false },
    ]);
  });

  test('separates resolved ingredients from unresolved lines', () => {
    const { ingredients, unresolved } = resolveRecipeIngredients(
      ['1 lb boneless chicken thighs', '1 lemon', 'Sweet Potato Filling:'],
      ctx
    );

    expect(ingredients).toEqual([
      { id: 'chicken-thighs', name: 'Chicken Thighs', amount: 16, unit: 'oz', isEstimate: false },
    ]);
    expect(unresolved).toHaveLength(2);
    expect(unresolved.map(u => u.reason)).toEqual(['no_canonical_match', 'unparsable']);
  });
});

describe('buildAliasMap / buildConversionMap', () => {
  test('buildAliasMap maps alias -> canonical_id', () => {
    const map = buildAliasMap(ALIAS_ROWS);
    expect(map.get('scallion')).toBe('onion');
    expect(map.get('garlic clove')).toBe('garlic');
  });

  test('buildConversionMap keys by `${canonicalId}|${fromUnit}`', () => {
    const map = buildConversionMap(CONVERSION_ROWS);
    expect(map.get('chicken-thighs|lb')).toEqual({ to_unit: 'oz', multiplier: 16, is_estimate: false });
    expect(map.get('garlic|clove')).toEqual({ to_unit: 'each', multiplier: 1, is_estimate: true });
  });

  test('both helpers default to empty maps for null/undefined input', () => {
    expect(buildAliasMap(null).size).toBe(0);
    expect(buildConversionMap(undefined).size).toBe(0);
  });
});
