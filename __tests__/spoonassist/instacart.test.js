import { expect, test, describe } from 'bun:test';
import { normalizeUnit, mapHealthFilters, buildAffiliateUrl, buildLineItem } from '@/lib/spoonassist/instacart';

describe('SpoonAssist Instacart helpers', () => {
  describe('normalizeUnit', () => {
    test('maps "t" to teaspoon (not tablespoon)', () => {
      expect(normalizeUnit('t')).toBe('teaspoon');
    });

    test('maps "pinch" to each', () => {
      expect(normalizeUnit('pinch')).toBe('each');
    });

    test('maps tablespoon abbreviations to tablespoon', () => {
      expect(normalizeUnit('tbsp')).toBe('tablespoon');
      expect(normalizeUnit('Tbsp')).toBe('tablespoon');
      expect(normalizeUnit('tablespoons')).toBe('tablespoon');
    });

    test('maps teaspoon abbreviations to teaspoon', () => {
      expect(normalizeUnit('tsp')).toBe('teaspoon');
      expect(normalizeUnit('teaspoons')).toBe('teaspoon');
    });

    test('passes through unrecognized units unchanged', () => {
      expect(normalizeUnit('cup')).toBe('cup');
    });

    test('defaults to each when unit is missing', () => {
      expect(normalizeUnit(undefined)).toBe('each');
      expect(normalizeUnit('')).toBe('each');
    });
  });

  describe('mapHealthFilters', () => {
    test('maps known dietary filters to Instacart health filter codes', () => {
      expect(mapHealthFilters(['gluten-free', 'vegan'])).toEqual(['GLUTEN_FREE', 'VEGAN']);
    });

    test('drops unknown filters and handles non-arrays', () => {
      expect(mapHealthFilters(['gluten-free', 'low-carb'])).toEqual(['GLUTEN_FREE']);
      expect(mapHealthFilters(undefined)).toEqual([]);
    });
  });

  describe('buildAffiliateUrl', () => {
    test('returns the URL unchanged when no partner ID is configured', () => {
      const url = 'https://customers.instacart.com/store/recipes/abc123';
      expect(buildAffiliateUrl(url)).toBe(url);
    });
  });

  describe('buildLineItem', () => {
    test('uses the given measurements key and normalizes the unit', () => {
      const item = buildLineItem({ name: 'eggs', quantity: 12, unit: 'each' }, [], 'measurements');
      expect(item.name).toBe('eggs');
      expect(item.measurements).toEqual([{ quantity: 12, unit: 'each' }]);
      expect(item.filters).toBeUndefined();
    });

    test('attaches health filters when provided', () => {
      const item = buildLineItem({ name: 'flour', quantity: 1, unit: 't' }, ['GLUTEN_FREE'], 'line_item_measurements');
      expect(item.line_item_measurements).toEqual([{ quantity: 1, unit: 'teaspoon' }]);
      expect(item.filters).toEqual({ health_filters: ['GLUTEN_FREE'] });
    });
  });
});
