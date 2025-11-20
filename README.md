# Seed & Spoon NJ Website

Building food sovereignty in Essex County—one family, one meal, one skill at a time.

![Dashboard Screenshot](8058b4e6-163b-465b-b629-a1b2c03f468e.jpg)
*Donor Dashboard - Authenticated user view showing profile, donations, and quick actions*

## 🚀 Quick Start

### Prerequisites
- **Frontend**: Node.js 18+ installed
- **Backend**: Python 3.11+, PostgreSQL 16+, Redis
- Git installed
- GitHub account
- Vercel account (free) for frontend deployment

### Local Development

#### Frontend (Next.js)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/seed-and-spoon.git
   cd seed-and-spoon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

#### Backend (Django)

1. **Set up Python virtual environment**
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows
   source venv/bin/activate      # Mac/Linux
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=postgresql://user:password@localhost:5434/seedspoon
   REDIS_URL=redis://localhost:6379
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Start PostgreSQL & Redis (Docker)**
   ```bash
   docker-compose up -d
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser for admin access**
   ```bash
   python manage.py createsuperuser
   # Username: admin
   # Email: admin@seedandspoon.org
   # Password: [choose secure password]
   ```

7. **Start Django server**
   ```bash
   python manage.py runserver
   ```

8. **Access admin portal**
   Navigate to `http://localhost:8000/admin`

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
├── app/                      # Next.js App Router (Frontend)
│   ├── globals.css          # Global styles & color variables
│   ├── layout.jsx           # Root layout with Header/Footer
│   ├── page.jsx             # Homepage
│   ├── about/               # About page
│   ├── campaigns/           # Campaign browsing & detail pages
│   ├── volunteer/           # Volunteer opportunities & application
│   ├── donate/              # Donation page with Stripe
│   ├── login/               # User login
│   ├── signup/              # User registration
│   ├── dashboard/           # User dashboard (donations, profile)
│   └── profile/             # Profile management
├── components/              # React components
│   ├── Header.jsx           # Main navigation with auth
│   ├── Footer.jsx           # Footer with links
│   ├── volunteer/           # Volunteer page components
│   └── campaigns/           # Campaign components
├── contexts/                # React Context providers
│   └── AuthContext.jsx      # Authentication state management
├── core/                    # Django app (Backend)
│   ├── models.py            # Database models (9 models)
│   ├── serializers.py       # DRF serializers (18 serializers)
│   ├── views.py             # Authentication endpoints
│   ├── payment_views.py     # Stripe payment integration
│   ├── campaign_views.py    # Campaign CRUD operations
│   ├── volunteer_views.py   # Volunteer management
│   ├── admin.py             # Django admin configuration
│   └── urls.py              # API URL routing
├── seed_spoon/              # Django project settings
│   ├── settings.py          # Main configuration
│   └── urls.py              # Root URL configuration
├── public/                  # Static assets
│   ├── assets/logo/         # Logo files
│   ├── favicon.ico          # Browser tab icon
│   └── apple-icon.png       # iOS icon
├── docker-compose.yml       # PostgreSQL & Redis containers
├── requirements.txt         # Python dependencies
├── package.json             # Node.js dependencies
├── tailwind.config.js       # Tailwind CSS with brand colors
├── manage.py                # Django management script
└── .env.local / .env        # Environment variables

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

## 🌐 Deployment Guide

This project requires **two separate deployments**: Frontend (Next.js) and Backend (Django).

### Frontend Deployment (Vercel) - FREE

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Enhanced Seed & Spoon with backend integration"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Add Environment Variables:**
     - `NEXT_PUBLIC_API_URL` → `https://your-backend-url.com/api`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - Click "Deploy"
   - Wait 2-3 minutes ✅

3. **Add your custom domain**
   - In Vercel dashboard, go to your project
   - Click "Domains"
   - Add `seedandspoon.org`
   - Update DNS settings as instructed by Vercel

### Backend Deployment Options (Choose One)

#### Option 1: Render (Recommended - FREE with limitations)

**Pros:** Easy setup, free PostgreSQL included, auto-deploy from GitHub
**Cons:** Spins down after 15min inactivity (1-2 sec wake time)

1. **Create account at [render.com](https://render.com)**

2. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: `seedspoon-db`
   - Free tier ✅
   - Copy the Internal Database URL

3. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your GitHub repository
   - Name: `seedspoon-api`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn seed_spoon.wsgi:application`
   - **Add Environment Variables:**
     ```
     DEBUG=False
     SECRET_KEY=[generate random 50-char string]
     DATABASE_URL=[paste from step 2]
     ALLOWED_HOSTS=your-app-name.onrender.com
     STRIPE_SECRET_KEY=sk_live_...
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
   - Deploy ✅

4. **Run Migrations**
   - In Render dashboard → Shell
   - Run: `python manage.py migrate`
   - Run: `python manage.py createsuperuser`

5. **Update Vercel Environment**
   - Go back to Vercel project settings
   - Update `NEXT_PUBLIC_API_URL` to `https://your-app-name.onrender.com/api`
   - Redeploy frontend

#### Option 2: Railway (Easy - $5/month after free credit)

**Pros:** No sleep, faster, includes PostgreSQL & Redis
**Cons:** ~$5/month after free $5 credit runs out

1. **Create account at [railway.app](https://railway.app)**

2. **Create New Project**
   - Connect GitHub repository
   - Railway auto-detects Django
   - Adds PostgreSQL automatically

3. **Add Environment Variables** (same as Render above)

4. **Deploy automatically happens** ✅

5. **Get deployment URL** and update Vercel's `NEXT_PUBLIC_API_URL`

#### Option 3: Full Free Stack (Advanced)

**Frontend:** Vercel or Cloudflare Pages (free)
**Backend:** Render Free or PythonAnywhere (free, limited)
**Database:** Neon PostgreSQL (free 0.5GB serverless)
**File Storage:** Cloudflare R2 (free 10GB)
**Redis:** Upstash (free 10k requests/day)

See `DEPLOYMENT.md` for detailed instructions.

### Updating After Deployment

**Frontend Updates:**
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Vercel auto-deploys in 1-2 minutes ✅

**Backend Updates:**
```bash
git add .
git commit -m "Add API endpoint"
git push origin main
```
Render/Railway auto-deploys in 3-5 minutes ✅

### Important: Webhook Configuration

After deploying backend, configure Stripe webhook:
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-url.com/api/donations/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret and update backend environment variable

## ✅ Completed Features

### Authentication & User Management
- ✅ User registration with validation
- ✅ Login/logout with JWT tokens
- ✅ User dashboard with profile & donation history
- ✅ Password reset functionality
- ✅ Protected routes

### Campaign Management
- ✅ Campaign browsing page with filtering
- ✅ Campaign detail pages with progress tracking
- ✅ Admin campaign creation form
- ✅ Organization management
- ✅ Role-based permissions (Super-admin, Org-admin, Donor)

### Donation System
- ✅ Stripe payment integration
- ✅ One-time donations
- ✅ Recurring donation support
- ✅ Donation receipts
- ✅ Anonymous donation option
- ✅ Campaign-specific donations

### Volunteer Management
- ✅ Dynamic volunteer opportunities (13 roles from database)
- ✅ Volunteer application form with file upload
- ✅ Application status tracking
- ✅ Admin review interface
- ✅ Filtering by day, category, paid/unpaid

### Admin Features
- ✅ Django admin portal for super-admins
- ✅ Organization admin assignment
- ✅ Volunteer opportunity management
- ✅ Application review system
- ✅ Campaign analytics

## 📄 Future Enhancements

### Phase 1: UI Improvements
- [ ] Custom admin dashboard in Next.js (replace Django admin)
- [ ] Enhanced analytics & reporting
- [ ] Email notifications for donations & applications
- [ ] PDF receipt generation

### Phase 2: Additional Features
- [ ] Programs page (Family Food Security, Youth Farming)
- [ ] Get Help page with resource directory
- [ ] Blog/success stories section
- [ ] Event calendar
- [ ] Amazon wishlist integration

### Phase 3: Advanced Features
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Automated tax receipt generation
- [ ] Donor CRM features (engagement scoring, retention)
- [ ] Impact metrics dashboard

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 14.2.33 (App Router)
- **UI**: React 18, Tailwind CSS 3.3.6
- **State Management**: React Context API
- **Authentication**: JWT with djangorestframework-simplejwt
- **HTTP Client**: Fetch API
- **Deployment**: Vercel

### Backend
- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL 16 (via Docker)
- **Cache**: Redis 7 (via Docker)
- **Authentication**: JWT (djangorestframework-simplejwt 5.3.1)
- **Payments**: Stripe Python SDK 8.2.0
- **Task Queue**: Celery 5.3.6 (for background jobs)
- **WSGI Server**: Gunicorn 21.2.0 (production)
- **Deployment**: Render/Railway (recommended)

### Database Models
1. **Organization** - Nonprofit organizations (31 fields)
2. **DonorProfile** - CRM & donor data (27 fields)
3. **Campaign** - Fundraising campaigns (21 fields)
4. **Donation** - One-time donations (18 fields)
5. **RecurringDonation** - Subscription management (15 fields)
6. **DonationReceipt** - Tax documentation (13 fields)
7. **OrganizationAdmin** - Role-based access control (7 fields)
8. **VolunteerOpportunity** - Admin-managed volunteer roles (14 fields)
9. **VolunteerApplication** - Application submissions with review (20 fields)

### API Endpoints
- **Authentication**: `/api/auth/*` (register, login, logout, profile, password reset)
- **Campaigns**: `/api/campaigns/*` (list, detail, create, update, progress, stats)
- **Organizations**: `/api/organizations/*` (list, detail, create, update)
- **Donations**: `/api/donations/*` (checkout, webhook, success)
- **Volunteers**: `/api/volunteers/*` (opportunities, applications, management)

## 🔐 Admin Access

**Django Admin Portal:** `http://localhost:8000/admin` (development) or `https://your-backend-url.com/admin` (production)

**Default Super Admin (created during setup):**
- Username: `admin`
- Password: Set during `createsuperuser` command

**Capabilities:**
- Manage all organizations, campaigns, and users
- Review volunteer applications
- Create/edit volunteer opportunities
- Assign organization admins
- View donation reports

## 🤝 Contributing to This Fork

This is an enhanced fork with backend integration. To merge enhancements back to the main repository:

1. **Test all features locally** (both frontend and backend)
2. **Document any new environment variables** in `.env.example`
3. **Update migration files** if database schema changed
4. **Test deployment** on free tier (Vercel + Render)
5. **Create pull request** with detailed changelog

**Key Changes in This Fork:**
- Added Django backend with 9 database models
- Integrated Stripe payment processing
- Built authentication system with JWT
- Created volunteer management system (dynamic from database)
- Added role-based access control (Super-admin, Org-admin, Donor)
- Configured Docker for local development
- Added comprehensive API documentation

## 📞 Support

Questions about this fork? Issues with setup? Contact the fork maintainer or create a GitHub issue.

Original project contact: info@seedandspoon.org

---

**Built with ❤️ for the community by volunteers helping volunteers**
