# Empty Pantry Illustration

## 404 Page Image Asset

**File**: `empty-pantry.png`
**Location**: `/public/assets/`
**Usage**: Custom 404 Not Found page (`app/not-found.jsx`)

---

## Image Specifications

### Required Dimensions
- **Width**: 600-800 pixels
- **Height**: 400-600 pixels (portrait or square orientation works well)
- **Format**: PNG (with transparency) or JPG

### Visual Style
- **Tone**: Warm, hopeful, and inviting (not sad or desperate)
- **Content**: An empty pantry shelf or cupboard
- **Style Options**:
  - Hand-drawn illustration (friendly, approachable)
  - Flat design with Seed & Spoon brand colors
  - Simple line art with soft colors
  - Minimalist vector graphic

### Brand Colors to Use
Consider incorporating these Seed & Spoon brand colors:
- Green: `#77A462` (primary)
- Cream: `#F9EED4` (backgrounds)
- Orange: `#EA802F` (accents)
- Blue: `#0B88C2` (secondary accents)

---

## Design Suggestions

### Option 1: Empty Shelf Illustration
- Simple wooden shelf with a few empty spaces
- Maybe one or two items remaining (a can, a jar)
- Warm lighting suggesting hope and community
- Small plant or basket as a decorative element

### Option 2: Open Cupboard
- Friendly open cupboard doors
- Clean, organized but empty shelves
- Maybe a small note or sign that says "Refilling soon!"
- Window in background with sunshine coming through

### Option 3: Abstract/Minimal
- Simple line drawing of shelves
- Geometric shapes representing empty spaces
- Brand colors as accents
- Modern, clean aesthetic

---

## Current Status

⚠️ **Placeholder Image Required**

The 404 page is currently live but references `/assets/empty-pantry.png` which does not yet exist. The page will function without it, but the image area will show a broken image icon.

### To Add the Image:

1. Create or source an illustration matching the specs above
2. Save it as `empty-pantry.png`
3. Place it in `/public/assets/`
4. Verify it displays correctly by navigating to a non-existent page (e.g., `/test-404`)

---

## Alternative: Use Emoji or Icon Temporarily

If you need a quick placeholder, you can modify `app/not-found.jsx` to use an emoji or icon instead:

```jsx
{/* Replace the <img> tag with: */}
<div className="mt-6 text-9xl">
  🏪
</div>
{/* or */}
<div className="mt-6 text-9xl">
  📦
</div>
```

---

## Stock Image Resources

If creating custom artwork isn't feasible, consider these resources:
- **Unsplash**: https://unsplash.com/ (search: "empty shelf", "pantry", "cupboard")
- **Pexels**: https://www.pexels.com/ (free stock photos)
- **Undraw**: https://undraw.co/ (free customizable illustrations)
- **Freepik**: https://www.freepik.com/ (free vectors, check license)

---

## Accessibility Note

The current image includes descriptive alt text:
```jsx
alt="Illustration of an empty pantry shelf with a warm, hopeful style."
```

If you change the image content, update the alt text accordingly to maintain accessibility.

---

**Last Updated**: 2025-10-30
**Page Location**: `/app/not-found.jsx`
