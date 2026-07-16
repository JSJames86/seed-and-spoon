// Per-retailer outbound deep links for the price comparison screen (Phase 2
// Instacart-quarantine spec §3.3). Plain links -- no API, no partner
// approval needed. v1 links to each retailer's homepage/search landing page;
// item-level deep-linked search queries are a later enhancement (spec §6).
//
// Keyed by the same chain id lib/spoonassist/priceEngine.js's
// UNIVERSAL_CHAINS/NJ_CHAINS and getStoreById() already use. Kroger-family
// stores get a dynamic id ("kroger-{locationId}") regardless of banner
// (Ralphs, Fred Meyer, King Soopers, ...) -- getRetailerLink() below
// special-cases that prefix onto a single 'kroger' entry rather than trying
// to keep a URL per banner.

export const RETAILER_LINKS = {
  walmart:    { label: 'Walmart',      url: 'https://www.walmart.com/' },
  aldi:       { label: 'ALDI',         url: 'https://www.aldi.us/' },
  target:     { label: 'Target',       url: 'https://www.target.com/' },
  wholefoods: { label: 'Whole Foods',  url: 'https://www.wholefoodsmarket.com/' },
  traderjoes: { label: "Trader Joe's", url: 'https://www.traderjoes.com/' },
  shoprite:   { label: 'ShopRite',     url: 'https://www.shoprite.com/' },
  stopshop:   { label: 'Stop & Shop',  url: 'https://stopandshop.com/' },
  wegmans:    { label: 'Wegmans',      url: 'https://shop.wegmans.com/' },
  pricerite:  { label: 'Price Rite',   url: 'https://www.priceritemarketplace.com/' },
  kroger:     { label: 'Kroger',       url: 'https://www.kroger.com/' },
};

// store: { id, name } from getStoresByZip()/getStoreById(). Falls back to a
// generic web search for any chain not in RETAILER_LINKS rather than
// omitting the link entirely (spec §4: "Each store card ... shows a working
// 'Shop at [Retailer]' link").
export function getRetailerLink(store) {
  const key = store?.id?.startsWith('kroger-') ? 'kroger' : store?.id;
  const entry = key ? RETAILER_LINKS[key] : null;
  if (entry) return entry;

  const name = store?.name || 'this store';
  return {
    label: name,
    url: `https://www.google.com/search?q=${encodeURIComponent(name + ' grocery store')}`,
  };
}
