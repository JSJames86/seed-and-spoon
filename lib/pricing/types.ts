// Pricing provider abstraction -- Phase 1.
//
// Every price shown to a user is a PriceQuote with provenance (source,
// confidence, asOf), produced by a PriceProvider and picked by the
// resolution engine (./resolve.ts). Adding/removing a data source is a
// registry change (./registry.ts), not a rewrite of the comparison screen.

export type PriceSource =
  | 'kroger_api'          // live, official -- lib/spoonassist/krogerClient.js
  | 'walmart_affiliate'   // stub -- pending application
  | 'usda_estimate'       // USDA-derived regional baseline (priceEngine.js USDA_BASELINE)
  | 'community_receipt'   // stub -- Phase 3, receipt-confirmed
  | 'community_manual'    // Supabase price_points -- user-entered confirmation
  | 'scraper'             // Supabase ingredient_mappings cache today; real scraper later
  | 'estimate';           // generic heuristic fallback ($2.99/serving, or free items)

// The unit the catalog item is priced in. Mirrors priceEngine.js's
// PARSE_UNITS vocabulary (already normalized by parseIngredientString /
// normalizeIngredient) -- kept as a string, not an enum, so provider code
// doesn't need to import the parser's unit list.
export interface CatalogItem {
  productId: string;   // normalized ingredient name (see normalizeIngredient()) --
                        // the repo has no `products` table; this text key is what
                        // ingredient_mappings.normalized_name / price_points.ingredient
                        // already use as the catalog identity.
  name: string;         // raw ingredient name, e.g. "2 cups chopped onion"
  quantity: number;
  unit: string;
}

export interface PriceQuote {
  productId: string;        // matches CatalogItem.productId
  chainId: string;          // store.id from getStoresByZip()/getStoreById() (e.g. 'walmart', 'kroger-70100737')
  storeId?: string;         // Kroger locationId when known; undefined for static chains
  price: number;            // USD
  unit?: string;             // 'each' | 'lb' | 'oz' | ...
  source: PriceSource;
  confidence: number;       // 0-1, see confidence.ts
  asOf: string;              // ISO timestamp of observation
  meta?: Record<string, unknown>; // provider-specific (e.g. matched Kroger productId)
}

export interface PriceProviderContext {
  zip: string;
  chainId: string;
  storeId?: string;
}

export interface PriceProvider {
  id: PriceSource;
  /** Chains this provider can price. '*' = any. */
  supportedChains: string[] | '*';
  /** Batch lookup. Return quotes only for items it can price; never throw for misses. */
  getQuotes(items: CatalogItem[], ctx: PriceProviderContext): Promise<PriceQuote[]>;
  /** Health check for the status dashboard / graceful degradation. */
  healthy(): Promise<boolean>;
}
