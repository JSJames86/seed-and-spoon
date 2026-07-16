// Typed stubs for sources not yet integrated (spec §6.4). Each is gated
// behind its own env flag and returns [] until the real implementation
// lands -- Phase 3 for community receipts, the Walmart application approval
// for the affiliate feed, and a later phase for the scraper gap-filler.

import type { CatalogItem, PriceProvider, PriceProviderContext, PriceQuote } from '../types';

export const walmartAffiliateProvider: PriceProvider = {
  id: 'walmart_affiliate',
  supportedChains: ['walmart'],
  async getQuotes(_items: CatalogItem[], _ctx: PriceProviderContext): Promise<PriceQuote[]> {
    return [];
  },
  async healthy() {
    return !!process.env.WALMART_AFFILIATE_API_KEY;
  },
};

export const scraperProvider: PriceProvider = {
  id: 'scraper',
  supportedChains: '*',
  async getQuotes(_items: CatalogItem[], _ctx: PriceProviderContext): Promise<PriceQuote[]> {
    return [];
  },
  async healthy() {
    return !!process.env.SCRAPER_PROVIDER_ENABLED;
  },
};

export const communityReceiptProvider: PriceProvider = {
  id: 'community_receipt',
  supportedChains: '*',
  async getQuotes(_items: CatalogItem[], _ctx: PriceProviderContext): Promise<PriceQuote[]> {
    return [];
  },
  async healthy() {
    return !!process.env.COMMUNITY_RECEIPT_PROVIDER_ENABLED;
  },
};
