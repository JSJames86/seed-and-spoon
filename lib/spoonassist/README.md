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

## `mealLeverageEngine.js` — Household Food Coverage Engine (v0.2, formerly MLE)

Optimizes for a *household*, not a recipe: "what should I buy today so I can
cook all week?" Used by `app/api/spoonassist/meal-plan/route.js` and
`app/api/spoonassist/recipe-import/route.js`.

### Two scorers, two altitudes (§2)

- **Marginal scorer (`mealLeverageScore`, §2a)** — builds a single candidate
  plan, greedily, picking the next purchase by each recipe's *marginal*
  completion bundle:

  ```
  MLS(recipe) = (servings * nutrition^nutritionWeight * depletion * preference) / bundleCost
  ```

  - `bundleCost` is the cost of just the recipe's *missing* ingredients
    (`shortfall()`), priced via the injected `priceBasket(missing, storeId)`.
  - `bundleCost <= 0` (fully covered by pantry/cart already) → `MLS =
    Infinity`, so free pantry meals are always cooked first.
  - `preference == 0` on any ingredient (`household_prefs.weight = 0`, a hard
    dislike) → `MLS = 0`, skipping the recipe entirely.
  - `depletionBonus()` adds +0.25 per ingredient that's within
    `pantry_items.expires_in_days <= 3` ("use it before it rots").

- **Plan scorer (`scoreCoveragePlan`, §2b)** — selects between *finished*
  candidate plans built by the beam search (`buildCoveragePlans`):

  ```
  planScore = 0.50*coverageScore + 0.20*nutritionScore
            + 0.20*overlapScore  + 0.10*preferenceScore
            - 0.40*wastePenalty
  ```

  - `coverageScore` — servings produced / servings needed, capped at 1.
  - `nutritionScore` — mean `recipe.nutrition` across the plan's recipes.
  - `overlapScore` — share of ingredient-uses contributed by ingredients
    shared across >=2 plan recipes ("the moat" — leverage made visible).
  - `preferenceScore` — mean of `min(1, prefMultiplier)` across plan recipes.
  - `wastePenalty` — share of $ spent on "orphan" ingredients (bought for,
    and used by, only one recipe in the plan). Subtracted, so orphan-heavy
    plans actually lose.

  Marginal builds; plan judges.

### Nourishment floor (§2 — a gate, not a weight)

`passesNourishmentFloor(recipe)` rejects any recipe with `nutrition <
NOURISHMENT_FLOOR` (0.4) from the candidate pool *before* optimization, so a
cheap "buttered noodles" recipe can never be dragged in by price alone. This
gate is applied to `recipes` in `runMealLeverageEngine`, but never to a
user-imported `recipeIn` (§9) — an imported recipe is pinned regardless of its
flat `IMPORTED_RECIPE_NUTRITION` score.

### Beam search (`buildCoveragePlans` / `selectBestCoveragePlan`)

"Compare plans against plans" without enumerating every basket:

- If `pinnedRecipe` is given (§9 recipe-in), it's the only seed — the pin
  itself is the constraint, so there's nothing to vary.
- Otherwise, builds one unseeded plan plus one plan per "anchor" recipe, each
  pinned first via `planBuyList`'s `pinnedRecipe`. Duplicate resulting plans
  (same recipe-id set) are collapsed.

#### Anchor seeding (`BEAM_WIDTH - 1` slots, value + overlap interleaved)

Anchors fill `BEAM_WIDTH - 1` slots by interleaving two rankings of eligible
recipes (`mls > 0` against a flat cost of 1, i.e. not a hard preference skip):

- **VALUE** — top recipes by marginal score against a flat cost of 1
  (`servings * nutrition^w * depletion * preference`), a cost-agnostic proxy
  for "inherently high-value" since real cost depends on pantry state that
  only exists once a recipe is pinned.
- **OVERLAP POTENTIAL** — top recipes by, for each of their ingredients, how
  many *other* eligible recipes also use that ingredient, summed across the
  recipe. High potential means pinning this recipe makes the most *other*
  recipes cheaper next.

The two rankings are interleaved (value, overlap, value, overlap, ...,
skipping recipes already chosen) until the slots are full. Value-only seeding
strands low-value "hub" recipes: a cheap, non-overlapping recipe out-scores
the hub on its own marginal value, so the hub never gets a seeded plan and
the beam never sees what buying it would unlock (`buildCoveragePlans` has no
lookahead beyond the seeds it actually builds). Interleaving guarantees a
high-overlap hub gets a seed slot even when its standalone value wouldn't earn
one — see `__tests__/spoonassist/beamSearchOverlap.test.js`.

Each candidate is scored with `scoreCoveragePlan`; `selectBestCoveragePlan`
picks the highest `planScore` (ties favor the earlier/unseeded candidate).

### The greedy-recompute loop (`planBuyList`)

Repeatedly picks the highest-MLS affordable recipe, moves its ingredients
from "missing" into "owned" (pantry + cart), and recomputes. Overlap isn't a
rule — it emerges: buying rice for one recipe makes every other rice recipe
cheaper (and its MLS higher) on the next pass. Loops until
`servingsNeeded = household.size * household.dinnersNeeded` is met or nothing
affordable adds a meal (a gap).

`pinnedRecipe` (§9 recipe-in / beam-search anchors) is committed *before* the
loop starts, regardless of budget — its cost can drive `budgetLeft` negative,
and the loop fills in *around* it with whatever budget remains (comparing
against `max(budgetLeft, 0)` so pantry-covered recipes stay pickable).

### The gap branch & Gap Report (§5 — "never just say you need $X")

When the winning plan ends with `gapServings > 0`, `verdict.gap` reports:

```
{ neededServings, coveredServings, shortfallServings, additionalCost,
  bridge, storeSwitch, bridgeRequest, referral }
```

- `findBridgeBuy()` continues the same greedy loop with no budget cap, to
  report the *extra* spend (`bridge.extraCost`) that would close the gap.
- `evaluateStoreSwitch()` re-runs `planBuyList` at an alternate store (with a
  flat `tripCost`) to see if switching stores closes the gap within budget.
- **Community Bridge (`buildBridgeRequest`)**: if neither closes the gap and
  `0 < bridge.extraCost <= DONATION_THRESHOLD` ($15), mint a `bridgeRequest`
  shaped to drop directly into the *existing* Stripe/Resend donor flow
  (`donationCheckoutSchema` — `POST /api/donations/checkout`). Not new
  infrastructure: `bridgeRequest.donation` is `{ amount, currency: 'usd',
  interval: 'one_time' }`, with `amount = max(100, round(extraCost * 100))` to
  satisfy the schema's $1.00 minimum.
- Otherwise (including `extraCost === 0`, meaning nothing affordable was even
  found), `referral` points to Seed & Spoon's own `/get-help` —
  `seed_and_spoon_referral`.

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

### Recipe-in (§9 — `runMealLeverageEngine({ recipeIn, householdId })`)

Recipe-in is *not* a separate engine — it's the same `runMealLeverageEngine`
with `recipeIn` set to a pinned recipe (typically built from an imported
recipe; see `recipeImport.js`/`ingredientResolver.js` below). `recipeIn` flows
into `buildCoveragePlans` as `pinnedRecipe`, is committed first by
`planBuyList`, and its servings come off `servingsNeeded` before the rest of
the plan fills in. `householdId` only matters for stamping a Community Bridge
request (§5) with the household it's for.

`buildRecipeInResult` reshapes the pinned plan entry plus whatever the rest of
the plan adds on top of it into `verdict.recipeIn`:

```
{ name, have, need, cost, missing, unlocks, unlocksServings }
```

`have`/`need` are this recipe's own pantry coverage and shopping list;
`unlocks`/`unlocksServings` are the *other* recipes the rest of the budget
unlocks once this one is cooked.

### Recipe corpus

`recipes` rows with `nutrition IS NOT NULL` are the engine's corpus (seeded in
`supabase/migrations/20260614000003_meal_leverage_seed_recipes.sql`).
`recipe_ingredients.quantity`/`unit` for these rows MUST already be in the
ingredient's `canonical_ingredients.standard_unit` — `shortfall()` compares
recipe amounts directly against `pantry_items.remaining`, with no conversion
hop at plan time.

## `ingredientResolver.js` / `recipeImport.js` — §9 recipe-in: JSON-LD import + resolution seam

`app/api/spoonassist/recipe-import/route.js` ("recipe-in" entry mode) takes a
user-supplied recipe URL and turns it into a `pinnedRecipe` for
`runMealLeverageEngine({ recipeIn })`.

### `recipeImport.js` — JSON-LD extraction + SSRF-conscious fetch

- `extractRecipeFromHtml(html)` — pure, network-free. Regex-extracts every
  `<script type="application/ld+json">` block, `JSON.parse`s it (skipping
  malformed blocks), and finds the first node with `@type` (or `@type[]`)
  including `"Recipe"` — including nodes nested inside `@graph`. Normalizes to
  `{ name, recipeIngredient: string[], servings: number|null, image:
  string|null }`, returning `null` if `name` or `recipeIngredient` is missing.
- `fetchAndExtractRecipe(url)` — fetches a user-supplied URL and runs it
  through `extractRecipeFromHtml`. Each redirect hop (`redirect: 'manual'`,
  capped at `MAX_REDIRECTS = 3`) is independently validated before connecting:
  only `http`/`https`, and `dns.lookup(hostname, { all: true })` must resolve
  to *only* public addresses (private/loopback/link-local/CGNAT/multicast
  ranges, both IPv4 and IPv6, are rejected — fail closed on anything
  unrecognizable). A per-hop `AbortSignal.timeout` (8s) and custom
  `User-Agent` are applied. Returns `{ recipe, sourceUrl }` or `{ error,
  status? }`, with error codes (`invalid_url`, `unsupported_protocol`,
  `blocked_address`, `dns_lookup_failed`, `fetch_failed`,
  `unsupported_content_type`, `no_recipe_found`, `too_many_redirects`) mapped
  to HTTP statuses by the route's `FETCH_ERROR_STATUS`.

### `ingredientResolver.js` — the "resolution seam"

Maps each raw `recipeIngredient` line (e.g. `"1 lb boneless chicken thighs"`)
onto a `canonical_ingredients` row + standard-unit quantity, in three steps:

1. `parseIngredientString` + `normalizeIngredient` (both from
   `priceEngine.js`) turn the line into `{ quantity, unit, name }` and then a
   normalized phrase (e.g. `"chicken thigh"`).
2. Match the normalized phrase to a canonical: first via the
   `ingredient_aliases` table (`alias -> canonical_id`, for phrasing with no
   shared substring — e.g. `"scallion"` → Onion, pasta shapes → Pasta), then
   by substring containment against `canonical_ingredients.name` (e.g.
   `"chicken thigh"` <-> `"Chicken Thighs"`).
3. Convert the parsed quantity/unit to the canonical's `standard_unit` (`oz`
   or `each`) via the `ingredient_conversions` table — identity if the units
   already match.

`resolveIngredientLine(raw, ctx)` returns `{raw, resolved:true, canonicalId,
name, amount, unit, isEstimate}` or `{raw, resolved:false, reason, ...}`, with
`reason` one of `unparsable`, `free_ingredient` (e.g. "drippings" —
normalizes to `null`), `no_canonical_match`, or `no_unit_conversion`.
`resolveRecipeIngredients(rawLines, ctx)` resolves a full ingredient list,
merging lines that resolve to the same canonical (summing amounts) and
collecting the rest as `unresolved` for the route's response.

`buildAliasMap(rows)` / `buildConversionMap(rows)` build the `Map`s
`resolveIngredientLine` expects from `ingredient_aliases` /
`ingredient_conversions` rows (seeded in
`supabase/migrations/20260614000004_coverage_engine_v2.sql`).

## `app/api/spoonassist/recipe-import/route.js` — POST recipe-in

Body: `{ url, householdId, zipCode?, storeId?, budget? }` (budget defaults to
0 — "what does this recipe cost, and what does it unlock?" doesn't require
one).

1. `fetchAndExtractRecipe(url)` → normalized `{ name, recipeIngredient,
   servings, image }` or a `FETCH_ERROR_STATUS`-mapped error.
2. `resolveRecipeIngredients(...)` → resolved ingredients (→ `pinnedRecipe`)
   + `unresolved` lines, returned to the caller either way.
3. `pinnedRecipe = { id: "imported:<sourceUrl>", name, servings (defaults to
   DEFAULT_IMPORTED_SERVINGS = 4), nutrition: IMPORTED_RECIPE_NUTRITION (0.6),
   ingredients }`.
4. `runMealLeverageEngine({ ..., recipeIn: pinnedRecipe, householdId })` — the
   same §7 verdict shape as `meal-plan`, plus `recipeIn` (§9), `importedRecipe:
   { name, sourceUrl, image, servings }`, and `unresolved`.

## `provenance.js` — 5 Loaves Pilot: event logging & provenance model

Pure, DB-free math for the pilot's resilience metric: *what share of a
household's meals come from their own resources, vs. 5 Loaves deliveries?*
Schema lives in
`supabase/migrations/20260615000001_five_loaves_provenance.sql`
(`acquisition_lots`, `meal_events`, `consumption_events`,
`requirement_events`, plus the `acquisition_source` enum), which extends §3
(pantry availability) with an event log.

### The one invariant

Provenance lives on the `acquisition_lots` row and **never changes**. A lot is
one ingredient, from one source, at one time. `pre_existing` is written
**once**, at the intake pantry tap — after that, nothing is ever
`pre_existing` again, and no job anywhere re-tags a lot's `source`. Pantry
availability is `Σ qty_remaining` across a household's lots; it has no source
of its own. This is what makes "5 Loaves food from last week became 'existing
stock'" impossible by construction.

### `drawFromLots(lots, ingredientId, qtyNeeded)` — the attribution rule

Strict FIFO by `acquired_at`, **source-blind**: oldest food first, regardless
of which `acquisition_source` it came from. Models real kitchen behavior and
can't be tuned to flatter the metric. Mutates each drawn lot's `qtyRemaining`
in place and returns `{ draws: {lotId, source, qty}[], shortfall }` —
`draws[i].source` is how a `consumption_events` row inherits its lot's
provenance.

Honest consequence: intake `pre_existing` lots are oldest, so early weeks show
a high own-resource share that *dips* as that baseline depletes. A share that
*rises* again afterward can only come from `self_purchase` (or, in Phase 3,
`regenerative`) — the real resilience signal.

### `attributeMeal({ items, servings })` / `rollUpWeeklyShares(...)` — the two lines

`attributeMeal` splits one meal's consumed value by source:

```
ownShare      = Σ value where source in (pre_existing, self_purchase, regenerative) / Σ value
deliveredShare = Σ value where source == five_loaves_delivery / Σ value
ownServings = servings * ownShare
deliveredServings = servings * deliveredShare
```

`value` is the PriceEngine cost of each consumed item; if *any* item's value
is unresolvable, the whole meal falls back to ingredient-slot counting (each
item weighted 1) rather than mixing $ and slot counts. A third source
(`food_pantry`) counts toward neither line by design — the two shares need not
sum to 1.

`rollUpWeeklyShares(mealAttributions, totalServings)` sums `ownServings` /
`deliveredServings` across a set of meals into the week's two trend lines —
**own-resource share** (resilience) and **delivery-dependence share**
(dependence). Report both, never collapsed to one number: a rising own-share
only means something if delivery-share isn't simultaneously backfilling it.

### Denominator guard

`meal_events.planned_in_app` flags whether a meal came through the planner —
`rollUpWeeklyShares`'s `totalServings` should be the sum over the same
app-tracked meals. Pair the result with the weekly `app_coverage` survey line
("what share of dinners did you track in the app?") and report the metric as
"share among app-tracked meals (covering ~X% of dinners)" — never as if it
covered every meal the household ate.
