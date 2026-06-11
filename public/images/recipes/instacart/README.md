# Instacart recipe images (500x500)

Square, 500x500px JPG/PNG copies of the recipe photos in
`public/images/recipes/`, sized for the Instacart Developer Platform (IDP)
"Create Recipe Page" API (`POST /idp/v1/products/recipe`, `image_url` field).

Instacart recommends a square image of at least 500x500px; images that are
too small, non-square, or unreachable cause Instacart to ignore `image_url`
and render the recipe page without a hero image.

## Naming convention

Match the `slug` used in `data/recipes.js`, e.g.:

```
cranberry-orange-sauce.jpg
sausage-apple-stuffing.jpg
cajun-turkey.jpg
mashed-potatoes.jpg
cajun-turkey-gravy.jpg
green-beans.jpg
moist-cornbread.jpg
sweet-potato-pecan-pie.jpg
```

## How these are used

1. Each recipe in `data/recipes.js` has an `instacartImage` field pointing
   here, alongside its on-site `image`.
2. `app/spoonassist/page.jsx` sends `selectedRecipe.instacartImage` (falling
   back to `selectedRecipe.image`) as `imageUrl` in the `/api/instacart_list`
   request body.
3. `lib/spoonassist/instacart.js`'s `toAbsoluteImageUrl()` resolves that
   site-relative path against `SITE_URL` / `NEXT_PUBLIC_SITE_URL` (Instacart
   requires an absolute URL) and sets `payload.image_url`.

Generated via `sharp` with `resize(500, 500, { fit: 'cover', position:
'centre' })` from the source images in `public/images/recipes/`. Re-run that
crop if a recipe's source photo changes.
