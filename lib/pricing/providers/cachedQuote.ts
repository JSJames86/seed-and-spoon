// Reads recent rows from price_quotes -- the write-through cache every other
// provider feeds (lib/pricing/cache.ts). This is how the resolver still
// answers when a live provider is slow/down (spec §3), and how future
// community/scraper writers plug in without any resolver changes (spec §6.3).

import { getServiceClient } from '@/lib/spoonassist/priceEngine';
import type { CatalogItem, PriceProvider, PriceProviderContext, PriceQuote, PriceSource } from '../types';
import { confidenceFor, DECAY_WINDOW_DAYS } from '../confidence';
import { fromUnitPriceRow, type CachedUnitPriceRow } from '../cache';

// Rows older than this are never worth a lookup -- confidence would already
// be floored, and it keeps the query bounded.
const LOOKBACK_DAYS = DECAY_WINDOW_DAYS * 3;

export const cachedQuoteProvider: PriceProvider = {
  id: 'scraper', // nominal id for registry/health-check listing; actual
                  // per-quote `source` is whatever the cached row recorded.
  supportedChains: '*',

  async getQuotes(items: CatalogItem[], ctx: PriceProviderContext): Promise<PriceQuote[]> {
    const client = getServiceClient();
    if (!client || items.length === 0) return [];

    const productIds = items.map((i) => i.productId);
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await client
      .from('price_quotes')
      .select('product_id, chain_id, store_id, price, unit, source, confidence, as_of, meta')
      .in('product_id', productIds)
      .eq('chain_id', ctx.chainId)
      .gte('as_of', since)
      .order('as_of', { ascending: false });

    if (error) {
      console.error('[lib/pricing cachedQuoteProvider] price_quotes read failed:', error.message);
      return [];
    }

    // Most recent row per product_id (rows are already ordered newest-first).
    const latestByProduct = new Map<string, CachedUnitPriceRow>();
    for (const row of data ?? []) {
      if (!latestByProduct.has(row.product_id)) latestByProduct.set(row.product_id, row);
    }

    return items
      .map((item): PriceQuote | null => {
        const row = latestByProduct.get(item.productId);
        if (!row) return null;
        const source = row.source as PriceSource;
        return {
          productId: item.productId,
          chainId: ctx.chainId,
          storeId: ctx.storeId,
          price: parseFloat(fromUnitPriceRow(row, item).toFixed(2)),
          unit: item.unit,
          source,
          // Recompute decay against the row's original as_of, not whatever
          // confidence was stored at write time.
          confidence: confidenceFor(source, row.as_of),
          asOf: row.as_of,
          meta: { ...row.meta, cached: true },
        };
      })
      .filter((q): q is PriceQuote => q !== null);
  },

  async healthy() {
    return !!getServiceClient();
  },
};
