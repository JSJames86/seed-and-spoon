// ---------------------------------------------------------------------------
// Sanity-bounds check (spec §3): reject/flag a receipt-derived price that
// deviates > 3x or < 0.33x from "the current best quote or USDA estimate
// for that ingredient." Reuses lib/pricing/resolve.ts's resolveStore() --
// the same Phase 1 resolution engine the comparison screen calls -- to get
// that reference price, instead of re-deriving pricing logic here.
// ---------------------------------------------------------------------------

import { resolveStore } from '@/lib/pricing/resolve';

const MAX_RATIO = 3;
const MIN_RATIO = 1 / 3;

/**
 * @param {{productId:string, name:string, quantity:number, unit:string, price:number, chainId?:string, zip?:string}} args
 * @returns {Promise<{ok:boolean, reference:number|null, ratio:number|null}>}
 */
export async function checkPriceSanity({ productId, name, quantity, unit, price, chainId, zip }) {
  const store = { id: chainId || 'usda-baseline', name: chainId || 'receipt-reference', priceMultiplier: 1.0 };
  const item = { productId, name, quantity: quantity || 1, unit: unit || 'each' };

  let reference = null;
  try {
    const result = await resolveStore([item], zip || '', store);
    reference = result.quotes[0]?.price ?? null;
  } catch (err) {
    console.error('[receipts/sanityCheck] resolveStore failed:', err.message);
  }

  // Nothing to compare against -- don't block on missing reference data,
  // just pass through unflagged (matches the resolver's own "degrade
  // gracefully, never block" philosophy).
  if (reference == null || reference <= 0 || !Number.isFinite(price) || price <= 0) {
    return { ok: true, reference, ratio: null };
  }

  const ratio = price / reference;
  return { ok: ratio <= MAX_RATIO && ratio >= MIN_RATIO, reference, ratio };
}
