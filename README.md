# Seed & Spoon NJ Website

Building food sovereignty in Essex County—one family, one meal, one skill at a time.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account
- Vercel account (free)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/seed-and-spoon.git
   cd seed-and-spoon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Color Palette

- **Primary Soil**: `#233D00` (Header, footer, main brand)
- **Gradient Green**: `#226214` → `#43CC25` (CTA buttons, highlights)
- **Harvest Orange**: `#FF7A3D` (Secondary CTAs, accents)
- **Leaf Light**: `#A6D47A` (Backgrounds, soft accents)
- **Leaf Mid**: `#6FBF3C` (Icons, dividers)
- **Cream**: `#F8F6F0` (Page backgrounds)
- **Charcoal**: `#1A1A1A` (Body text)

## 📁 Project Structure

```
seed-and-spoon/
├── app/
│   ├── globals.css          # Global styles & color variables
│   ├── layout.jsx            # Root layout with Header/Footer
│   ├── page.jsx              # Homepage
│   ├── programs/            # Programs page (to be created)
│   ├── get-help/            # Get Help page (to be created)
│   ├── volunteer/           # Volunteer page (to be created)
│   ├── donate/              # Donate page (to be created)
│   └── blog/                # Blog section (to be created)
├── components/
│   ├── Header.jsx           # Main navigation
│   └── Footer.jsx           # Footer with links
├── public/
│   ├── assets/
│   │   └── logo/           # Logo files
│   ├── favicon.ico         # Browser tab icon
│   └── apple-icon.png      # iOS icon
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Dependencies
└── jsconfig.json           # Path aliases

```

## 🖼️ Adding Your Logo

1. **Prepare your logo files:**
   - `favicon.ico` (16x16 and 32x32)
   - `apple-icon.png` (180x180)
   - `seed-and-spoon-icon.png` (your icon logo)

2. **Place files:**
   ```
   /public/favicon.ico
   /public/apple-icon.png
   /public/assets/logo/seed-and-spoon-icon.png
   ```

## 🌐 Deploying to Vercel

### First Time Setup

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial Seed & Spoon website"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Wait 2-3 minutes ✅

3. **Add your custom domain**
   - In Vercel dashboard, go to your project
   - Click "Domains"
   - Add `seedandspoon.org`
   - Update Namecheap DNS:
     - A Record: `@` → `76.76.21.98` (or IP shown by Vercel)
     - CNAME: `www` → `cname.vercel-dns.com`

### Updating the Site

Every time you push changes to GitHub, Vercel automatically rebuilds and deploys:

```bash
git add .
git commit -m "Update homepage copy"
git push origin main
```

Wait 1-2 minutes and your changes are live! 🎉

## 📄 Next Steps: Pages to Build

### 1. Programs Page (`/app/programs/page.jsx`)
- Family Food Security Program (6-month cohorts)
- Community Events
- Youth Farming Initiative

### 2. Get Help Page (`/app/get-help/page.jsx`)
- Pre-qualification form
- Full application
- Resource directory

### 3. Volunteer Page (`/app/volunteer/page.jsx`)
- Volunteer roles
- Application form
- Impact stories

### 4. Donate Page (`/app/donate/page.jsx`)
- Payment integration (Stripe/PayPal/CashApp)
- Donation tiers
- Amazon wishlist link

### 5. Blog (`/app/blog/page.jsx`)
- Success stories
- Updates
- Recipes

## 🔧 Technical Notes

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Domain**: seedandspoon.org (via Namecheap)

## 📞 Support

Questions? Issues? Contact info@seedandspoon.org

---

**Built with ❤️ for the community**
