// ---------------------------------------------------------------------------
// 5 Loaves Pilot -- Event Logging & Provenance Model
//
// Pure, DB-free implementations of the two pieces of math the pilot's
// resilience metric depends on:
//
//   - drawFromLots()  -- the "attribution rule": strict FIFO by
//     acquisition_lots.acquired_at, source-blind (oldest food first,
//     regardless of source). Models real kitchen behavior and can't be tuned
//     to flatter the metric.
//
//   - attributeMeal() / rollUpWeeklyShares() -- "the two lines": split each
//     meal's consumed value into an own-resource share and a
//     5-Loaves-delivery share, then roll those up into the week's resilience
//     and dependence trend lines.
//
// See supabase/migrations/20260615000001_five_loaves_provenance.sql for the
// schema these operate over (acquisition_lots, meal_events,
// consumption_events, requirement_events).
// ---------------------------------------------------------------------------

// "Own resources": pre_existing (the one-time intake baseline) and
// self_purchase/regenerative (the household acquiring/growing its own food
// over time) all count toward the resilience line.
export const OWN_RESOURCE_SOURCES = new Set(['pre_existing', 'self_purchase', 'regenerative']);

// The intervention: counts toward the dependence line.
export const DELIVERY_SOURCE = 'five_loaves_delivery';

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Strict FIFO, source-blind draw against a household's acquisition lots for
 * one ingredient: oldest `acquiredAt` first, regardless of `source`. This is
 * the attribution rule -- it models real kitchen behavior (oldest food gets
 * used first) and can't be gamed to favor one source over another.
 *
 * Mutates each drawn lot's `qtyRemaining` in place (the live pantry state).
 *
 * @param {{id:string, ingredientId:string, source:string, acquiredAt:string|number|Date, qtyRemaining:number}[]} lots
 * @param {string} ingredientId
 * @param {number} qtyNeeded
 * @returns {{draws: {lotId:string, source:string, qty:number}[], shortfall:number}}
 *   `draws` is oldest-acquired first. `shortfall` is whatever `qtyNeeded`
 *   couldn't be covered by available lots (>= 0).
 */
export function drawFromLots(lots, ingredientId, qtyNeeded) {
  const candidates = lots
    .filter(l => l.ingredientId === ingredientId && l.qtyRemaining > 0)
    .sort((a, b) => new Date(a.acquiredAt) - new Date(b.acquiredAt));

  const draws = [];
  let remaining = qtyNeeded;

  for (const lot of candidates) {
    if (remaining <= 0) break;
    const qty = Math.min(lot.qtyRemaining, remaining);
    lot.qtyRemaining = round2(lot.qtyRemaining - qty);
    draws.push({ lotId: lot.id, source: lot.source, qty: round2(qty) });
    remaining = round2(remaining - qty);
  }

  return { draws, shortfall: round2(Math.max(0, remaining)) };
}

/**
 * "The two lines": splits one meal's consumed value into an own-resource
 * share and a 5-Loaves-delivery share, per the attribution rule.
 *
 * Weighted by value (PriceEngine cost of each consumed item) when every item
 * priced; if any item's value is unresolvable, falls back to ingredient-slot
 * counting (each item weighted 1) for the whole meal -- mixing $ and slot
 * counts in one sum would be meaningless, so the fallback is all-or-nothing.
 *
 * @param {{source:string, value:number|null}[]} items one entry per
 *   consumption_event for this meal (value = PriceEngine cost of
 *   qty_consumed, or null if unresolvable).
 * @param {number} servings meal_events.servings
 * @returns {{ownShare:number, deliveredShare:number, ownServings:number, deliveredServings:number}}
 */
export function attributeMeal({ items, servings }) {
  const priced = items.length > 0 && items.every(i => i.value != null);
  const weight = item => (priced ? item.value : 1);

  const totalValue = items.reduce((sum, i) => sum + weight(i), 0);
  const ownValue = items
    .filter(i => OWN_RESOURCE_SOURCES.has(i.source))
    .reduce((sum, i) => sum + weight(i), 0);
  const deliveredValue = items
    .filter(i => i.source === DELIVERY_SOURCE)
    .reduce((sum, i) => sum + weight(i), 0);

  const ownShare = totalValue > 0 ? ownValue / totalValue : 0;
  const deliveredShare = totalValue > 0 ? deliveredValue / totalValue : 0;

  return {
    ownShare,
    deliveredShare,
    ownServings: round2(servings * ownShare),
    deliveredServings: round2(servings * deliveredShare),
  };
}

/**
 * Rolls up per-meal attributions into the week's two trend lines:
 *
 *   Own-resource share       = Σ ownServings / totalServings       (resilience)
 *   Delivery-dependence share = Σ deliveredServings / totalServings (dependence)
 *
 * `totalServings` should be the servings across the same set of meals
 * `mealAttributions` was computed from -- pass `meal_events.planned_in_app`
 * (+ the weekly `app_coverage` survey line) alongside this when reporting, so
 * the share is never presented as if it covered every meal the household ate.
 *
 * @param {{ownServings:number, deliveredServings:number}[]} mealAttributions
 * @param {number} totalServings
 * @returns {{ownResourceShare:number, deliveryDependenceShare:number}}
 */
export function rollUpWeeklyShares(mealAttributions, totalServings) {
  if (totalServings <= 0) {
    return { ownResourceShare: 0, deliveryDependenceShare: 0 };
  }

  const ownServings = mealAttributions.reduce((sum, m) => sum + m.ownServings, 0);
  const deliveredServings = mealAttributions.reduce((sum, m) => sum + m.deliveredServings, 0);

  return {
    ownResourceShare: round2(ownServings / totalServings),
    deliveryDependenceShare: round2(deliveredServings / totalServings),
  };
}
