# About Page Image Assets

This directory contains images used on the About page (`/about`).

## Required Images

Please add the following images to this directory:

### 1. **problem.jpg**
- **Usage**: Problem section (food insecurity illustration)
- **Recommended size**: 1200 x 800 px
- **Content**: Photo showing food insecurity or community need (respectful, dignified)
- **Alt text example**: "Community members receiving nutritious meals"

### 2. **kitchen.jpg**
- **Usage**: Solution section - Step 2 (cooking operations)
- **Recommended size**: 1200 x 800 px
- **Content**: Volunteers or staff preparing meals in commercial kitchen
- **Alt text example**: "Volunteers preparing fresh meals in our commercial kitchen"

### 3. **distribution.jpg**
- **Usage**: Solution section - Step 4 (delivery operations)
- **Recommended size**: 1200 x 800 px
- **Content**: Meal distribution, delivery van, or community distribution site
- **Alt text example**: "Volunteer delivering meal packages to community distribution site"

### 4. **volunteers.jpg**
- **Usage**: Values or operations section
- **Recommended size**: 1200 x 800 px
- **Content**: Group of volunteers working together (diverse, welcoming)
- **Alt text example**: "Diverse team of volunteers packing meals together"

### 5. **impact-graph.png**
- **Usage**: Impact section (optional data visualization)
- **Recommended size**: 800 x 600 px
- **Content**: Chart or infographic showing growth in meals served over time
- **Alt text example**: "Graph showing 500,000+ meals served since 2020"

## Image Guidelines

- **Format**: JPG for photos, PNG for graphics with transparency
- **Quality**: High resolution, web-optimized (compressed but crisp)
- **Accessibility**: All images should have meaningful alt text
- **Ethics**:
  - Obtain proper releases/permissions for photos with identifiable people
  - Avoid photos that could stigmatize or disrespect food recipients
  - Show dignity, community, and empowerment

## Current Status

**Note**: The page currently uses gradient placeholders with emoji icons. These placeholders will be automatically replaced when you add the actual image files to this directory.

## Quick Image Updates

To update images in the About page code (`app/about/page.jsx`):

1. Add your image files to this directory
2. In the page code, find the placeholder `<div>` elements with gradient backgrounds
3. Replace them with Next.js `<Image>` components:

```jsx
<Image
  src="/images/about/kitchen.jpg"
  alt="Volunteers preparing fresh meals in our commercial kitchen"
  width={1200}
  height={800}
  className="rounded-lg shadow-xl"
  priority={false}
/>
```

## Stock Photo Resources (if needed)

- Unsplash: https://unsplash.com/ (search: "food bank", "community kitchen", "volunteers")
- Pexels: https://www.pexels.com/ (search: "food donation", "meal preparation")
- Always check licenses and attribution requirements
