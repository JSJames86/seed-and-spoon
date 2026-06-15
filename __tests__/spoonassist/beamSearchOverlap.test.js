import { expect, test, describe } from 'bun:test';
import {
  planBuyList,
  buildCoveragePlans,
  selectBestCoveragePlan,
} from '@/lib/spoonassist/mealLeverageEngine';

// ---------------------------------------------------------------------------
// Adversarial "overlap stranding" tests.
//
// Greedy planBuyList scores each recipe by its *own* marginal MLS at each
// step. It has no lookahead: it cannot see that buying a shared "hub"
// ingredient now will make several future recipes nearly free. So when a
// cheap, non-overlapping recipe out-scores the first hub recipe in round 1,
// greedy takes the cheap one and stalls -- it strands the overlap.
//
// The beam search (buildCoveragePlans) exists to fix exactly this: it also
// builds anchor-SEEDED candidate plans that pin a high-value recipe first,
// then lets planScore (which rewards coverage + overlap) pick the winner.
//
// These two tests draw the boundary of how well that fix currently works:
//   1. value-competitive hub  -> beam RECOVERS the strand   (proves the win)
//   2. low-value hub          -> beam STILL strands         (pins the gap)
//
// Both use the same shape: a household needing 16 servings (4 people x 4
// dinners) on an $8 budget, a "hub" ingredient (chicken, $4) shared by four
// recipes, and a standalone decoy that wins greedy's first round.
// ---------------------------------------------------------------------------

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// basePrices: { ingredientId: pricePerUnit }. Mirrors the helper in the main
// engine test so these can be dropped into that file unchanged.
function makePriceBasket(basePrices, storeMultipliers = {}) {
  return async (missing, storeId) => {
    const mult = storeMultipliers[storeId] ?? 1;
    const items = missing.map(m => ({
      id: m.id,
      amount: m.amount,
      unit: m.unit,
      price: round2(m.amount * (basePrices[m.id] ?? 0) * mult),
    }));
    return { total: round2(items.reduce((sum, i) => sum + i.price, 0)), items };
  };
}

// Recipe factory: 4 servings each; nutrition and ingredient list vary.
function recipe(id, nutrition, ingredientIds) {
  return {
    id,
    name: id,
    servings: 4,
    nutrition,
    snapEligible: true,
    ingredients: ingredientIds.map(i => ({ id: i, amount: 1, unit: 'each' })),
  };
}

const HOUSEHOLD = { size: 4, dinnersNeeded: 4 }; // needs 16 servings
const BUDGET = 8;

describe('beam search vs. overlap stranding', () => {
  // -- Scenario 1: the hub recipes are high-value (nutrition 0.8), so they
  //    land in the anchor seed set. Greedy strands them; the beam recovers. --
  test('RECOVERS a strand when the high-overlap hub is also high-value', async () => {
    const recipes = [
      recipe('solo', 0.5, ['tofu']),               // cheap, no overlap, wins greedy R1
      recipe('chkA', 0.8, ['chicken', 'pA']),       // hub: all four share `chicken`
      recipe('chkB', 0.8, ['chicken', 'pB']),
      recipe('chkC', 0.8, ['chicken', 'pC']),
      recipe('chkD', 0.8, ['chicken', 'pD']),
    ];
    // chicken is the expensive hub ($4); each partner is $1. tofu ($3) gives
    // solo a higher round-1 MLS (0.667) than any single chicken recipe
    // (3.2/5 = 0.64), so greedy picks solo first and never affords the hub.
    const priceBasket = makePriceBasket({
      tofu: 3, chicken: 4, pA: 1, pB: 1, pC: 1, pD: 1,
    });

    // Plain greedy strands: it covers only 8 of 16 servings.
    const greedy = await planBuyList({
      recipes, pantry: [], household: HOUSEHOLD, budget: BUDGET,
      storeId: 's', priceBasket,
    });
    expect(greedy.gapServings).toBe(8);
    expect(greedy.plan.map(p => p.recipe.id)).toEqual(['solo', 'chkA']);

    // The beam builds an anchor-seeded candidate that buys the chicken hub
    // once and rides the overlap to full coverage on the same $8.
    const candidates = await buildCoveragePlans({
      recipes, pantry: [], household: HOUSEHOLD, budget: BUDGET,
      storeId: 's', priceBasket,
    });
    const best = selectBestCoveragePlan(candidates);

    expect(best.base.gapServings).toBe(0);                 // full 16/16 coverage
    expect(best.base.plan).toHaveLength(4);
    expect(best.base.plan.every(p => p.recipe.id.startsWith('chk'))).toBe(true);
    expect(best.base.spent).toBeLessThanOrEqual(BUDGET);
    // And it genuinely beat the stranded greedy plan on planScore.
    expect(best.score.planScore).toBeGreaterThan(0.5);
  });

  // -- Scenario 2: identical overlap structure, but the hub recipes are
  //    LOW-value (nutrition 0.45 -- still above the 0.4 nourishment floor),
  //    while three high-nutrition standalone decoys occupy the anchor slots.
  //    Anchors are seeded by VALUE, not OVERLAP, so no chicken recipe is ever
  //    seeded, the 16/16 hub plan is never generated, and the beam strands
  //    just like greedy. This test pins the CURRENT limitation. --
  test('STILL strands a low-value high-overlap hub (value-only anchor seeding)', async () => {
    const recipes = [
      recipe('dec1', 0.9, ['d1']),                  // high-nutrition decoys: no overlap,
      recipe('dec2', 0.9, ['d2']),                  // but they grab the top anchor seeds
      recipe('dec3', 0.9, ['d3']),
      recipe('chkA', 0.45, ['chicken', 'pA']),       // low-value hub: never seeded
      recipe('chkB', 0.45, ['chicken', 'pB']),
      recipe('chkC', 0.45, ['chicken', 'pC']),
      recipe('chkD', 0.45, ['chicken', 'pD']),
    ];
    const priceBasket = makePriceBasket({
      d1: 3, d2: 3, d3: 3, chicken: 4, pA: 1, pB: 1, pC: 1, pD: 1,
    });

    const candidates = await buildCoveragePlans({
      recipes, pantry: [], household: HOUSEHOLD, budget: BUDGET,
      storeId: 's', priceBasket,
    });
    const best = selectBestCoveragePlan(candidates);

    // The chicken hub plan (which would cover 16/16 on the same $8) is never
    // even a candidate -- every plan the beam builds is a decoy strand.
    const hubEverConsidered = candidates.some(c =>
      c.base.plan.some(p => p.recipe.id.startsWith('chk')));
    expect(hubEverConsidered).toBe(false);

    // So the selected plan strands at 8/16, exactly like plain greedy.
    expect(best.base.gapServings).toBe(8);
    expect(best.base.plan.every(p => p.recipe.id.startsWith('dec'))).toBe(true);
  });

  // The behavior Scenario 2 SHOULD have once anchors are also seeded by
  // overlap potential (how many other corpus recipes share a recipe's
  // ingredients), not value alone. When that lands, implement this and the
  // characterization assertions above should be updated to expect recovery.
  test.todo(
    'overlap-seeded anchors let the beam recover a low-value high-overlap hub (16/16)'
  );
});
