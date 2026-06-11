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

## `config.js` — feature flags

`FEATURES` exposes which price/integration tiers are active based on which
env vars are set (`KROGER_CLIENT_ID`/`SECRET`, `INSTACART_API_KEY`).
