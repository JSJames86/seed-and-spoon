// Registry pattern (spec §6). Losing or gaining a data source is an edit to
// this array, not a rewrite of the resolution engine or the comparison
// screen -- pull krogerProvider out and Kroger-family stores just fall
// through to usdaEstimateProvider/cachedQuoteProvider with fewer items priced.

import type { PriceProvider } from './types';
import { krogerProvider } from './providers/kroger';
import { cachedQuoteProvider } from './providers/cachedQuote';
import { usdaEstimateProvider } from './providers/usdaEstimate';
import { walmartAffiliateProvider, scraperProvider, communityReceiptProvider } from './providers/stubs';

export const providers: PriceProvider[] = [
  krogerProvider,
  cachedQuoteProvider,
  usdaEstimateProvider,
  walmartAffiliateProvider,   // stub -- returns [] until the affiliate application is approved
  scraperProvider,            // stub -- returns [] until a scraper gap-filler is built
  communityReceiptProvider,   // stub -- returns [] until Phase 3 (receipt OCR)
];
