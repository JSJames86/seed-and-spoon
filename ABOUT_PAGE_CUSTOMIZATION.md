# About Page Customization Guide

Complete guide to editing and customizing your About page (`app/about/page.jsx`).

## 📝 Quick Start: Editing Content

All editable content is stored in the `CONTENT` object at the top of `app/about/page.jsx` (lines 9-350). You can update text, statistics, URLs, and more **without touching any layout code**.

### Structure Overview

```javascript
const CONTENT = {
  meta: { /* SEO settings */ },
  hero: { /* Hero section content */ },
  problem: { /* Problem statement */ },
  solution: { /* Solution & model */ },
  values: { /* Core principles */ },
  operations: { /* How we operate */ },
  impact: { /* Impact metrics & transparency */ },
  faq: { /* FAQ questions & answers */ },
  cta: { /* Call-to-action buttons */ },
  schema: { /* Structured data for SEO */ },
};
```

## 🎨 Brand Colors

### Available Brand Colors

The following Seed & Spoon brand colors are configured in `tailwind.config.js` and ready to use:

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Brand Orange** | `#EA802F` | `bg-brand-orange` `text-brand-orange` | Primary CTAs, accents |
| **Brand Blue** | `#0B88C2` | `bg-brand-blue` `text-brand-blue` | Links, secondary elements |
| **Brand Green** | `#77A462` | `bg-brand-green` `text-brand-green` | Success states, nature themes |
| **Brand Cream** | `#F9EED4` | `bg-brand-cream` `text-brand-cream` | Backgrounds, soft contrast |
| **Brand Navy** | `#02538A` | `bg-brand-navy` `text-brand-navy` | Dark accents, headers |
| **Brand Sky** | `#5CC8EE` | `bg-brand-sky` `text-brand-sky` | Light accents, highlights |

### Using Brand Colors

In your JSX, use Tailwind utility classes:

```jsx
{/* Background color */}
<div className="bg-brand-orange">...</div>

{/* Text color */}
<h1 className="text-brand-blue">...</h1>

{/* Border color */}
<div className="border-brand-green border-4">...</div>

{/* Hover states */}
<button className="bg-brand-orange hover:bg-brand-navy">...</button>
```

### Inline Style Override (if needed)

For one-off color needs, use inline styles:

```jsx
<div style={{ backgroundColor: '#EA802F', color: '#FFFFFF' }}>
  Custom colored element
</div>
```

## 📋 Common Editing Tasks

### 1. Update Hero Statistics

**Location**: `CONTENT.hero.stats` (line ~38)

```javascript
stats: [
  { number: '500K+', label: 'Meals Rescued', color: 'green' },
  { number: '15K', label: 'Volunteers Mobilized', color: 'orange' },
  { number: '200+', label: 'Partner Organizations', color: 'blue' },
],
```

**To update**: Change the `number` or `label` values.

### 2. Edit Problem Statement

**Location**: `CONTENT.problem` (line ~45)

Update the challenges array to modify the problem statement:

```javascript
challenges: [
  {
    title: 'Food Insecurity',
    stat: '1 in 10 New Jersey residents',
    description: 'Over 900,000 people in our state...',
    impact: 'Hunger doesn't just mean empty stomachs...',
  },
  // ... second challenge
],
```

### 3. Modify "How It Works" Steps

**Location**: `CONTENT.solution.howItWorks` (line ~86)

Each step has:
- `step`: Number label ("01", "02", etc.)
- `title`: Step heading
- `description`: Main explanation
- `details`: Array of bullet points

```javascript
{
  step: '01',
  title: 'Rescue Surplus Food',
  description: 'We partner with grocery stores...',
  details: ['Daily pickup routes', 'Real-time tracking', '...'],
},
```

### 4. Update Impact Metrics

**Location**: `CONTENT.impact.metrics.stats` (line ~217)

```javascript
stats: [
  { label: 'Meals Prepared & Distributed', value: '523,400', icon: '🍽️' },
  { label: 'Pounds of Food Rescued', value: '287,000', icon: '♻️' },
  // ... more stats
],
```

**To update**: Change the `value` to your current numbers. These are displayed prominently in the Impact section.

### 5. Update Financial Breakdown

**Location**: `CONTENT.impact.financials.breakdown` (line ~230)

```javascript
breakdown: [
  {
    category: 'Kitchen Operations & Food Costs',
    percent: 62,
    description: 'Commercial kitchen rental, ingredients...'
  },
  // ... more categories
],
```

**To update**: Adjust `percent` values and descriptions to match your actual spending.

### 6. Add or Edit FAQ Questions

**Location**: `CONTENT.faq.questions` (line ~261)

```javascript
questions: [
  {
    question: 'Who can receive food from Seed & Spoon NJ?',
    answer: 'Anyone who needs a meal can access our services...',
  },
  // Add more questions here
],
```

**To add a new question**: Copy the object structure and add to the array.

### 7. Change Call-to-Action Buttons

**Location**: `CONTENT.cta.actions` (line ~305)

```javascript
actions: [
  {
    title: 'Donate',
    description: 'Fund meals, kitchen operations...',
    buttonText: 'Make a Donation',
    buttonUrl: '/donate',
    isPrimary: true,
    color: 'orange',
  },
  // ... more actions
],
```

**To update**: Change `buttonText`, `buttonUrl`, or `color` values.

### 8. Update SEO Metadata

**Location**: `CONTENT.meta` (line ~12)

```javascript
meta: {
  title: 'About Us - Seed & Spoon NJ | Fighting Food Insecurity',
  description: 'Learn how Seed & Spoon NJ rescues surplus food...',
  ogImage: '/assets/logo-transparent.png',
},
```

**To update**: Change title, description, and Open Graph image path.

### 9. Update Organization Schema Data

**Location**: `CONTENT.schema` (line ~333)

This structured data helps search engines understand your organization:

```javascript
schema: {
  organizationName: 'Seed & Spoon NJ',
  url: 'https://seedandspoon.org',
  logo: 'https://seedandspoon.org/assets/logo-transparent.png',
  email: 'info@seedandspoon.org',
  telephone: '+1-555-SPOON-NJ',
  address: {
    streetAddress: '123 Community Way',
    addressLocality: 'Newark',
    addressRegion: 'NJ',
    postalCode: '07102',
    addressCountry: 'US',
  },
},
```

**To update**: Replace placeholder values with your actual contact info and address.

## 🖼️ Adding Real Images

The page currently uses gradient placeholders. To add real images:

1. **Add image files** to `/public/images/about/`:
   - `problem.jpg`
   - `kitchen.jpg`
   - `distribution.jpg`
   - `volunteers.jpg`
   - `impact-graph.png`

2. **Update the code** (in section components around lines 400-600):

Replace gradient placeholder `<div>` elements with Next.js `<Image>` components:

**Before (placeholder):**
```jsx
<div className="relative h-64 bg-gradient-to-br from-orange-400 to-orange-600">
  <div className="absolute inset-0 flex items-center justify-center text-white text-6xl opacity-50">
    🍽️
  </div>
</div>
```

**After (real image):**
```jsx
<Image
  src="/images/about/kitchen.jpg"
  alt="Volunteers preparing fresh meals in our commercial kitchen"
  width={1200}
  height={800}
  className="rounded-lg shadow-xl object-cover"
  priority={false}
/>
```

**Important**: Add `import Image from 'next/image';` at the top if not already present.

## ♿ Accessibility Features

The page includes several accessibility best practices:

1. **Semantic HTML**: Uses `<section>`, `<article>`, `<header>`, `<h1>`-`<h3>`, etc.
2. **ARIA attributes**:
   - `aria-expanded` on FAQ accordions
   - `aria-controls` for accordion relationships
   - `aria-label` on CTA buttons for context
3. **Keyboard navigation**: FAQ accordion fully keyboard accessible (Enter/Space to toggle)
4. **Focus indicators**: Visible focus rings on interactive elements
5. **Alt text**: All image placeholders include guidance for descriptive alt text

## 🧪 Testing Your Changes

After editing the CONTENT object:

1. **Save the file** (`app/about/page.jsx`)
2. **Run the dev server**:
   ```bash
   npm run dev
   ```
3. **Open in browser**: `http://localhost:3000/about`
4. **Check responsiveness**: Test on mobile, tablet, and desktop sizes
5. **Test keyboard navigation**: Tab through the page, test FAQ accordion with Enter key
6. **Validate links**: Ensure all CTA buttons point to correct URLs

## 🚀 Production Checklist

Before deploying to production:

- [ ] Replace all placeholder statistics with real data
- [ ] Update schema.org contact information with actual details
- [ ] Add real images (or keep placeholders if acceptable)
- [ ] Replace placeholder phone number and email
- [ ] Verify all internal links (`/donate`, `/volunteer`, `/contact`)
- [ ] Test on multiple devices and browsers
- [ ] Run accessibility audit (Lighthouse, axe DevTools)
- [ ] Check SEO meta tags in browser inspector
- [ ] Confirm Impact Report PDF link (or remove if not ready)

## 📞 Need Help?

If you encounter issues or need custom modifications beyond the CONTENT object:

1. Review the component functions at the bottom of the file (lines 400+)
2. Check Tailwind CSS documentation: https://tailwindcss.com/docs
3. Next.js Image component docs: https://nextjs.org/docs/app/api-reference/components/image
4. React hooks (useState) docs: https://react.dev/reference/react/useState

---

**Last Updated**: 2025-10-30
**Page Location**: `/app/about/page.jsx`
**Tailwind Config**: `/tailwind.config.js`
