# SpoonAssist Frontend

**SpoonAssist** is a grocery price comparison tool integrated into Seed & Spoon. It helps users compare prices across local stores for any recipe, enabling them to make informed shopping decisions and save money.

## Features

- **Recipe Selection**: Choose from pre-loaded recipes or paste custom recipe text
- **Smart Parsing**: Automatically parse ingredients with quantities, units, and fractions
- **Store Finder**: Locate nearby grocery stores by ZIP code
- **Price Comparison**: Compare ingredient prices across multiple stores
- **Dietary Filters**: Filter by Gluten-Free, Low-Carb, Diabetic, or Vegan preferences
- **CSV Export**: Download shopping lists with price comparisons
- **Responsive Design**: Works seamlessly on mobile and desktop

## Project Structure

```
app/spoonassist/
├── page.jsx          # Main SpoonAssist page with state management
├── layout.jsx        # Layout with metadata and styling
└── README.md         # This file

components/spoonassist/
├── RecipeDropdown.jsx       # Recipe selection dropdown
├── RecipeTextInput.jsx      # Recipe text parser with regex support
├── IngredientTable.jsx      # Editable ingredient table with scaling
├── StoreSelector.jsx        # ZIP code store finder with multi-select
├── DietaryFilters.jsx       # Toggle buttons for dietary preferences
├── CostResultsTable.jsx     # Price comparison table with highlights
└── CSVExportButton.jsx      # CSV export functionality

public/spoonassist/
├── logo.png          # SpoonAssist logo
├── icon.png          # App icon
└── favicon.ico       # Favicon
```

## API Integration

The frontend expects the following backend API endpoints:

### 1. GET /api/recipes/
Fetches available recipes.

**Response:**
```json
{
  "recipes": [
    {
      "id": "recipe-1",
      "name": "Healthy Breakfast Bowl",
      "ingredients": [
        {
          "name": "oats",
          "quantity": 1,
          "unit": "cup"
        },
        {
          "name": "banana",
          "quantity": 1,
          "unit": "each"
        }
      ]
    }
  ]
}
```

### 2. GET /api/stores/?zip=XXXXX
Finds stores near a ZIP code.

**Query Parameters:**
- `zip`: 5-digit ZIP code

**Response:**
```json
{
  "stores": [
    {
      "id": "store-1",
      "name": "ShopRite",
      "address": "123 Main St, City, NJ",
      "distance": 2.3
    },
    {
      "id": "store-2",
      "name": "Whole Foods",
      "address": "456 Oak Ave, City, NJ",
      "distance": 3.1
    }
  ]
}
```

### 3. POST /api/calc_recipe_cost/
Calculates costs for ingredients across stores.

**Request:**
```json
{
  "ingredients": [
    {
      "name": "oats",
      "quantity": 1,
      "unit": "cup"
    },
    {
      "name": "banana",
      "quantity": 2,
      "unit": "each"
    }
  ],
  "storeIds": ["store-1", "store-2"],
  "dietaryFilters": ["gluten-free", "vegan"]
}
```

**Response:**
```json
{
  "costData": [
    {
      "ingredient": "oats",
      "quantity": 1,
      "unit": "cup",
      "storePrices": [
        {
          "storeName": "ShopRite",
          "price": 0.89
        },
        {
          "storeName": "Whole Foods",
          "price": 1.29
        }
      ]
    },
    {
      "ingredient": "banana",
      "quantity": 2,
      "unit": "each",
      "storePrices": [
        {
          "storeName": "ShopRite",
          "price": 0.79
        },
        {
          "storeName": "Whole Foods",
          "price": 0.99
        }
      ]
    }
  ]
}
```

## Environment Variables

Set `NEXT_PUBLIC_API_BASE_URL` if your API is hosted separately:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.seedandspoon.org
```

If not set, defaults to `/api` (same domain).

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:3000/spoonassist](http://localhost:3000/spoonassist)

4. **Test the workflow:**
   - Select or paste a recipe
   - Review ingredients
   - Enter ZIP code and find stores
   - Select dietary preferences
   - Calculate costs
   - Export CSV

## Subdomain Deployment

The SpoonAssist page is designed to work on the subdomain:

**https://spoonassist.seedandspoon.org**

### Vercel Configuration

The CNAME for `spoonassist.seedandspoon.org` is already configured. The page will automatically serve on this subdomain when deployed.

### Cloudflare DNS

Ensure the CNAME record points to your Vercel deployment:
```
spoonassist.seedandspoon.org → CNAME → cname.vercel-dns.com
```

## Ingredient Parser

The `RecipeTextInput` component includes a robust parser that supports:

- **Fractions**: ½, ⅓, ¼, ¾, 1/2, 2/3, etc.
- **Mixed numbers**: 1 1/2, 2 1/4
- **Decimals**: 0.5, 1.25, 2.33
- **Units**: cup, cups, tbsp, tsp, oz, lb, g, kg, each, pinch, dash, whole
- **Bullet points**: Automatically strips - • * from list items

**Example input:**
```
2 cups flour
1/2 tsp salt
3 eggs
1 lb chicken breast
```

**Parsed output:**
```json
[
  { "name": "flour", "quantity": 2, "unit": "cups" },
  { "name": "salt", "quantity": 0.5, "unit": "tsp" },
  { "name": "eggs", "quantity": 3, "unit": "each" },
  { "name": "chicken breast", "quantity": 1, "unit": "lb" }
]
```

## QA Checklist

### Functional Tests

- [ ] Page loads at `/spoonassist` without errors
- [ ] Logo and favicon display correctly
- [ ] Recipe dropdown populates from `/api/recipes/`
- [ ] Selecting a recipe loads ingredients into table
- [ ] Pasting recipe text and clicking "Parse & Add Ingredients" works
- [ ] Ingredient parser handles fractions (½, 1/2) correctly
- [ ] Ingredient table allows adding, editing, and removing rows
- [ ] Serving scale multiplier works (e.g., 2x doubles all quantities)
- [ ] ZIP code input validates 5-digit format
- [ ] "Find Stores" button fetches stores from API
- [ ] Store checkboxes allow multi-select
- [ ] "Select All" / "Deselect All" toggles all stores
- [ ] Dietary filter buttons toggle active state
- [ ] "Calculate Costs" button is disabled when ingredients or stores are empty
- [ ] Loading states display during API calls
- [ ] Error banners appear for failed API calls
- [ ] Price comparison table displays correctly with all stores
- [ ] Cheapest prices are highlighted in green
- [ ] Total row shows correct sums per store
- [ ] Overall cheapest store is highlighted
- [ ] CSV export downloads with correct filename format
- [ ] CSV contains all ingredients, prices, and totals

### Responsive Design

- [ ] Page is usable on mobile (320px width)
- [ ] Tables scroll horizontally on small screens
- [ ] Buttons and inputs are touch-friendly
- [ ] Text is readable without zooming
- [ ] Layout adapts to tablet (768px) and desktop (1024px+)

### Subdomain Deployment

- [ ] Page loads at `https://spoonassist.seedandspoon.org`
- [ ] HTTPS certificate is valid
- [ ] Assets load correctly from `/spoonassist/` path
- [ ] Favicon appears in browser tab
- [ ] No console errors on production build

## Styling

Uses **Tailwind CSS** for styling:
- Green theme for primary actions (Calculate, Find Stores)
- Color-coded dietary filters (Yellow, Blue, Purple, Green)
- Responsive grid layouts with `md:` breakpoints
- Shadow and border utilities for depth
- Hover states for interactive elements

## Troubleshooting

### Issue: Recipes don't load
- Check `/api/recipes/` endpoint is returning valid JSON
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check browser console for CORS errors

### Issue: Stores not found
- Ensure `/api/stores/?zip=XXXXX` endpoint works
- Verify ZIP code is valid 5-digit format
- Check if backend has store data for the region

### Issue: Cost calculation fails
- Verify `/api/calc_recipe_cost/` endpoint accepts POST
- Check request payload matches expected format
- Ensure `Content-Type: application/json` header is sent

### Issue: CSV export is empty
- Confirm `costData` state is populated after calculation
- Check browser console for errors during export
- Verify file download isn't blocked by browser

## Future Enhancements

- [ ] Save favorite recipes to user account
- [ ] Share shopping lists via link
- [ ] Add nutritional information
- [ ] Support for recipe photos
- [ ] Real-time price updates
- [ ] Store coupons and deals integration
- [ ] Mobile app version

## Support

For issues or questions, contact the Seed & Spoon development team or open an issue in the repository.

---

**Built with Next.js 14, React 18, and Tailwind CSS**
