// Kroger Public API client
// Covers Kroger-family chains in ~35 states via client_credentials OAuth2.
// Required env vars: KROGER_CLIENT_ID, KROGER_CLIENT_SECRET

const KROGER_API = 'https://api.kroger.com/v1';

// ---------------------------------------------------------------------------
// Kroger chain display names + price multipliers (relative to Kroger baseline)
// ---------------------------------------------------------------------------

const KROGER_CHAIN_MAP = {
  KROGER:       { name: 'Kroger',          multiplier: 1.00 },
  RALPHS:       { name: 'Ralphs',          multiplier: 1.05 },
  FREDMEYER:    { name: 'Fred Meyer',      multiplier: 1.02 },
  FRED_MEYER:   { name: 'Fred Meyer',      multiplier: 1.02 },
  KINGSOOPERS:  { name: 'King Soopers',    multiplier: 0.98 },
  KING_SOOPERS: { name: 'King Soopers',    multiplier: 0.98 },
  HARRISTEETER: { name: 'Harris Teeter',   multiplier: 1.12 },
  HARRIS_TEETER:{ name: 'Harris Teeter',   multiplier: 1.12 },
  CITYMARKET:   { name: 'City Market',     multiplier: 1.02 },
  CITY_MARKET:  { name: 'City Market',     multiplier: 1.02 },
  DILLONS:      { name: 'Dillons',         multiplier: 0.96 },
  SMITHS:       { name: "Smith's",         multiplier: 0.97 },
  FRYS:         { name: "Fry's Food",      multiplier: 0.96 },
  QFC:          { name: 'QFC',             multiplier: 1.08 },
  PICKNSAVE:    { name: "Pick 'n Save",    multiplier: 0.98 },
  PICK_N_SAVE:  { name: "Pick 'n Save",    multiplier: 0.98 },
  MARIANOS:     { name: "Mariano's",       multiplier: 1.05 },
  FOOD4LESS:    { name: 'Food 4 Less',     multiplier: 0.85 },
  FOOD_4_LESS:  { name: 'Food 4 Less',     multiplier: 0.85 },
  FOODSCO:      { name: 'Foods Co.',       multiplier: 0.85 },
  FOODS_CO:     { name: 'Foods Co.',       multiplier: 0.85 },
  VONS:         { name: 'Vons',            multiplier: 1.05 },
  BAKERS:       { name: "Baker's",         multiplier: 0.97 },
  GERBES:       { name: 'Gerbes',          multiplier: 0.97 },
  COPPS:        { name: 'Copps',           multiplier: 0.98 },
  JAYC:         { name: 'Jay C Food Store',multiplier: 0.97 },
  JAY_C:        { name: 'Jay C Food Store',multiplier: 0.97 },
  RULERFOODS:   { name: 'Ruler Foods',     multiplier: 0.80 },
  RULER_FOODS:  { name: 'Ruler Foods',     multiplier: 0.80 },
  PAYLESS:      { name: 'Pay Less',        multiplier: 0.95 },
  PAY_LESS:     { name: 'Pay Less',        multiplier: 0.95 },
  METROMARKET:  { name: 'Metro Market',    multiplier: 1.05 },
  METRO_MARKET: { name: 'Metro Market',    multiplier: 1.05 },
};

// ---------------------------------------------------------------------------
// Token cache
// ---------------------------------------------------------------------------

let _token      = null;
let _tokenExpAt = 0;

async function getToken() {
  if (_token && Date.now() < _tokenExpAt) return _token;

  const id     = process.env.KROGER_CLIENT_ID;
  const secret = process.env.KROGER_CLIENT_SECRET;
  if (!id || !secret) return null;

  const creds = Buffer.from(`${id}:${secret}`).toString('base64');

  let res;
  try {
    res = await fetch(`${KROGER_API}/connect/oauth2/token`, {
      method:  'POST',
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    'grant_type=client_credentials&scope=product.compact',
      signal:  AbortSignal.timeout(5000),
    });
  } catch { return null; }

  if (!res.ok) return null;

  let json;
  try { json = await res.json(); } catch { return null; }

  _token      = json.access_token ?? null;
  _tokenExpAt = Date.now() + ((json.expires_in ?? 1800) - 60) * 1000;
  return _token;
}

// ---------------------------------------------------------------------------
// Store lookup: returns Kroger-family stores near a ZIP, as store objects
// ---------------------------------------------------------------------------

const _storeCache = new Map();  // zip → store[]

export async function getKrogerStoresNearZip(zip, limit = 3) {
  if (_storeCache.has(zip)) return _storeCache.get(zip);

  const token = await getToken();
  if (!token || !zip) return [];

  let res;
  try {
    res = await fetch(
      `${KROGER_API}/locations?filter.zipCode.near=${zip}&filter.radiusInMiles=25&filter.limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(6000) }
    );
  } catch { return []; }

  if (!res.ok) return [];

  let json;
  try { json = await res.json(); } catch { return []; }

  const stores = (json?.data ?? []).map(loc => {
    const chainKey = (loc.chain ?? '').toUpperCase().replace(/[\s-]/g, '_');
    const chain    = KROGER_CHAIN_MAP[chainKey] ?? { name: loc.name ?? loc.chain, multiplier: 1.0 };
    return {
      id:              `kroger-${loc.locationId}`,
      name:            chain.name,
      priceMultiplier: chain.multiplier,
      locationId:      loc.locationId,
    };
  });

  if (stores.length) _storeCache.set(zip, stores);
  return stores;
}

// ---------------------------------------------------------------------------
// Price lookup: real Kroger product prices for a given ingredient
// Accepts a locationId directly (preferred) or falls back to ZIP lookup.
// ---------------------------------------------------------------------------

export async function fetchKrogerPrice(ingredientName, qty, unit, locationId = null, zip = null) {
  const token = await getToken();
  if (!token) return null;

  let resolvedId = locationId;
  if (!resolvedId && zip) {
    const stores = await getKrogerStoresNearZip(zip, 1);
    resolvedId = stores[0]?.locationId ?? null;
  }

  const params = new URLSearchParams({ 'filter.term': ingredientName, 'filter.limit': '5' });
  if (resolvedId) params.set('filter.locationId', resolvedId);

  let res;
  try {
    res = await fetch(`${KROGER_API}/products?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal:  AbortSignal.timeout(5000),
    });
  } catch { return null; }

  if (!res.ok) return null;

  let json;
  try { json = await res.json(); } catch { return null; }

  const products = json?.data ?? [];
  if (!products.length) return null;

  const recipeOz = toOz(qty, unit);
  const prices   = [];

  for (const product of products.slice(0, 5)) {
    for (const item of product.items ?? []) {
      const unitPrice = item?.price?.regular ?? item?.price?.promo ?? null;
      if (!unitPrice || unitPrice <= 0) continue;

      const pkgOz = parseSizeToOz(item.size ?? '');
      if (pkgOz && recipeOz) {
        prices.push((unitPrice / pkgOz) * recipeOz);
      } else {
        prices.push(unitPrice * (qty || 1));
      }
    }
  }

  if (!prices.length) return null;

  prices.sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSizeToOz(sizeStr) {
  if (!sizeStr) return null;
  const m = String(sizeStr).toLowerCase().trim().match(/^([\d.]+)\s*(.+)$/);
  if (!m) return null;
  return toOz(parseFloat(m[1]), m[2].trim()) || null;
}

function toOz(qty, unit) {
  if (!qty || !unit) return null;
  const conversions = {
    oz:1,ounce:1,ounces:1,lb:16,lbs:16,pound:16,pounds:16,
    g:0.035274,gram:0.035274,grams:0.035274,kg:35.274,
    ml:0.033814,l:33.814,liter:33.814,liters:33.814,
    'fl oz':1,'fluid oz':1,cup:8,cups:8,
    tbsp:0.5,tablespoon:0.5,tablespoons:0.5,
    tsp:0.1667,teaspoon:0.1667,teaspoons:0.1667,
    pint:16,pints:16,pt:16,quart:32,quarts:32,qt:32,
    gallon:128,gallons:128,gal:128,stick:4,
  };
  return (conversions[String(unit).toLowerCase().trim()] ?? null)
    ? qty * conversions[String(unit).toLowerCase().trim()]
    : null;
}
