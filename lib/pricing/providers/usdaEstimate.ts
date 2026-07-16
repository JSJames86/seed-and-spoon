// Wraps the existing USDA NJ regional baseline path (lib/spoonassist/priceEngine.js
// USDA_BASELINE / findBaseline / priceFromPackage) behind the PriceProvider
// interface. Refactor, not new work -- same table, same package-fraction math.
//
// Returns unmultiplied, chain-agnostic prices; lib/pricing/resolve.ts applies
// the target chain's priceMultiplier to 'usda_estimate'/'estimate' quotes
// (this tier has no real per-chain data to begin with, unlike krogerProvider).
//
// Also owns two edge cases the old resolveIngredientPrice() tier-0/tier-4
// short-circuits handled inline: ingredients that normalize to "free"
// (water, ice, pan drippings -- normalizeIngredient() returns null) price at
// $0 with certainty; anything with no baseline match gets the generic
// per-serving estimate.

import { normalizeIngredient, findBaseline, priceFromPackage, GENERIC_ESTIMATE } from '@/lib/spoonassist/priceEngine';
import type { CatalogItem, PriceProvider, PriceProviderContext, PriceQuote } from '../types';
import { confidenceFor } from '../confidence';

export const usdaEstimateProvider: PriceProvider = {
  id: 'usda_estimate',
  supportedChains: '*',

  async getQuotes(items: CatalogItem[], ctx: PriceProviderContext): Promise<PriceQuote[]> {
    const asOf = new Date().toISOString();

    return items
      .map((item): PriceQuote | null => {
        const normalized = normalizeIngredient(item.name);

        // Free ingredient (water, ice, drippings, ...) -- deterministic $0,
        // not a heuristic, so it isn't decayed and always wins selection.
        if (normalized === null) {
          return {
            productId: item.productId,
            chainId: ctx.chainId,
            storeId: ctx.storeId,
            price: 0,
            unit: item.unit,
            source: 'estimate',
            confidence: 1,
            asOf,
            meta: { free: true },
          };
        }

        const baseline = findBaseline(normalized);
        if (baseline) {
          const price = priceFromPackage(baseline, item.quantity, item.unit);
          return {
            productId: item.productId,
            chainId: ctx.chainId,
            storeId: ctx.storeId,
            price: parseFloat(price.toFixed(2)),
            unit: item.unit,
            source: 'usda_estimate',
            confidence: confidenceFor('usda_estimate', asOf),
            asOf,
            meta: { normalized },
          };
        }

        // No baseline match -- generic per-serving estimate, never a hard miss.
        return {
          productId: item.productId,
          chainId: ctx.chainId,
          storeId: ctx.storeId,
          price: GENERIC_ESTIMATE,
          unit: item.unit,
          source: 'estimate',
          confidence: confidenceFor('estimate', asOf),
          asOf,
          meta: { normalized },
        };
      })
      .filter((q): q is PriceQuote => q !== null);
  },

  async healthy() {
    return true; // static in-process table, always on -- matches FEATURES.usda
  },
};
