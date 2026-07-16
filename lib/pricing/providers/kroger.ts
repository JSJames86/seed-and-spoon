// Wraps the existing Kroger OAuth2 integration (lib/spoonassist/krogerClient.js)
// behind the PriceProvider interface. Refactor, not new work -- same token
// cache, same /v1/products lookup, same median-price math.
//
// Only prices genuine Kroger-family stores (ctx.storeId = Kroger locationId
// present). Pre-refactor, resolveIngredientPrice() would also borrow a
// nearby Kroger store's price (via krogerClient's own zip fallback) to
// estimate *other* chains' totals when KROGER_CLIENT_ID/SECRET were set --
// scaled by that chain's priceMultiplier. That cross-chain borrowing is
// intentionally dropped here: a 'kroger_api' quote should mean "this chain's
// own live price," not "Kroger's price wearing another chain's badge." Other
// chains now fall through to usdaEstimateProvider/cachedQuoteProvider
// (see lib/pricing/resolve.ts for where the chain price multiplier is
// applied to those heuristic tiers instead).

import { fetchKrogerPrice } from '@/lib/spoonassist/krogerClient';
import type { CatalogItem, PriceProvider, PriceProviderContext, PriceQuote } from '../types';
import { confidenceFor } from '../confidence';

function configured() {
  return !!(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET);
}

export const krogerProvider: PriceProvider = {
  id: 'kroger_api',
  supportedChains: '*',

  async getQuotes(items: CatalogItem[], ctx: PriceProviderContext): Promise<PriceQuote[]> {
    if (!configured() || !ctx.storeId) return [];

    const asOf = new Date().toISOString();
    const settled = await Promise.allSettled(
      items.map(async (item): Promise<PriceQuote | null> => {
        const price = await fetchKrogerPrice(item.name, item.quantity, item.unit, ctx.storeId, ctx.zip || null);
        if (price == null) return null;
        return {
          productId: item.productId,
          chainId: ctx.chainId,
          storeId: ctx.storeId,
          price: parseFloat(price.toFixed(2)),
          unit: item.unit,
          source: 'kroger_api',
          confidence: confidenceFor('kroger_api', asOf),
          asOf,
        };
      })
    );

    return settled
      .filter((r): r is PromiseFulfilledResult<PriceQuote | null> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((q): q is PriceQuote => q !== null);
  },

  async healthy() {
    // Credentials-configured is the v1 health signal -- a real live check
    // would need to spend a token fetch + product lookup on every poll.
    return configured();
  },
};
