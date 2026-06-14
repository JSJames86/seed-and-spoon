# SpoonAssist server-side libs

## `instacart.js` — Instacart Developer Platform (IDP) helpers

Shared by the three Instacart routes:

- `app/api/instacart_list/route.js` — "Create Recipe Page"
  (`POST /idp/v1/products/recipe`)
- `app/api/instacart_shopping_list/route.js` — "Create Shopping List Page"
  (`POST /idp/v1/products/products_link`)
- `app/api/instacart_retailers/route.js` — nearby retailers
  (`GET /idp/v1/retailers`)

### Key scoping

All three routes call `requireInstacartApiKey()` before doing any work. If
`INSTACART_API_KEY` isn't set, it returns a ready-to-send `503
{ "error": "Instacart integration not configured" }` response, so a missing
key always surfaces as "not configured" rather than a generic 500 or an
inconsistent 200-with-empty-data.

### Base URL / env override

`getInstacartBaseUrl()` picks the Instacart Connect host:

- Defaults to `https://connect.instacart.com` when `NODE_ENV === 'production'`
  and `https://connect.dev.instacart.tools` otherwise.
- `INSTACART_API_BASE_URL` overrides this entirely, so a deployment can be
  pinned to the sandbox API while `INSTACART_API_KEY` is still pending IDP
  approval, regardless of `NODE_ENV`.

### Unit normalization

`normalizeUnit()` / `UNIT_MAP` translate recipe shorthand (e.g. `t`, `tbsp`,
`fl oz`, `pinch`) into the unit strings Instacart's `measurements` /
`line_item_measurements` fields expect. Notable mappings:

- `t` → `teaspoon` (not `tablespoon` — `tbsp`/`tbs`/`tblsp` cover tablespoon)
- `pinch` / `dash` → `each` (Instacart has no sub-teaspoon unit)

### Affiliate linkback

`buildAffiliateUrl()` appends Impact affiliate UTM params to the
`products_link_url` Instacart returns, when `INSTACART_IMPACT_PARTNER_ID` is
set.

### Recipe images

`toAbsoluteImageUrl()` resolves a site-relative recipe image path (e.g.
`/images/recipes/cranberry-orange-sauce.jpg`) against `SITE_URL` /
`NEXT_PUBLIC_SITE_URL` into the absolute URL Instacart requires for
`image_url`. See `public/images/recipes/instacart/README.md` for the
500x500 image convention.

## `priceEngine.js` — recipe cost estimation

Resolves per-ingredient prices (Kroger live → Supabase cache/community →
USDA NJ baseline → generic estimate) and totals them per store.

`priceFromPackage()` scales a package price to the recipe's quantity. For
"each"-priced items (eggs, produce sold per unit, etc.) it divides by the
package's `pkgQty` first — e.g. 12 eggs against a 12-count carton
(`{ pkg: 3.99, pkgQty: 12, pkgUnit: 'each' }`) costs one carton (~$3.99),
not 12 cartons (~$47.88).

`getStoresByZip()` returns Kroger-family stores first (live, geocoded), then
fills remaining slots from `UNIVERSAL_CHAINS`/`NJ_CHAINS`. Those static
candidates are passed through `googlePlacesClient.filterChainsByZip()` to
drop chains with no real location near the ZIP.

## `googlePlacesClient.js` — geo-matching for static chain fallbacks

Geocodes a ZIP via Zippopotam.us (free) and runs a Google Places Nearby
Search (New) for `grocery_store`/`supermarket` places within ~25 miles,
requesting only Basic-tier fields (`places.displayName`). Chain names from
`UNIVERSAL_CHAINS`/`NJ_CHAINS` are matched against the results so a ZIP only
shows chains that actually have a nearby location — pricing for matched
chains stays multiplier-based.

Returns `null` when `GOOGLE_PLACES_API_KEY` is unset or the lookup fails, so
`getStoresByZip()` falls back to the unfiltered static list.

## `config.js` — feature flags

`FEATURES` exposes which price/integration tiers are active based on which
env vars are set (`KROGER_CLIENT_ID`/`SECRET`, `INSTACART_API_KEY`,
`GOOGLE_PLACES_API_KEY`).

## `mealLeverageEngine.js` — Meal Leverage Engine (MLE)

Optimizes for a *household*, not a recipe: "what should I buy today so I can
cook all week?" Used by `app/api/spoonassist/meal-plan/route.js`.

### The Meal Leverage Score (MLS)

```
MLS(recipe) = (servings * nutrition^nutritionWeight * depletion * preference) / bundleCost
```

- `bundleCost` is the cost of just the recipe's *missing* ingredients
  (`shortfall()`), priced via the injected `priceBasket(missing, storeId)`.
- `bundleCost <= 0` (fully covered by pantry/cart already) → `MLS = Infinity`,
  so free pantry meals are always cooked first.
- `preference == 0` on any ingredient (`household_prefs.weight = 0`, a hard
  dislike) → `MLS = 0`, skipping the recipe entirely.
- `depletionBonus()` adds +0.25 per ingredient that's within
  `pantry_items.expires_in_days <= 3` ("use it before it rots").

### The greedy-recompute loop (`planBuyList`)

Repeatedly picks the highest-MLS affordable recipe, moves its ingredients
from "missing" into "owned" (pantry + cart), and recomputes. Overlap isn't a
rule — it emerges: buying rice for one recipe makes every other rice recipe
cheaper (and its MLS higher) on the next pass. Loops until
`servingsNeeded = household.size * household.dinnersNeeded` is met or nothing
affordable adds a meal (a gap).

### The gap branch (`findBridgeBuy` / `evaluateStoreSwitch`)

When `planBuyList` ends with `gapServings > 0`:

- `findBridgeBuy()` continues the same greedy loop with no budget cap, to
  report the *extra* spend that would close the gap.
- `evaluateStoreSwitch()` re-runs `planBuyList` at an alternate store (with a
  flat `tripCost`) to see if switching stores closes the gap within budget.
- If neither closes it, the output includes a `seed_and_spoon_referral` to
  `/get-help` — the unclosed gap routes to Seed & Spoon's own pantry network
  instead of a dead end.

### `priceBasket(missing, storeId)`

The one injected dependency, wrapping `priceEngine.js`'s
`resolveIngredientPrice()`/`calculateRecipeCost()`:
`(missing: {id, amount, unit}[], storeId) => Promise<{ total, items: {id, amount, unit, price}[] }>`.

### SNAP/WIC variant (`runMealLeverageEngine({ snap })`)

Same engine, different framing: `budget = snap.balance`,
`dinnersNeeded = min(snap.daysUntilReload, MAX_SNAP_DINNERS)`,
`nutritionWeight = SNAP_NUTRITION_WEIGHT` (squares the nutrition term so
benefits buy sustenance over filler), and recipes with `snap_eligible = false`
(hot/prepared food) are excluded.

### Recipe corpus

`recipes` rows with `nutrition IS NOT NULL` are the MLE corpus (seeded in
`supabase/migrations/20260614000003_meal_leverage_seed_recipes.sql`).
`recipe_ingredients.quantity`/`unit` for these rows MUST already be in the
ingredient's `canonical_ingredients.standard_unit` — `shortfall()` compares
recipe amounts directly against `pantry_items.remaining`, with no conversion
hop at plan time.
