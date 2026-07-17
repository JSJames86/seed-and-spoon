# About Page Customization Guide

Complete guide to editing and customizing the About page (`app/about/page.jsx`).

## 📝 Quick Start: Editing Content

All editable content is stored in the `CONTENT` object at the top of `app/about/page.jsx`. You can update text and URLs there **without touching any layout code**.

**Before editing:** Seed & Spoon is pre-launch (incorporated Feb 3, 2026; 501(c)(3) determination pending; 5 Loaves pilot not yet delivering meals). Every claim on this page must be true as published — no invented stats, no present-tense claims about programs that haven't launched. Check `CONTENT.whereWeAre` for the current honest status before adding anything that implies otherwise.

### Structure Overview

```javascript
const CONTENT = {
  meta: { /* SEO settings */ },
  hero: { /* Title, subtitle, CTAs */ },
  problem: { /* The weekend nutrition gap */ },
  whoWeAre: { /* Org origin story + founder's note */ },
  building: { /* 5 Loaves + SpoonAssist program descriptions */ },
  readyBeforeDayOne: { /* "Ready before day one" checklist */ },
  accountability: { /* How we hold ourselves accountable */ },
  whereWeAre: { /* Honest status block — done vs. in progress */ },
  getInvolved: { /* Sponsor / Volunteer / Partner cards */ },
  faq: { /* FAQ questions & answers */ },
  schema: { /* Structured data for SEO */ },
};
```

## 🎨 Brand Colors

The following Seed & Spoon brand colors are configured in `tailwind.config.js`:

| Color Name | Hex Code | Tailwind Class | Usage |
|------------|----------|----------------|-------|
| **Brand Orange** | `#EA802F` | `bg-brand-orange` `text-brand-orange` | Primary CTAs, accents |
| **Brand Blue** | `#0B88C2` | `bg-brand-blue` `text-brand-blue` | Links, secondary elements |
| **Brand Green** | `#77A462` | `bg-brand-green` `text-brand-green` | Success states, nature themes |
| **Brand Cream** | `#F9EED4` | `bg-brand-cream` `text-brand-cream` | Backgrounds, soft contrast |
| **Brand Navy** | `#02538A` | `bg-brand-navy` `text-brand-navy` | Dark accents, headers |
| **Brand Sky** | `#5CC8EE` | `bg-brand-sky` `text-brand-sky` | Light accents, highlights |

## 📋 Common Editing Tasks

### 1. Update the honest status block

**Location**: `CONTENT.whereWeAre.items`

Each item is `{ done: true|false, text: '...' }`. `done: true` renders ✅, `done: false` renders 🔄. Update this block the moment a milestone actually lands (e.g. 501(c)(3) determination arrives, NJ charity registration clears, pilot launches) — this is the section funders and journalists will check against public filings.

### 2. Update FAQ answers

**Location**: `CONTENT.faq.questions`

The tax-deductibility and "who can receive food" answers are written for pending-501(c)(3) / pre-pilot status. Update them (and `whereWeAre`) together once the determination letter arrives or the pilot opens enrollment — don't let one section fall out of sync with the other.

### 3. Update Get Involved CTAs

**Location**: `CONTENT.getInvolved.cards`

Each card has `buttonUrl`. Current targets: `/give` (sponsorship tiers), `/volunteer` (interest list), `/partners/community` (partner inquiries).

### 4. Update SEO Metadata

**Location**: `CONTENT.meta`

### 5. Update Organization Schema Data

**Location**: `CONTENT.schema`

This structured data helps search engines understand the organization. Keep `description` accurate to the current program model — it should never describe activity (e.g. "food rescue," meal distribution) that hasn't actually started.

## ♿ Accessibility Features

1. **Semantic HTML**: Uses `<section>`, `<article>`, `<header>`, `<h1>`-`<h3>`, etc.
2. **ARIA attributes**: `aria-expanded` / `aria-controls` on the FAQ accordion, `aria-label` on CTA buttons.
3. **Keyboard navigation**: FAQ accordion fully keyboard accessible (Enter/Space to toggle).
4. **Focus indicators**: Visible focus rings on interactive elements.

## 🧪 Testing Your Changes

1. Save `app/about/page.jsx`
2. Run `npm run dev` and open `http://localhost:3000/about`
3. Check responsiveness on mobile, tablet, and desktop
4. Test keyboard navigation through the FAQ accordion
5. Verify all internal links (`/give`, `/volunteer`, `/partners/community`, `/impact`, `/resources/reports`)

## 🚀 Before Publishing Any Update

- [ ] Every stat or claim is currently true — no forward dates stated as done
- [ ] `whereWeAre` and the FAQ tax/enrollment answers are consistent with each other
- [ ] Internal links resolve to real pages
- [ ] Schema.org `description` matches the actual program model

---

**Page Location**: `/app/about/page.jsx`
**Tailwind Config**: `/tailwind.config.js`
