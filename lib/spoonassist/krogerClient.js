// Kroger Public API client
// Docs: https://developer.kroger.com/documentation/public/getting-started/quick-start
//
// Required env vars:
//   KROGER_CLIENT_ID
//   KROGER_CLIENT_SECRET

const KROGER_API = 'https://api.kroger.com/v1';

// ---------------------------------------------------------------------------
// Token cache (module-level — survives across requests in same server process)
// ---------------------------------------------------------------------------

let _cachedToken   = null;
let _tokenExpiresAt = 0;

async function getToken() {
  if (_cachedToken && Date.now() < _tokenExpiresAt) return _cachedToken;

  const id     = process.env.KROGER_CLIENT_ID;
  const secret = process.env.KROGER_CLIENT_SECRET;
  if (!id || !secret) return null;

  const creds = Buffer.from(`${id}:${secret}`).toString('base64');

  let res;
  try {
    res = await fetch(`${KROGER_API}/connect/oauth2/token`, {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body:   'grant_type=client_credentials&scope=product.compact',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let json;
  try { json = await res.json(); } catch { return null; }

  _cachedToken    = json.access_token ?? null;
  // Refresh 60 s before expiry; default Kroger TTL is 1800 s
  _tokenExpiresAt = Date.now() + ((json.expires_in ?? 1800) - 60) * 1000;
  return _cachedToken;
}

// ---------------------------------------------------------------------------
// Location cache (ZIP → locationId)
// ---------------------------------------------------------------------------

const _locationCache = new Map();

async function getLocationId(zip) {
  if (_locationCache.has(zip)) return _locationCache.get(zip);

  const token = await getToken();
  if (!token) return null;

  let res;
  try {
    res = await fetch(
      `${KROGER_API}/locations?filter.zipCode.near=${zip}&filter.radiusInMiles=25&filter.limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }
    );
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let json;
  try { json = await res.json(); } catch { return null; }

  const locationId = json?.data?.[0]?.locationId ?? null;
  if (locationId) _locationCache.set(zip, locationId);
  return locationId;
}

// ---------------------------------------------------------------------------
// Public: fetch price for a single ingredient
//
// Returns the scaled price in dollars for the requested qty/unit,
// or null if unavailable.
// ---------------------------------------------------------------------------

export async function fetchKrogerPrice(ingredientName, qty, unit, zip) {
  const token = await getToken();
  if (!token) return null;

  const locationId = zip ? await getLocationId(zip) : null;

  const params = new URLSearchParams({
    'filter.term':  ingredientName,
    'filter.limit': '5',
  });
  if (locationId) params.set('filter.locationId', locationId);

  let res;
  try {
    res = await fetch(`${KROGER_API}/products?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal:  AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let json;
  try { json = await res.json(); } catch { return null; }

  const products = json?.data ?? [];
  if (!products.length) return null;

  // Collect unit prices from the first 5 results
  const prices = [];

  for (const product of products.slice(0, 5)) {
    for (const item of product.items ?? []) {
      const unitPrice = item?.price?.regular ?? item?.price?.promo ?? null;
      if (!unitPrice || unitPrice <= 0) continue;

      // Try to scale by package size
      const sizeStr = item.size ?? '';
      const sizeOz  = parseSizeToOz(sizeStr);
      const recipeOz = toOz(qty, unit);

      if (sizeOz && recipeOz) {
        prices.push((unitPrice / sizeOz) * recipeOz);
      } else {
        // No parseable size — use unit price scaled by qty
        prices.push(unitPrice * (qty || 1));
      }
    }
  }

  if (!prices.length) return null;

  // Return median to filter outliers
  prices.sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 === 0
    ? (prices[mid - 1] + prices[mid]) / 2
    : prices[mid];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSizeToOz(sizeStr) {
  if (!sizeStr) return null;
  const s = String(sizeStr).toLowerCase().trim();
  const m = s.match(/^([\d.]+)\s*(.+)$/);
  if (!m) return null;
  return toOz(parseFloat(m[1]), m[2].trim()) || null;
}

// Mirror of priceEngine toOz — kept local to avoid circular import
function toOz(qty, unit) {
  if (!qty || !unit) return null;
  const u = String(unit).toLowerCase().trim();
  const conversions = {
    oz: 1, ounce: 1, ounces: 1,
    lb: 16, lbs: 16, pound: 16, pounds: 16,
    g: 0.035274, gram: 0.035274, grams: 0.035274,
    kg: 35.274, kilogram: 35.274, kilograms: 35.274,
    ml: 0.033814, milliliter: 0.033814, milliliters: 0.033814,
    l: 33.814, liter: 33.814, liters: 33.814,
    fl_oz: 1, 'fl oz': 1, 'fluid oz': 1, 'fluid ounce': 1, 'fluid ounces': 1,
    cup: 8, cups: 8,
    tbsp: 0.5, tablespoon: 0.5, tablespoons: 0.5,
    tsp: 0.1667, teaspoon: 0.1667, teaspoons: 0.1667,
    pint: 16, pints: 16, pt: 16,
    quart: 32, quarts: 32, qt: 32,
    gallon: 128, gallons: 128, gal: 128,
    stick: 4,
  };
  const factor = conversions[u];
  return factor ? qty * factor : null;
}
