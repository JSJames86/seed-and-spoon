# 🚀 Seed & Spoon Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Add Your Logo Files
- [ ] Place your logo icon in `/public/assets/logo/seed-and-spoon-icon.png`
- [ ] Create `favicon.ico` (16x16, 32x32) and place in `/public/`
- [ ] Create `apple-icon.png` (180x180) and place in `/public/`

### 2. Test Locally
```bash
npm install
npm run dev
```
- [ ] Visit http://localhost:3000
- [ ] Check that logo displays in header
- [ ] Check all sections load properly
- [ ] Test mobile menu works

## 🌐 Deploy to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Complete Seed & Spoon website rebuild"
git push origin main
```

### Step 2: Connect Vercel
1. [ ] Go to [vercel.com/new](https://vercel.com/new)
2. [ ] Click "Import Git Repository"
3. [ ] Select your `seed-and-spoon` repository
4. [ ] Click "Deploy" (no settings needed!)
5. [ ] Wait 2-3 minutes for build to complete

### Step 3: Add Custom Domain
1. [ ] In Vercel, go to your project → Settings → Domains
2. [ ] Add `seedandspoon.org`
3. [ ] Vercel will show you DNS records to add

### Step 4: Update Namecheap DNS
1. [ ] Log into Namecheap
2. [ ] Go to your domain → Advanced DNS
3. [ ] Add/Update these records:
   - **A Record**: Host `@`, Value: (IP shown by Vercel, likely `76.76.21.98`)
   - **CNAME**: Host `www`, Value: `cname.vercel-dns.com`
4. [ ] Save changes
5. [ ] Wait 5-15 minutes for DNS propagation

### Step 5: Verify SSL
- [ ] Visit `https://seedandspoon.org`
- [ ] Confirm green padlock 🔒 appears
- [ ] Check site loads properly

## 🎉 You're Live!

Your site is now:
✅ Deployed on Vercel
✅ Using your custom domain
✅ SSL secured (HTTPS)
✅ Auto-deploying on every GitHub push

## 📝 Next Steps

### Immediate:
- [ ] Add Google Analytics (if desired)
- [ ] Set up email forwarding (info@seedandspoon.org)
- [ ] Test all social media links work

### Soon:
- [ ] Build out remaining pages (Programs, Get Help, Volunteer, Donate, Blog)
- [ ] Integrate payment processing (Stripe/PayPal)
- [ ] Add contact forms
- [ ] Set up blog CMS

### Future:
- [ ] Client portal/dashboard
- [ ] Volunteer management system
- [ ] Automated email responses

## 🆘 Troubleshooting

**Logo not showing?**
- Check file path: `/public/assets/logo/seed-and-spoon-icon.png`
- Make sure it's pushed to GitHub
- Clear browser cache

**Domain not working?**
- Wait 15-30 minutes for DNS propagation
- Check DNS records in Namecheap match Vercel's requirements
- Try visiting from incognito/private window

**Build failing?**
- Check Vercel build logs for errors
- Verify all files are committed to GitHub
- Make sure `package.json` has correct dependencies

**Still stuck?**
- Check Vercel's documentation: https://vercel.com/docs
- GitHub issues in Next.js repo
- Or reach out for help!

---

## 🔄 How to Update Your Site

Every time you make changes:

```bash
# Make your edits to files
git add .
git commit -m "Description of changes"
git push origin main
```

Vercel automatically rebuilds and deploys in 1-2 minutes! 🎉
