// Confidence model v1 (spec Phase 1 §4). Deliberately simple; tune here only.

import type { PriceSource } from './types';

export const BASE_CONFIDENCE: Record<PriceSource, number> = {
  kroger_api: 0.95,
  walmart_affiliate: 0.95,
  community_receipt: 0.90,
  scraper: 0.75,
  community_manual: 0.65,
  usda_estimate: 0.40,
  estimate: 0.25,
};

// Live API quotes are stamped with asOf = now, so this floor/window only
// bites cached/observed prices (community, scraper) as they age.
export const DECAY_FLOOR = 0.3;
export const DECAY_WINDOW_DAYS = 30;

// Per-provider timeout for the resolution engine (spec §3) -- a slow/down
// provider degrades the result, never blocks it.
export const PROVIDER_TIMEOUT_MS = 3000;

export function decayConfidence(base: number, asOf: string | Date): number {
  const ageDays = Math.max(0, (Date.now() - new Date(asOf).getTime()) / (1000 * 60 * 60 * 24));
  const factor = Math.max(DECAY_FLOOR, 1 - ageDays / DECAY_WINDOW_DAYS);
  return Math.round(base * factor * 100) / 100;
}

export function confidenceFor(source: PriceSource, asOf: string | Date): number {
  return decayConfidence(BASE_CONFIDENCE[source], asOf);
}
