# Seed & Spoon - Nonprofit Donation Platform

## 🎯 Project Overview

A full-stack donation platform for nonprofit organizations built with Django REST Framework (backend) and Next.js (frontend). Features comprehensive authentication, campaign management, Stripe payment processing, and donor management.

---

## 📸 Dashboard Preview

![Dashboard](docs/dashboard-preview.png)

**User Dashboard Features:**
- ✅ Profile overview with email, phone, member since date
- ✅ Total donations tracking
- ✅ Active recurring donations management
- ✅ Complete donation history
- ✅ Quick action buttons (Set up monthly giving, Make first donation)
- ✅ Edit profile functionality

---

## 🚀 Tech Stack

**Backend:**
- Django 5.0.1 + Django REST Framework 3.14.0
- PostgreSQL 16 (Docker)
- Redis 7 (Docker) - Celery broker
- JWT Authentication (djangorestframework-simplejwt)
- Stripe 8.2.0 - Payment processing
- Celery 5.3.6 - Background tasks

**Frontend:**
- Next.js 14.2.33 (App Router)
- React 18.2.0
- Tailwind CSS 3.3.6
- Prisma 6.19.0 - Type-safe ORM
- Stripe.js 19.3.0

---

## 🏗️ Architecture

### Database Models
1. **Organization** - Nonprofit organizations (31 fields)
   - EIN, contact info, Stripe account integration
   - Mission, website, social media
   
2. **DonorProfile** - Donor CRM data (27 fields)
   - Linked to Django User model
   - Engagement scores, lifecycle status
   - Communication preferences, donation history
   
3. **Campaign** - Fundraising campaigns (21 fields)
   - Goals, progress tracking, matching donations
   - Impact metrics, featured status
   
4. **Donation** - One-time donations (18 fields)
   - Stripe integration, payment tracking
   - Anonymous donation support
   
5. **RecurringDonation** - Subscription donations (15 fields)
   - Frequency management, payment history
   
6. **DonationReceipt** - Tax receipts (13 fields)
   - IRS-compliant documentation

### API Endpoints

**Authentication (`/api/auth/`)**
- `POST /register` - User registration
- `POST /login` - User login (JWT tokens)
- `POST /logout` - User logout
- `GET /me` - Current user profile
- `PUT /profile` - Update profile
- `POST /change-password` - Change password
- `POST /password-reset` - Request password reset
- `POST /password-reset-confirm` - Confirm password reset
- `GET /donations/` - User donation history
- `GET /recurring-donations/` - User recurring donations

**Payments (`/api/donations/`)**
- `POST /checkout` - Create Stripe checkout session
- `POST /webhook/` - Stripe webhook handler
- `GET /campaigns` - List campaigns for donation
- `GET /organizations` - List organizations

**Campaign Management (`/api/campaigns/`)**
- `GET /` - List all campaigns
- `GET /<slug>` - Campaign detail
- `POST /create` - Create campaign (org admin)
- `PUT /<slug>/update` - Update campaign (org admin)
- `GET /<slug>/progress` - Campaign progress stats
- `GET /<slug>/stats` - Campaign analytics

**Organization Management (`/api/organizations/`)**
- `GET /` - List all organizations
- `GET /<slug>` - Organization detail
- `POST /create` - Create organization (superadmin)
- `PUT /<slug>/update` - Update organization (org admin)

---

## 🔐 Authentication Flow

### Registration
1. User fills signup form (username, email, password, name, phone)
2. Frontend sends POST to `/api/auth/register`
3. Backend validates password requirements:
   - ✅ Minimum 8 characters
   - ✅ Not a common password
   - ✅ Not too similar to username/email
   - ✅ Not entirely numeric
4. Creates User + DonorProfile
5. Returns JWT tokens (access + refresh)
6. Auto-login and redirect to dashboard

### Login
1. User enters username/password
2. Frontend sends POST to `/api/auth/login`
3. Backend authenticates and returns JWT tokens
4. Tokens stored in localStorage
5. User state managed via React Context

### Protected Routes
- Dashboard, Profile, Campaign Creation require authentication
- JWT token sent in Authorization header
- Token refresh handled automatically

---

## 🎨 UI/UX Features

**Navigation:**
- Responsive header with scroll-based styling
- Dark text on light background (scrolled)
- White text with drop shadow on transparent background (hero)
- Mobile hamburger menu with full-screen overlay

**Forms:**
- Large, prominent buttons (py-4 px-6)
- Enhanced shadows and hover effects
- Smooth transitions and scale animations
- Clear disabled states with cursor feedback
- Focus rings for accessibility

**Campaign Browsing:**
- Grid layout with filters (organization, type)
- Progress bars with percentage
- Matching donation badges
- Featured campaign indicators
- Responsive design (mobile/tablet/desktop)

**Colors:**
- Primary Green: #4FAF3B
- Orange: #E86A1D
- Cream Background: #F8F6F0
- Charcoal Text: #1A1A1A
- Leaf Light: #A6D47A

---

## 🤝 Volunteer System

### Current Implementation
The volunteer page is **currently informational only** - no authentication required.

**Flow:**
1. User visits `/volunteer` (public access)
2. Views 7 volunteer roles with schedules:
   - Planners/Admins (Mon-Fri)
   - Shoppers (Tue & Fri)
   - Preppers (Wed)
   - Cooks (Thu)
   - Drivers/Delivery (Fri)
   - Cleaners (Wed-Fri, paid position)
   - Youth Trainees (Wed-Thu)
3. Filters by day, category, or type
4. Fills volunteer application form
5. Form submits (currently frontend only)

**No Authentication Integration Yet:**
- ❌ Applications not stored in database
- ❌ No user volunteer history tracking
- ❌ No volunteer management dashboard
- ❌ No shift scheduling system

### Recommended Future Enhancement

**Volunteer Model Structure:**
\`\`\`python
class VolunteerApplication(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)  # Optional for logged-in users
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    roles = models.JSONField()  # Selected volunteer roles
    availability = models.TextField()
    status = models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ...])
    created_at = models.DateTimeField(auto_now_add=True)

class VolunteerShift(models.Model):
    volunteer = models.ForeignKey(User)
    role = models.CharField(max_length=100)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ...])
\`\`\`

**Enhanced Flow (if implementing):**
1. **Logged-in users:** Auto-fill form with profile data
2. **Guest users:** Can still apply, manually enter info
3. **After submission:** 
   - Store application in database
   - Send confirmation email
   - Org admin reviews and approves
4. **Approved volunteers:**
   - Access volunteer dashboard
   - View upcoming shifts
   - Check-in/check-out tracking
   - Volunteer hour tracking
5. **Org admins:**
   - Manage volunteer applications
   - Schedule shifts
   - Track volunteer hours
   - Generate volunteer reports

---

## 💳 Payment Integration (Stripe)

### Setup
1. Get Stripe API keys from [dashboard.stripe.com](https://dashboard.stripe.com)
2. Add to `.env`:
   \`\`\`
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   \`\`\`
3. Add to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   \`\`\`

### Test Cards
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- Any future expiry date, any 3-digit CVC

### Webhook Testing
**Option 1: Stripe CLI**
\`\`\`bash
stripe listen --forward-to localhost:8000/api/payments/webhook/
\`\`\`

**Option 2: ngrok**
\`\`\`bash
ngrok http 8000
# Add ngrok URL to Stripe dashboard webhooks
\`\`\`

---

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 22+
- Docker Desktop
- Git

### Installation

**1. Clone repository:**
\`\`\`bash
git clone https://github.com/fergtech/seed-and-spoon.git
cd seed-and-spoon
\`\`\`

**2. Start Docker containers:**
\`\`\`bash
docker-compose up -d
\`\`\`

**3. Backend setup:**
\`\`\`bash
# Create virtual environment
python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
\`\`\`

**4. Frontend setup:**
\`\`\`bash
# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start Next.js dev server
npm run dev
\`\`\`

**5. Access application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

---

## 📝 Environment Variables

### `.env` (Backend - Django)
\`\`\`env
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=seed_spoon
DB_USER=postgres
DB_PASSWORD=postgres_dev_password
DB_HOST=localhost
DB_PORT=5434
STRIPE_SECRET_KEY=sk_test_...
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
\`\`\`

### `.env.local` (Frontend - Next.js)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
\`\`\`

---

## 🧪 Testing

### Backend Tests
\`\`\`bash
python manage.py test
\`\`\`

### Frontend Tests
\`\`\`bash
npm run test
\`\`\`

### End-to-End Testing
1. Start both servers
2. Create test account at `/signup`
3. Test donation flow:
   - Browse campaigns at `/campaigns`
   - Click campaign → Donate Now
   - Complete Stripe checkout (test card)
   - Verify webhook processing in Django logs
   - Check donation appears in `/dashboard`

---

## 📦 Deployment

### Backend (Django)
- Render, Railway, or AWS Elastic Beanstalk
- Set `DEBUG=False`
- Configure production database
- Set up Redis for Celery
- Configure static file serving

### Frontend (Next.js)
- Vercel (recommended) or Netlify
- Add environment variables
- Update API URL to production backend

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Contact

- **Project Maintainer:** [fergtech](https://github.com/fergtech)
- **Repository:** [seed-and-spoon](https://github.com/fergtech/seed-and-spoon)
