// Write-through cache for price_quotes (spec §5, §6.3). Live/scraped quotes
// are normalized to a per-unit price ($/oz, or $/each when the unit can't
// convert to oz -- same weight/volume-vs-each split priceFromPackage() in
// priceEngine.js already uses) before being cached, since a raw quote is
// scoped to whatever quantity the original request asked for and isn't
// reusable as-is for a different quantity of the same ingredient next time.

import { toOz, getServiceClient } from '@/lib/spoonassist/priceEngine';
import type { CatalogItem, PriceQuote } from './types';

export interface CachedUnitPriceRow {
  product_id: string;
  chain_id: string;
  store_id: string | null;
  price: number;       // per-oz, or per-each when unitBasis === 'each'
  unit: 'oz' | 'each';
  source: string;
  confidence: number;
  as_of: string;
  meta: Record<string, unknown>;
}

// quote.price is the resolved dollar amount for `item.quantity` of `item.unit`.
// Convert to a stable per-unit rate so it can be rescaled for any future
// quantity of the same ingredient.
export function toUnitPriceRow(quote: PriceQuote, item: CatalogItem): CachedUnitPriceRow {
  const oz = toOz(item.quantity, item.unit);
  const unit: 'oz' | 'each' = oz ? 'oz' : 'each';
  const divisor = oz || item.quantity || 1;
  return {
    product_id: quote.productId,
    chain_id: quote.chainId,
    store_id: quote.storeId ?? null,
    price: parseFloat((quote.price / divisor).toFixed(4)),
    unit,
    source: quote.source,
    confidence: quote.confidence,
    as_of: quote.asOf,
    meta: quote.meta ?? {},
  };
}

// Rescales a cached per-unit row back to a dollar amount for `item`'s
// actual requested quantity.
export function fromUnitPriceRow(row: CachedUnitPriceRow, item: CatalogItem): number {
  if (row.unit === 'oz') {
    const oz = toOz(item.quantity, item.unit);
    return row.price * (oz ?? item.quantity ?? 1);
  }
  return row.price * (item.quantity || 1);
}

// Skips 'estimate' -- there's nothing observed worth caching for a generic
// fallback guess (spec: providers "never throw for misses"; this is the
// resolver's equivalent of not bothering to remember a miss).
export async function writeThroughQuotes(quotes: PriceQuote[], itemsByProductId: Map<string, CatalogItem>): Promise<void> {
  const client = getServiceClient();
  if (!client || quotes.length === 0) return;

  const rows = quotes
    .filter((q) => q.source !== 'estimate')
    .map((q) => {
      const item = itemsByProductId.get(q.productId);
      return item ? toUnitPriceRow(q, item) : null;
    })
    .filter((r): r is CachedUnitPriceRow => r !== null);

  if (rows.length === 0) return;

  const { error } = await client.from('price_quotes').insert(rows);
  if (error) {
    console.error('[lib/pricing/cache] write-through insert failed:', error.message);
  }
}
