# 📸 Photo Placement Guide for Seed & Spoon NJ

## Where to Put Your Photos

### 🎯 About Page Photos (5 images)

Place these in: **`/public/images/about/`**

```
/public/images/about/
├── problem.jpg          ← Food insecurity photo
├── kitchen.jpg          ← Cooking/kitchen operations
├── distribution.jpg     ← Delivery/distribution
├── volunteers.jpg       ← Team/volunteers
└── impact-graph.png     ← Impact data visualization
```

**What these are used for:**
- These appear on your About page (`/about`)
- Currently showing colorful gradient placeholders
- Will automatically display once you add the files

---

### 🚫 404 Page Photo (1 image)

Place this in: **`/public/assets/`**

```
/public/assets/
└── empty-pantry.png     ← Empty pantry illustration
```

**What this is used for:**
- Appears on 404 error page (when someone visits a non-existent page)
- Currently the image is referenced but not showing

---

## 📋 Step-by-Step Instructions

### If you're on your local computer:

1. **Navigate to your project folder:**
   ```
   seed-and-spoon/public/
   ```

2. **Put About page photos here:**
   ```
   seed-and-spoon/public/images/about/
   ```
   Copy your 5 photos (problem.jpg, kitchen.jpg, distribution.jpg, volunteers.jpg, impact-graph.png)

3. **Put 404 page photo here:**
   ```
   seed-and-spoon/public/assets/
   ```
   Copy empty-pantry.png

### Using the command line (if you have shell access):

```bash
# Navigate to project
cd /home/user/seed-and-spoon

# For About page photos
cp /path/to/your/problem.jpg public/images/about/
cp /path/to/your/kitchen.jpg public/images/about/
cp /path/to/your/distribution.jpg public/images/about/
cp /path/to/your/volunteers.jpg public/images/about/
cp /path/to/your/impact-graph.png public/images/about/

# For 404 page photo
cp /path/to/your/empty-pantry.png public/assets/
```

---

## ✅ How to Verify Photos Are Working

### 1. Check files are in place:
```bash
ls -lh public/images/about/
ls -lh public/assets/
```

You should see your photos listed with their file sizes.

### 2. Test in browser:
```bash
# Start dev server
npm run dev
```

Then visit:
- **About page**: http://localhost:3000/about
  - Should see your photos in all sections
- **404 page**: http://localhost:3000/nonexistent-page
  - Should see empty-pantry.png

### 3. Check if images load directly:
Open in browser:
- http://localhost:3000/images/about/problem.jpg
- http://localhost:3000/images/about/kitchen.jpg
- http://localhost:3000/assets/empty-pantry.png

If you see the images, they're correctly placed!

---

## 🔄 If You Need to Update Photos Later

Just replace the files in the same locations. The filenames must match exactly:
- ✅ `problem.jpg` (lowercase)
- ❌ `Problem.JPG` (wrong case)
- ❌ `problem-photo.jpg` (wrong name)

---

## 📐 Recommended Image Sizes

| Photo | Recommended Size | Format |
|-------|------------------|--------|
| problem.jpg | 1200 x 800 px | JPG |
| kitchen.jpg | 1200 x 800 px | JPG |
| distribution.jpg | 1200 x 800 px | JPG |
| volunteers.jpg | 1200 x 800 px | JPG |
| impact-graph.png | 800 x 600 px | PNG |
| empty-pantry.png | 600 x 600 px | PNG |

**Note:** Images will be automatically optimized by Next.js if you use Next.js Image component (which we'll add if you need real images instead of the current gradient placeholders).

---

## 🚨 Common Issues

### "Image not showing after adding file"
1. Check filename exactly matches (case-sensitive on Linux/Mac)
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Restart dev server (`npm run dev`)
4. Check file format (JPG vs JPEG, PNG vs png)

### "Image is too large / slow to load"
1. Compress images before uploading
2. Keep JPGs under 500KB, PNGs under 200KB
3. Use online tools like TinyPNG or ImageOptim

### "Wrong image displaying"
1. Clear Next.js cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Restart dev server

---

## 📦 After Adding Photos - Commit to Git

Once photos are in place:

```bash
git add public/images/about/* public/assets/empty-pantry.png
git commit -m "Add photos for About and 404 pages"
git push
```

---

**Need help?** Let me know which photos you have and I can help you place them!
