# 🎯 Stripe Checkout Integration - Complete Setup Guide

This guide covers everything you need to set up and test your custom Stripe checkout system for Seed & Spoon.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Local Testing with Stripe CLI](#local-testing-with-stripe-cli)
6. [Testing the Integration](#testing-the-integration)
7. [Production Deployment](#production-deployment)
8. [Security Best Practices](#security-best-practices)
9. [Extending to Subscriptions](#extending-to-subscriptions)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Stripe account (sign up at [stripe.com](https://stripe.com))
- MongoDB installed locally OR a MongoDB Atlas account
- Stripe CLI installed (for webhook testing)

---

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe SDK
- `@stripe/react-stripe-js` - Stripe React components
- `mongoose` - MongoDB ODM

### 2. Install Stripe CLI (for local webhook testing)

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
# Using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
# Download and install
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Verify installation:**
```bash
stripe --version
```

---

## Environment Setup

### 1. Get Your Stripe API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`) - **Never expose this!**

### 2. Create `.env.local` File

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# MongoDB (use one of these)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/seed-and-spoon

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seed-and-spoon

# Webhook Secret (we'll set this after running stripe listen)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Database Setup

### Option A: Local MongoDB

1. **Install MongoDB:**
   - macOS: `brew install mongodb-community`
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Linux: Follow [official docs](https://docs.mongodb.com/manual/administration/install-on-linux/)

2. **Start MongoDB:**
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # OR
   mongod --config /usr/local/etc/mongod.conf

   # Windows
   net start MongoDB
   ```

3. **Verify connection:**
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write access
4. Whitelist your IP address (or `0.0.0.0/0` for development)
5. Get your connection string and add it to `.env.local`

---

## Local Testing with Stripe CLI

### 1. Login to Stripe CLI

```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### 2. Start Webhook Forwarding

In a **separate terminal window**, run:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

This command will:
- Listen for Stripe webhook events
- Forward them to your local API route
- Display a **webhook signing secret** - copy this!

**Example output:**
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

### 3. Update `.env.local` with Webhook Secret

Add the webhook secret from the previous step:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

### 4. Start Your Development Server

In your main terminal:

```bash
npm run dev
```

Your app is now running at [http://localhost:3000](http://localhost:3000)

---

## Testing the Integration

### 1. Visit the Checkout Page

Open [http://localhost:3000/checkout](http://localhost:3000/checkout)

### 2. Fill Out Donation Form

- Select an amount or enter a custom amount
- Enter your email address
- Click "Continue to Payment"

### 3. Test with Stripe Test Cards

Use these test card numbers (they won't charge real money):

**Successful Payment:**
- Card number: `4242 4242 4242 4242`
- Expiration: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Declined Card:**
- Card number: `4000 0000 0000 0002`

**Requires Authentication (3D Secure):**
- Card number: `4000 0027 6000 3184`

**More test cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)

### 4. Monitor Webhook Events

In your `stripe listen` terminal, you should see events like:

```
payment_intent.created
payment_intent.succeeded
charge.succeeded
```

### 5. Check Your Database

```bash
# Connect to MongoDB
mongosh

# Use your database
use seed-and-spoon

# Check orders
db.orders.find().pretty()

# Check payments
db.payments.find().pretty()
```

### 6. Verify in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Payments**
3. You should see your test payment

---

## Production Deployment

### 1. Update Environment Variables

**Vercel/Netlify/Railway:**
1. Get your **production** Stripe keys (starts with `pk_live_` and `sk_live_`)
2. Add environment variables in your hosting platform
3. Make sure to set `NODE_ENV=production`

### 2. Set Up Production Webhooks

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click "**Add endpoint**"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhook`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.processing`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Click "**Add endpoint**"
6. Copy the **Signing secret** and add it to your environment variables

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Add environment variables in Vercel:**
```bash
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add MONGODB_URI
```

### 4. Test Production Deployment

1. Make a real test payment in **test mode**
2. Check webhook delivery in Stripe Dashboard
3. Verify data in MongoDB
4. Switch to **live mode** when ready

---

## Security Best Practices

### 🔐 PCI Compliance

✅ **You are PCI compliant!** Using Stripe Payment Element means:
- Card data never touches your server
- Stripe handles all PCI requirements
- No need for PCI certification

### 🛡️ Best Practices

**DO:**
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production (required by Stripe)
- ✅ Keep `STRIPE_SECRET_KEY` secret (never commit to Git)
- ✅ Implement rate limiting on API routes
- ✅ Validate all input amounts server-side
- ✅ Log all payment events for auditing

**DON'T:**
- ❌ Never expose secret keys to frontend
- ❌ Never trust client-side amount data (always validate server-side)
- ❌ Never store full card numbers (Stripe does this for you)
- ❌ Never disable webhook signature verification

### 🔒 Additional Security Measures

**1. Add Rate Limiting (Recommended)**

Install `express-rate-limit`:
```bash
npm install express-rate-limit
```

Create middleware:
```javascript
// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
```

**2. Add Request Validation**

Consider using `zod` for schema validation:
```bash
npm install zod
```

**3. Enable Stripe Radar**

Stripe Radar provides fraud detection. Enable it in your Stripe Dashboard.

---

## Extending to Subscriptions

Want to add subscription/membership functionality? Here's how:

### 1. Create Subscription Plans in Stripe

1. Go to **Products** in Stripe Dashboard
2. Create a new product (e.g., "Monthly Membership")
3. Add a price (e.g., $10/month)
4. Note the price ID (starts with `price_`)

### 2. Create Subscription API Route

```javascript
// app/api/create-subscription/route.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const { priceId, customerEmail } = await request.json();

  // Create or retrieve customer
  const customer = await stripe.customers.create({
    email: customerEmail,
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });

  return Response.json({
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    subscriptionId: subscription.id,
  });
}
```

### 3. Handle Subscription Webhooks

Add these events to your webhook handler:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4. Create Subscription Model

```javascript
// models/Subscription.js
const SubscriptionSchema = new mongoose.Schema({
  customerId: String,
  subscriptionId: String,
  status: String, // active, canceled, past_due
  priceId: String,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: Boolean,
});
```

---

## Troubleshooting

### Problem: "No stripe-signature header found"

**Solution:** Make sure webhook secret is correct and `stripe listen` is running.

### Problem: "Invalid API Key provided"

**Solution:** Check that you're using the correct key (test vs live mode). Keys should start with `sk_test_` or `pk_test_`.

### Problem: "Cannot read property 'client_secret' of undefined"

**Solution:** Check your API route logs. The PaymentIntent creation likely failed. Verify amount and currency are valid.

### Problem: "Authentication required" error during payment

**Solution:** This is normal for 3D Secure cards. Make sure your `return_url` is correct.

### Problem: Webhooks not being received

**Solution:**
1. Check that `stripe listen` is running
2. Verify webhook secret in `.env.local`
3. Check API route logs for errors
4. Ensure MongoDB connection is working

### Problem: "Module not found: Can't resolve '@/lib/mongodb'"

**Solution:** Check your `jsconfig.json` has path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Testing Checklist

Before going live, test these scenarios:

- [ ] Successful payment with card
- [ ] Declined card
- [ ] 3D Secure authentication
- [ ] Custom amount entry
- [ ] Invalid email format
- [ ] Amount less than $0.50
- [ ] Webhook event processing
- [ ] Database record creation
- [ ] Success page redirect
- [ ] Receipt email (if configured)
- [ ] Payment failure handling
- [ ] Network error during payment

---

## Support Resources

- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference:** [stripe.com/docs/api](https://stripe.com/docs/api)
- **Payment Element Guide:** [stripe.com/docs/payments/payment-element](https://stripe.com/docs/payments/payment-element)
- **Webhook Guide:** [stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Test Cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## 🎉 You're All Set!

Your Stripe checkout integration is now complete and production-ready. Happy fundraising! 💚

For questions or issues, check the troubleshooting section or contact Stripe support.
