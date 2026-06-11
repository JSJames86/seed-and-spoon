import { expect, test, describe } from 'bun:test';
import { resolveIngredientPrice, getStoreById } from '@/lib/spoonassist/priceEngine';

describe('SpoonAssist price engine', () => {
  test('12 eggs at ShopRite cost ~$3.99 (one dozen-egg carton), not 12x the carton price', async () => {
    const shoprite = getStoreById('shoprite');
    const result = await resolveIngredientPrice('eggs', 12, 'each', shoprite.priceMultiplier);

    expect(result.price).toBeCloseTo(3.99, 2);
    expect(result.price).toBeLessThan(10);
  });

  test('1 egg at ShopRite costs a fraction of a carton', async () => {
    const shoprite = getStoreById('shoprite');
    const result = await resolveIngredientPrice('egg', 1, 'each', shoprite.priceMultiplier);

    expect(result.price).toBeCloseTo(3.99 / 12, 2);
  });
});
