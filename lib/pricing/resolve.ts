// Resolution engine (spec §3). For each (item, store): query every
// registered provider in parallel with a per-provider timeout, collect all
// available quotes, and select the winner -- highest confidence, tiebreak
// by most recent asOf. Never silently average sources.
//
// Assumes each CatalogItem.productId is unique within a single resolve call
// (true for consolidated shopping lists -- lib/spoonassist/consolidateList.js
// already merges duplicate ingredients before this stage). Two items sharing
// a productId in one call would have their quotes pooled together here.

import type { CatalogItem, PriceProvider, PriceQuote, PriceSource } from './types';
import { providers as defaultProviders } from './registry';
import { PROVIDER_TIMEOUT_MS } from './confidence';
import { writeThroughQuotes } from './cache';

export interface ResolveStore {
  id: string;             // chainId, e.g. 'walmart' or 'kroger-70100737'
  name: string;
  priceMultiplier?: number;
  locationId?: string;    // Kroger storeId, when this store is a genuine Kroger-family location
}

export interface StoreResolution {
  storeId: string;
  storeName: string;
  total: number;
  pricedCount: number;
  totalCount: number;
  quotes: PriceQuote[];   // one selected (winning) quote per priced item
}

// Only sources that speak for a specific chain's real, live price are exempt
// from the store's heuristic priceMultiplier -- everything else (baselines,
// cached/community data) is chain-agnostic and needs the multiplier to
// approximate that chain's price level.
const MULTIPLIER_EXEMPT_SOURCES: ReadonlySet<PriceSource> = new Set(['kroger_api', 'walmart_affiliate']);

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      () => { clearTimeout(timer); resolve(fallback); }
    );
  });
}

function selectWinner(quotes: PriceQuote[]): PriceQuote | null {
  if (quotes.length === 0) return null;
  return [...quotes].sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return new Date(b.asOf).getTime() - new Date(a.asOf).getTime();
  })[0];
}

async function collectQuotesForStore(
  items: CatalogItem[],
  zip: string,
  store: ResolveStore,
  providerList: PriceProvider[]
): Promise<PriceQuote[]> {
  const ctx = { zip, chainId: store.id, storeId: store.locationId };

  const perProvider = await Promise.allSettled(
    providerList.map((p) =>
      withTimeout(
        p.getQuotes(items, ctx).catch((err) => {
          console.error(`[lib/pricing/resolve] provider "${p.id}" threw:`, err?.message ?? err);
          return [] as PriceQuote[];
        }),
        PROVIDER_TIMEOUT_MS,
        [] as PriceQuote[]
      )
    )
  );

  const all = perProvider.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const multiplier = store.priceMultiplier ?? 1.0;

  return all.map((q) =>
    MULTIPLIER_EXEMPT_SOURCES.has(q.source)
      ? q
      : { ...q, price: parseFloat((q.price * multiplier).toFixed(2)) }
  );
}

export async function resolveStore(
  items: CatalogItem[],
  zip: string,
  store: ResolveStore,
  providerList: PriceProvider[] = defaultProviders
): Promise<StoreResolution> {
  const allQuotes = await collectQuotesForStore(items, zip, store, providerList);

  const byProduct = new Map<string, PriceQuote[]>();
  for (const q of allQuotes) {
    const arr = byProduct.get(q.productId);
    if (arr) arr.push(q); else byProduct.set(q.productId, [q]);
  }

  const selected = items
    .map((item) => selectWinner(byProduct.get(item.productId) ?? []))
    .filter((q): q is PriceQuote => q !== null);

  const itemsByProductId = new Map(items.map((i) => [i.productId, i]));
  writeThroughQuotes(allQuotes, itemsByProductId).catch((err) =>
    console.error('[lib/pricing/resolve] write-through cache failed:', err?.message ?? err)
  );

  return {
    storeId: store.id,
    storeName: store.name,
    total: parseFloat(selected.reduce((sum, q) => sum + q.price, 0).toFixed(2)),
    pricedCount: selected.length,
    totalCount: items.length,
    quotes: selected,
  };
}

export async function resolveAll(
  items: CatalogItem[],
  zip: string,
  stores: ResolveStore[],
  providerList: PriceProvider[] = defaultProviders
): Promise<StoreResolution[]> {
  return Promise.all(stores.map((store) => resolveStore(items, zip, store, providerList)));
}

// Dominant-source classification for the store-card provenance badge (spec §7).
export type Provenance = 'live' | 'community' | 'estimated';

export function classifyProvenance(quotes: PriceQuote[]): Provenance {
  if (quotes.length === 0) return 'estimated';
  const liveCount = quotes.filter((q) => q.confidence >= 0.9).length;
  if (liveCount / quotes.length >= 0.5) return 'live';
  const communityCount = quotes.filter((q) => q.source === 'community_manual' || q.source === 'community_receipt').length;
  if (communityCount / quotes.length >= 0.5) return 'community';
  return 'estimated';
}
