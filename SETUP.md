# Frontend ↔ Backend Connection Setup Guide

## Quick Start

This guide will help you connect the Seed & Spoon frontend to the backend API in 5 minutes.

---

## Prerequisites

1. **Backend API** deployed and accessible (e.g., on Vercel)
2. **Stripe Account** with API keys
3. **Node.js** installed (v18+ recommended)

---

## Step 1: Configure Environment Variables

### Create `.env.local` file

In the root of your project, create a file named `.env.local`:

```bash
cp .env.example .env.local
```

### Add Required Variables

Open `.env.local` and add these **required** variables:

```env
# Backend API URL (REQUIRED)
NEXT_PUBLIC_API_BASE_URL=https://seed-and-spoon-backend.vercel.app

# Stripe Publishable Key (REQUIRED for donations)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Where to get these values:**

- **Backend API URL**: Your backend deployment URL (Vercel, Railway, Render, etc.)
- **Stripe Key**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
  - Use `pk_test_...` for development
  - Use `pk_live_...` for production

### Optional Variables (Analytics)

```env
# Optional: Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=seedandspoon.org
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Start Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:3000`.

---

## Step 4: Test the Connection

### Test 1: Food Bank Directory

1. Go to `http://localhost:3000/get-help`
2. You should see:
   - A map with food bank locations
   - A directory list grouped by county
3. If you see errors, check:
   - `NEXT_PUBLIC_API_BASE_URL` is correct
   - Backend is running and accessible
   - CORS is configured on backend

### Test 2: Donation Flow

1. Go to `http://localhost:3000/donate`
2. Select an amount (e.g., $25)
3. Click "Donate"
4. You should be redirected to Stripe Checkout
5. If you see errors, check:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is correct
   - Backend `/api/donations/create` endpoint works
   - Stripe is configured on backend

### Test 3: Form Submissions

1. Go to `http://localhost:3000/get-help`
2. Fill out the "Client Application" form
3. Submit the form
4. You should see a success message
5. If you see errors, check:
   - Backend `/api/forms/intake-client` endpoint works
   - Email service is configured (optional)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages:                                                          │
│  ├─ /get-help          → Food directory & forms                 │
│  ├─ /donate            → Donation page                          │
│  └─ /thank-you         → Donation confirmation                  │
│                                                                  │
│  Components:                                                     │
│  ├─ ResourceMap        → Displays food banks on map             │
│  ├─ CountyDirectory    → Lists food banks by county             │
│  ├─ ClientIntakeForm   → Client application form                │
│  ├─ ReferralIntakeForm → Partner referral form                  │
│  └─ DonatePageClient   → Donation UI with Stripe                │
│                                                                  │
│  API Helper:                                                     │
│  └─ /lib/api.js        → Centralized API functions              │
│     ├─ getFoodBanks()        → Fetch directory data             │
│     ├─ getServices()         → Fetch services                   │
│     ├─ createDonation()      → Create Stripe session            │
│     ├─ submitClientIntake()  → Submit client form               │
│     ├─ submitReferralIntake()→ Submit referral form             │
│     └─ submitProvider()      → Submit provider info             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Vercel/Node.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Endpoints:                                                      │
│  ├─ GET  /api/directory/food-banks    → Return food banks       │
│  ├─ GET  /api/directory/services      → Return services         │
│  ├─ POST /api/donations/create        → Create Stripe session   │
│  ├─ POST /api/forms/intake-client     → Save client app         │
│  ├─ POST /api/forms/intake-referral   → Save referral           │
│  └─ POST /api/forms/provider-submission → Save provider info    │
│                                                                  │
│  Services:                                                       │
│  ├─ Database (PostgreSQL/Supabase)   → Store data               │
│  ├─ Stripe API                        → Process payments        │
│  └─ Email Service (SendGrid/SES)     → Send confirmations       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Examples

### 1. Loading Food Banks

```
User visits /get-help
  ↓
ResourceMap component loads
  ↓
Calls getFoodBanks() from /lib/api.js
  ↓
GET https://backend.vercel.app/api/directory/food-banks
  ↓
Backend queries database
  ↓
Returns JSON array of food banks
  ↓
Frontend displays on map & directory
```

### 2. Making a Donation

```
User clicks "Donate $50"
  ↓
DonatePageClient calls createDonation()
  ↓
POST https://backend.vercel.app/api/donations/create
  body: { amount: 50, interval: "one-time", successUrl, cancelUrl }
  ↓
Backend creates Stripe checkout session
  ↓
Returns { checkoutUrl, sessionId, clientSecret }
  ↓
Frontend redirects to Stripe Checkout
  ↓
User completes payment on Stripe
  ↓
Stripe redirects to /thank-you?session_id=xxx
  ↓
Thank you page displays confirmation
```

### 3. Submitting a Form

```
User fills out client application
  ↓
Clicks "Submit Application"
  ↓
ClientIntakeForm calls submitClientIntake()
  ↓
POST https://backend.vercel.app/api/forms/intake-client
  body: { applicant: {...}, household: {...}, ... }
  ↓
Backend validates & saves to database
  ↓
Backend sends confirmation email
  ↓
Returns { success: true, applicationId: "APP-123" }
  ↓
Frontend displays success message
```

---

## File Structure

```
seed-and-spoon/
├── app/                          # Next.js App Router
│   ├── donate/                   # Donation page
│   ├── get-help/                 # Food assistance page
│   └── thank-you/                # Donation confirmation
│
├── components/
│   ├── donate/
│   │   └── DonatePageClient.jsx  # Donation UI
│   └── get-help/
│       ├── ResourceMap.jsx       # Map component
│       ├── CountyDirectory.jsx   # Directory list
│       ├── ClientIntakeForm.jsx  # Client form
│       ├── ReferralIntakeForm.jsx# Referral form
│       └── ProviderSubmissionModal.jsx # Provider form
│
├── lib/
│   ├── api.js                    # ⭐ Centralized API helper
│   ├── validation.js             # Form validation schemas
│   └── api-helpers.js            # Response utilities
│
├── .env.local                    # ⚠️ Environment variables (DO NOT COMMIT)
├── .env.example                  # Example env file
├── BACKEND_API_REQUIREMENTS.md   # Backend API specification
└── SETUP.md                      # This file
```

---

## Common Issues & Solutions

### Issue 1: "NEXT_PUBLIC_API_BASE_URL is not configured"

**Error:**
```
Error: NEXT_PUBLIC_API_BASE_URL is not configured. Please add it to your .env.local file.
```

**Solution:**
1. Create `.env.local` file in project root
2. Add `NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com`
3. Restart dev server (`npm run dev`)

---

### Issue 2: CORS Error

**Error:**
```
Access to fetch at 'https://backend.com/api/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Solution:**
Backend must allow requests from your frontend domain:

```javascript
// Backend CORS configuration example
app.use(cors({
  origin: [
    'http://localhost:3000',        // Development
    'https://seedandspoon.org',     // Production
  ],
  credentials: true,
}));
```

---

### Issue 3: Stripe Checkout Not Working

**Error:**
```
Failed to create checkout session
```

**Solutions:**
1. Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
2. Verify backend has `STRIPE_SECRET_KEY` configured
3. Ensure backend `/api/donations/create` endpoint exists
4. Use test keys (`pk_test_...`) in development
5. Check Stripe dashboard for errors

---

### Issue 4: Forms Not Submitting

**Error:**
```
Unable to submit form. Please try again later.
```

**Solutions:**
1. Check backend endpoints exist:
   - `/api/forms/intake-client`
   - `/api/forms/intake-referral`
   - `/api/forms/provider-submission`
2. Verify CORS is configured
3. Check browser console for detailed errors
4. Test backend endpoints with Postman/Insomnia

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://backend.vercel.app` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible Analytics domain | `seedandspoon.org` |

**Important:**
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Never put secret keys in `NEXT_PUBLIC_*` variables
- Backend-only secrets go in backend `.env` file

---

## Deployment

### Vercel Deployment

1. **Push code to GitHub**

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables

3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Your frontend will be live at `https://your-app.vercel.app`

### Backend Deployment

See `BACKEND_API_REQUIREMENTS.md` for backend setup instructions.

**Checklist:**
- [ ] Backend deployed and accessible
- [ ] All API endpoints implemented
- [ ] CORS configured for frontend domain
- [ ] Stripe webhook configured
- [ ] Email service configured
- [ ] Database connected

---

## Testing Checklist

### Local Testing

- [ ] Food bank directory loads without errors
- [ ] Map displays food bank markers correctly
- [ ] County directory shows all 21 NJ counties
- [ ] Clicking on food bank shows details
- [ ] Client application form submits successfully
- [ ] Referral form submits successfully
- [ ] Provider submission form submits successfully
- [ ] Donation flow redirects to Stripe
- [ ] Test donation completes successfully

### Production Testing

- [ ] All features work on production URL
- [ ] Stripe live mode configured
- [ ] Real donations process correctly
- [ ] Form submissions send email confirmations
- [ ] Analytics tracking works
- [ ] No console errors
- [ ] Mobile responsive layout works

---

## Next Steps

1. **Configure Backend:**
   - Implement required API endpoints (see `BACKEND_API_REQUIREMENTS.md`)
   - Set up database models
   - Configure Stripe webhooks
   - Set up email service

2. **Customize Frontend:**
   - Update branding and colors
   - Add custom food bank data
   - Configure analytics
   - Add custom pages

3. **Launch:**
   - Test thoroughly
   - Set up monitoring
   - Configure backup strategy
   - Announce to users

---

## Support

- **Documentation:** See `BACKEND_API_REQUIREMENTS.md`
- **Issues:** Create an issue on GitHub
- **Questions:** Check existing issues or create new one

---

## License

See LICENSE file for details.

---

**Last Updated:** January 2024
