// ---------------------------------------------------------------------------
// Store matching (spec §2.3): fuzzy-match the receipt's printed store name
// against the existing ZIP -> chain classification pipeline
// (lib/spoonassist/priceEngine.js getStoresByZip() -- Kroger locations API +
// Google Places; there is no OSM pipeline in this repo, see migration
// header) using the user's ZIP as a hint. Falls back to "unmatched" (store
// stays in review status, spec §2.3) rather than guessing.
// ---------------------------------------------------------------------------

import { getStoresByZip } from '@/lib/spoonassist/priceEngine';

const MATCH_THRESHOLD = 0.5;

function normalizeName(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenOverlapScore(a, b) {
  const tokensA = new Set(normalizeName(a).split(' ').filter(Boolean));
  const tokensB = new Set(normalizeName(b).split(' ').filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let shared = 0;
  for (const t of tokensA) if (tokensB.has(t)) shared += 1;
  return shared / Math.min(tokensA.size, tokensB.size);
}

/**
 * @param {string} storeNameRaw as printed on the receipt
 * @param {string} zip user's ZIP hint
 * @returns {Promise<{chainId:string, storeId:string|null, name:string, score:number}|null>}
 */
export async function matchStore(storeNameRaw, zip) {
  if (!storeNameRaw || !zip) return null;

  const candidates = await getStoresByZip(zip).catch((err) => {
    console.error('[receipts/storeMatch] getStoresByZip failed:', err.message);
    return [];
  });
  if (!candidates.length) return null;

  let best = null;
  for (const store of candidates) {
    const score = tokenOverlapScore(storeNameRaw, store.name);
    if (score > (best?.score ?? 0)) best = { chainId: store.id, storeId: store.locationId ?? null, name: store.name, score };
  }

  return best && best.score >= MATCH_THRESHOLD ? best : null;
}
