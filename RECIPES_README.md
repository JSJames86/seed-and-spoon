# Recipes Page - Documentation

A modern, accessible, front-end-only recipe browsing experience built with Next.js, React, and Tailwind CSS.

## 📁 Project Structure

```
seed-and-spoon/
├── app/
│   └── recipes/
│       └── page.jsx              # Main recipes page (App Router)
├── components/
│   └── recipes/
│       ├── HeroSection.jsx       # Hero banner component
│       ├── CategoryFilter.jsx    # Category filtering buttons
│       ├── RecipeCard.jsx        # Individual recipe card
│       ├── RecipeGrid.jsx        # Grid layout for recipe cards
│       └── RecipeModal.jsx       # Full recipe details modal
├── data/
│   └── recipes.js                # Recipe data (8 recipes)
├── public/
│   ├── images/
│   │   └── recipes/              # Recipe images go here (TODO)
│   └── styles/
│       └── recipes-fallback.css  # Fallback CSS (if not using Tailwind)
└── __tests__/
    └── recipes/
        └── recipes.test.jsx      # Jest + React Testing Library tests
```

## 🚀 Quick Start

### 1. Installation

The project already has Next.js, React, Tailwind CSS, and framer-motion installed.

If starting fresh, you would run:
```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Then visit: **http://localhost:3000/recipes**

### 3. Build for Production

```bash
npm run build
npm start
```

## 🖼️ Adding Recipe Images

### Image Placement

Recipe images should be placed in:
```
/public/images/recipes/
```

### Naming Convention

Images are referenced in `/data/recipes.js` with this pattern:
- `recipe-1.jpg` → Hearty Vegetable Soup
- `recipe-2.jpg` → Quinoa Buddha Bowl
- `recipe-3.jpg` → Classic Marinara Pasta
- `recipe-4.jpg` → Spicy Black Bean Chili
- `recipe-5.jpg` → Mediterranean Chickpea Salad
- `recipe-6.jpg` → Coconut Curry Lentils
- `recipe-7.jpg` → Roasted Vegetable Medley
- `recipe-8.jpg` → Energy Balls - No Bake

### Image Specifications

For best results:
- **Format:** JPG or WebP
- **Dimensions:** 800x600px minimum (4:3 aspect ratio recommended)
- **File size:** Keep under 200KB for performance
- **Content:** High-quality food photography with good lighting

### TODO: Add Images

**Current Status:** All recipes use placeholder images.

**Action Required:**
1. Add 8 recipe images to `/public/images/recipes/`
2. Name them `recipe-1.jpg` through `recipe-8.jpg`
3. (Optional) Create a placeholder image at `/public/images/recipes/placeholder.jpg` for fallback

## 🎨 Styling Options

### Option 1: Tailwind CSS (Current)

The project currently uses **Tailwind CSS** with custom color palette:
- **Green Primary:** `#4FAF3B`
- **Orange Primary:** `#E86A1D`
- **Neutral Cream:** `#F8F6F0`

Tailwind is configured in `tailwind.config.js` with custom colors and shadows.

### Option 2: Fallback CSS (No Tailwind)

If you want to **remove Tailwind** and use plain CSS:

1. **Use the fallback CSS file:** `/public/styles/recipes-fallback.css`
2. **Import it in your layout:**
   ```jsx
   // In app/layout.jsx or app/recipes/page.jsx
   import '/public/styles/recipes-fallback.css'
   ```
3. **Update component classNames** to use semantic class names (documented in comments within each component)

The fallback CSS provides equivalent styling without Tailwind dependency.

## ✨ Animations

### Current: Framer Motion

The project uses **framer-motion** for smooth animations:
- Page transitions
- Card hover effects
- Modal animations
- Staggered recipe card appearances

### Removing Framer Motion

Each component file includes a **FALLBACK VERSION** comment section showing how to:
1. Remove `framer-motion` imports
2. Replace `motion.*` components with regular HTML elements
3. Use CSS transitions instead

Example locations:
- `/components/recipes/HeroSection.jsx` (lines at bottom)
- `/components/recipes/CategoryFilter.jsx` (lines at bottom)
- `/components/recipes/RecipeCard.jsx` (lines at bottom)
- `/components/recipes/RecipeModal.jsx` (lines at bottom)

## ♿ Accessibility Features

### Keyboard Navigation

- **Tab:** Navigate through category buttons and recipe cards
- **Enter/Space:** Activate focused elements
- **Escape:** Close modal

### Focus Management

- Modal traps focus when open
- Focus returns to trigger element when modal closes
- All interactive elements are keyboard accessible

### Screen Reader Support

- Semantic HTML structure
- ARIA labels and roles
- Live regions for dynamic content updates
- Alt text for images

### WCAG Compliance

- Color contrast ratios meet AA standards
- Focus indicators on all interactive elements
- Proper heading hierarchy

## 🧪 Testing

### Automated Tests

The project includes comprehensive Jest + React Testing Library tests.

#### Setup Testing (if not already configured):

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

#### Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

#### Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

#### Add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

#### Run Tests:

```bash
npm test
```

### Manual Test Plan

If you prefer manual testing, see the comprehensive test plan at the bottom of:
`__tests__/recipes/recipes.test.jsx`

## 📊 Features

### Category Filtering

- **Client-side filtering** (no backend required)
- **Fast & responsive** with React state management
- **4 categories:**
  - All (shows all 8 recipes)
  - Soups & Stews (2 recipes)
  - Salads & Bowls (2 recipes)
  - Pasta & Grains (2 recipes)
  - Sides & Snacks (2 recipes)

### Recipe Cards

- **Lazy-loaded images** for performance
- **Hover animations** for visual feedback
- **Quick info display:**
  - Category
  - Difficulty level (Easy/Medium/Hard)
  - Prep + Cook time
  - Servings
  - Tags (first 3 shown)

### Recipe Modal

- **Full recipe details:**
  - Complete ingredients list
  - Step-by-step instructions
  - Nutrition information
  - All tags
- **Multiple close methods:**
  - Close button
  - Escape key
  - Click outside modal
- **Prevents body scroll** when open
- **Focus management** for accessibility

## 📝 Customization

### Adding More Recipes

Edit `/data/recipes.js` and add new recipe objects following this structure:

```javascript
{
  id: 9,  // Unique ID
  title: "Recipe Name",
  category: "Category Name",  // Must match existing or create new
  difficulty: "Easy",  // Easy | Medium | Hard
  prepTime: "15 min",
  cookTime: "30 min",
  servings: 4,
  description: "Brief description...",
  image: "/images/recipes/recipe-9.jpg",
  ingredients: [
    "Ingredient 1",
    "Ingredient 2"
  ],
  instructions: [
    "Step 1",
    "Step 2"
  ],
  tags: ["tag1", "tag2"],
  nutrition: {
    calories: 300,
    protein: "10g",
    carbs: "40g",
    fat: "8g"
  }
}
```

### Changing Colors

Edit `/tailwind.config.js` to customize the color palette:

```javascript
colors: {
  green: {
    primary: "#4FAF3B",  // Change to your brand color
  },
  // ... other colors
}
```

### Modifying Layout

- **Grid columns:** Edit RecipeGrid.jsx grid classes
- **Card styling:** Edit RecipeCard.jsx component
- **Hero content:** Edit HeroSection.jsx component

## 🚦 Performance Optimizations

1. **Image lazy loading** via Next.js Image component
2. **Client-side filtering** (no API calls)
3. **Memoized filter functions** to prevent unnecessary re-renders
4. **Optimized animations** with framer-motion
5. **No hydration issues** (fully client-side page)

## 🐛 Troubleshooting

### Images Not Loading

1. Check that images exist in `/public/images/recipes/`
2. Verify naming matches `/data/recipes.js` references
3. Check browser console for 404 errors
4. Ensure images are served from `/public` (no `/public` in path)

### Styling Issues

1. If Tailwind not working, check `tailwind.config.js` content paths
2. Verify `app/globals.css` imports Tailwind directives
3. Try the fallback CSS file as alternative

### Tests Failing

1. Ensure all dependencies installed: `npm install`
2. Check jest.config.js exists and is configured correctly
3. Verify jest.setup.js exists
4. Run with `--verbose` flag: `npm test -- --verbose`

### Modal Not Closing with Escape

1. Check browser console for JavaScript errors
2. Verify framer-motion is installed
3. Test with fallback version (no animations)

## 📋 TODO Checklist

Before deploying to production:

- [ ] Add all 8 recipe images to `/public/images/recipes/`
- [ ] Create placeholder.jpg for fallback
- [ ] Test on mobile devices (responsive design)
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Run all automated tests
- [ ] Optimize images (compress to <200KB each)
- [ ] Add more recipes (optional)
- [ ] Consider adding search functionality (future enhancement)
- [ ] Consider adding favorites/bookmarking (future enhancement)

## 🎯 Future Enhancements

Possible additions (not implemented):

1. **Search bar** to filter by recipe name or ingredients
2. **Sorting options** (by prep time, servings, etc.)
3. **Print recipe** functionality
4. **Share recipe** via social media
5. **Save favorites** to localStorage
6. **Dietary filters** (vegan, gluten-free, etc.)
7. **Recipe ratings** and reviews
8. **Nutritional filters** (low-calorie, high-protein)

## 📖 Component API Reference

### HeroSection

```jsx
<HeroSection />
```

No props. Displays hero banner with title and stats.

### CategoryFilter

```jsx
<CategoryFilter
  categories={['All', 'Soups & Stews', ...]}
  activeCategory="All"
  onCategoryChange={(category) => handleChange(category)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| categories | string[] | Array of category names |
| activeCategory | string | Currently selected category |
| onCategoryChange | function | Callback when category changes |

### RecipeGrid

```jsx
<RecipeGrid
  recipes={filteredRecipes}
  onRecipeClick={(recipe) => openModal(recipe)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| recipes | Recipe[] | Array of recipe objects to display |
| onRecipeClick | function | Callback when recipe card is clicked |

### RecipeCard

```jsx
<RecipeCard
  recipe={recipeObject}
  onClick={() => handleClick()}
  index={0}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| recipe | Recipe | Recipe object with all data |
| onClick | function | Callback when card is clicked |
| index | number | Index for staggered animation |

### RecipeModal

```jsx
<RecipeModal
  recipe={selectedRecipe}
  onClose={() => setSelectedRecipe(null)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| recipe | Recipe \| null | Recipe to display, or null to hide modal |
| onClose | function | Callback to close modal |

## 📄 License

This recipes feature is part of the Seed & Spoon project.

## 🤝 Contributing

To add new recipes or improve components:

1. Follow the existing code structure
2. Maintain accessibility standards
3. Add tests for new features
4. Update this README with changes

## 📞 Support

For issues or questions:
- Check the Troubleshooting section above
- Review component comments in source files
- Consult Next.js documentation for framework questions

---

**Built with ❤️ using Next.js 14, React 18, Tailwind CSS, and framer-motion**
