// Google Places API (New) — geo-verifies which static UNIVERSAL_CHAINS / NJ_CHAINS
// grocery chains (see priceEngine.js) actually have a location near a given ZIP
// code, instead of assuming every chain is everywhere.
//
// Two pieces glue this together:
//   1. ZIP -> lat/lng via Zippopotam.us (free, no key required)
//   2. Nearby Search (New) for grocery_store/supermarket places within ~25mi
//      (matching the radius used for Kroger lookups), requesting only
//      Basic-tier fields ($32 / 1000 requests as of 2026)
//
// Required env var: GOOGLE_PLACES_API_KEY
// Pricing stays multiplier-based — this only changes *which* chains are
// offered as candidates for a given ZIP.

const ZIPPOPOTAM_API = 'https://api.zippopotam.us/us';
const PLACES_NEARBY_API = 'https://places.googleapis.com/v1/places:searchNearby';

// Matches the 25-mile radius used for Kroger store lookups (krogerClient.js)
const SEARCH_RADIUS_METERS = 40233;

const _geoCache = new Map();    // zip -> { lat, lng } | null
const _nearbyCache = new Map(); // zip -> Set<normalized place name> | null

function normalizeName(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function geocodeZip(zip) {
  if (_geoCache.has(zip)) return _geoCache.get(zip);

  let coords = null;
  try {
    const res = await fetch(`${ZIPPOPOTAM_API}/${zip}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const json = await res.json();
      const place = json?.places?.[0];
      if (place) {
        coords = { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
      }
    }
  } catch { /* leave coords null */ }

  _geoCache.set(zip, coords);
  return coords;
}

async function getNearbyGroceryNames(zip) {
  if (_nearbyCache.has(zip)) return _nearbyCache.get(zip);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const coords = apiKey ? await geocodeZip(zip) : null;

  let names = null;
  if (apiKey && coords) {
    try {
      const res = await fetch(PLACES_NEARBY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName',
        },
        body: JSON.stringify({
          includedTypes: ['grocery_store', 'supermarket'],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: { latitude: coords.lat, longitude: coords.lng },
              radius: SEARCH_RADIUS_METERS,
            },
          },
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        names = new Set((json?.places ?? []).map(p => normalizeName(p.displayName?.text)));
      }
    } catch { /* leave names null */ }
  }

  _nearbyCache.set(zip, names);
  return names;
}

// Returns the subset of `chains` ({ id, name, ... }) that have at least one
// matching grocery/supermarket location within ~25 miles of `zip`, per Google
// Places. Returns `null` if Places lookup is unavailable (no API key, geocode
// failure, or request error) so callers can fall back to their existing
// unfiltered static list.
export async function filterChainsByZip(zip, chains) {
  if (!chains?.length) return chains ?? [];

  const nearbyNames = await getNearbyGroceryNames(zip);
  if (nearbyNames === null) return null;

  return chains.filter(chain => {
    const chainName = normalizeName(chain.name);
    for (const placeName of nearbyNames) {
      if (placeName.includes(chainName) || chainName.includes(placeName)) return true;
    }
    return false;
  });
}
