# Seed and Spoon NJ - Backend Documentation

## Overview

The backend is built with **Next.js 14 API Routes**, **MongoDB**, and **Stripe** for payment processing.

## Architecture

```
/app/api/                     # API Routes
├── donations/
│   ├── checkout/route.js    # POST: Create Stripe Checkout Session
│   └── session/[id]/route.js # GET: Retrieve donation details
├── stripe/
│   └── webhook/route.js     # POST: Handle Stripe webhook events
└── submissions/route.js     # POST: Handle form submissions

/lib/                         # Backend utilities
├── mongodb.js               # MongoDB connection manager
├── models.js                # Database collection models
├── stripe-helpers.js        # Stripe integration helpers
├── api-helpers.js           # API response & error handlers
└── validation.js            # Zod validation schemas
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=seedandspoon

# Stripe
STRIPE_SECRET_KEY=sk_test_51xxxxx  # Use sk_live_ in production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Public URLs
PUBLIC_BASE_URL=http://localhost:3000
DONATE_SUCCESS_URL=${PUBLIC_BASE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}
DONATE_CANCEL_URL=${PUBLIC_BASE_URL}/donate

# Optional
SITE_ENV=development
LOG_LEVEL=info
```

### Getting Credentials

**MongoDB:**
1. Create account at https://mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Get connection string from "Connect" → "Drivers"
4. Replace `<password>` with your database user password

**Stripe:**
1. Create account at https://stripe.com
2. Get API keys from https://dashboard.stripe.com/apikeys
3. Use **test mode** keys (`sk_test_`) for development
4. Get webhook secret from https://dashboard.stripe.com/webhooks (see Webhook Setup below)

---

## Database Setup

### Initialize MongoDB Indexes

Run this once after setting up your environment:

```javascript
// In a Node.js script or Next.js API route
import { initializeIndexes } from '@/lib/mongodb';

await initializeIndexes();
```

### Collections

**donations**
```javascript
{
  stripeSessionId: string (unique),
  stripePaymentIntentId: string | null,
  stripeSubscriptionId: string | null,
  amount: number (cents),
  currency: string,
  interval: 'one_time' | 'month',
  status: 'created' | 'paid' | 'failed' | 'refunded' | 'cancelled',
  donorEmail: string | null,
  name: string | null,
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

**submissions**
```javascript
{
  formType: 'volunteer' | 'contact' | 'newsletter' | 'help_request',
  payload: object,
  createdAt: Date
}
```

**resources** (future use)
```javascript
{
  title: string,
  slug: string (unique),
  type: string,
  tags: string[],
  summary: string,
  link: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### POST `/api/donations/checkout`

Create a Stripe Checkout Session for donations.

**Request:**
```json
{
  "amount": 2500,              // Required: Amount in cents (minimum $1.00)
  "currency": "usd",           // Optional: Default "usd"
  "interval": "one_time",      // Required: "one_time" or "month"
  "email": "donor@example.com",// Optional: Pre-fill email
  "name": "John Doe",          // Optional: Pre-fill name
  "source": "header_cta"       // Optional: Attribution tag
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
    "sessionId": "cs_test_..."
  }
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/donations/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "interval": "one_time",
    "source": "hero_cta"
  }'
```

**Example (fetch):**
```javascript
const response = await fetch('/api/donations/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000, // $50.00
    interval: 'one_time',
    source: 'donate_page',
  }),
});

const { data } = await response.json();
window.location.href = data.checkoutUrl; // Redirect to Stripe
```

---

### GET `/api/donations/session/[id]`

Retrieve donation details for the thank-you page.

**Response:**
```json
{
  "ok": true,
  "data": {
    "status": "paid",
    "amount": 5000,
    "currency": "usd",
    "interval": "one_time",
    "donorEmail": "j***e@example.com",  // Masked
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Example:**
```javascript
const sessionId = new URLSearchParams(window.location.search).get('session_id');
const response = await fetch(`/api/donations/session/${sessionId}`);
const { data } = await response.json();

console.log(`Thank you for your $${data.amount / 100} donation!`);
```

---

### POST `/api/stripe/webhook`

Handles Stripe webhook events. **Do not call this endpoint directly.**

**Handled Events:**
- `checkout.session.completed` → Mark donation as paid
- `charge.refunded` → Mark donation as refunded
- `customer.subscription.deleted` → Mark subscription as cancelled
- `customer.subscription.updated` → Update subscription status

---

### POST `/api/submissions`

Handle form submissions (volunteer, contact, newsletter).

**Request:**
```json
{
  "formType": "volunteer",   // Required: "volunteer" | "contact" | "newsletter"
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "roles": ["food_prep", "delivery"],
  "availability": "Weekends",
  "orientationAgreed": true
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "message": "Submission received successfully",
    "submissionId": "abc123..."
  }
}
```

---

## Webhook Setup (Stripe CLI)

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget -qO- https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz | tar -xz
```

### Forward Webhooks to Local Server

```bash
# Login to Stripe
stripe login

# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll get a webhook signing secret like `whsec_xxxxx`. Copy it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Test a Checkout Session

```bash
# Trigger a test event
stripe trigger checkout.session.completed
```

---

## Testing

### Manual Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test checkout endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/donations/checkout \
     -H "Content-Type: application/json" \
     -d '{"amount": 1000, "interval": "one_time"}'
   ```

3. **Get checkout URL and complete payment in browser**

4. **Check webhook received:**
   ```bash
   # In another terminal
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

### Automated Tests

(TODO: Implement Jest/Vitest tests)

**Unit Tests:**
- Validation logic (`lib/validation.js`)
- Amount formatting (`lib/stripe-helpers.js`)
- Response helpers (`lib/api-helpers.js`)

**Integration Tests:**
- Create checkout session
- Process webhook event
- Update donation status

---

## Production Deployment

### Vercel Setup

1. **Connect GitHub repo** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `STRIPE_SECRET_KEY` (use `sk_live_` key)
   - `STRIPE_WEBHOOK_SECRET` (see below)
   - `PUBLIC_BASE_URL` (e.g., `https://seedandspoon.org`)

3. **Deploy:**
   ```bash
   git push origin main
   ```

### Production Webhook Setup

1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. Enter your production URL: `https://seedandspoon.org/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `charge.refunded`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy the **signing secret** (`whsec_` key) to Vercel environment variables
6. Redeploy to apply new environment variable

---

## Security Checklist

✅ **Secrets:** All secrets in environment variables, never hardcoded
✅ **Validation:** All inputs validated with Zod schemas
✅ **Rate Limiting:** Checkout and submissions are rate-limited
✅ **Webhook Verification:** Stripe signature verified on all webhook events
✅ **Idempotency:** Checkout sessions use idempotency keys
✅ **PCI Compliance:** Server never handles card numbers (Stripe Checkout only)
✅ **Logging:** Errors logged with correlation IDs, secrets never logged
✅ **Masking:** Donor emails masked in public responses

---

## Common Issues

### "Webhook signature verification failed"
- Check `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe dashboard
- Use `stripe listen` in development
- Use production webhook secret in production

### "Please add your MONGODB_URI"
- Ensure `.env.local` exists with `MONGODB_URI`
- Restart dev server after adding environment variables

### "Rate limit exceeded"
- Wait 60 seconds and try again
- For testing, increase limits in `lib/api-helpers.js`

### Duplicate key error (stripeSessionId)
- This is expected (idempotency working correctly)
- Same checkout request won't create duplicate records

---

## Next Steps

- [ ] Implement email notifications (SendGrid/Resend)
- [ ] Add admin dashboard for viewing donations/submissions
- [ ] Implement authentication (NextAuth.js)
- [ ] Add automated tests (Jest/Vitest)
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Implement donation reporting/analytics

---

## Support

For issues or questions:
- Check logs in Vercel dashboard (Production)
- Check terminal output (Development)
- Review Stripe dashboard for payment issues
- Email: dev@seedandspoon.org
