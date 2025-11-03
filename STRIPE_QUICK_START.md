# 🚀 Quick Start - Stripe Checkout in 5 Minutes

Get your Stripe checkout system running locally in just a few steps!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Get your Stripe keys from [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) and add them:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
MONGODB_URI=mongodb://localhost:27017/seed-and-spoon
```

## Step 3: Start MongoDB

**Using Homebrew (macOS):**
```bash
brew services start mongodb-community
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Or use MongoDB Atlas** (cloud - free tier available):
Get connection string from [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)

## Step 4: Start Stripe Webhook Listener

In a **new terminal**, run:

```bash
# Install Stripe CLI if you haven't already
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Start listening for webhooks
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook secret (starts with `whsec_`) and add it to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

## Step 5: Start the Dev Server

```bash
npm run dev
```

## Step 6: Test It Out!

1. Open [http://localhost:3000/checkout](http://localhost:3000/checkout)
2. Enter a donation amount
3. Use test card: `4242 4242 4242 4242`
4. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
5. Click "Pay" and watch it work! ✨

---

## What Just Happened?

1. ✅ Created a PaymentIntent via `/api/create-payment-intent`
2. ✅ Stored pending order in MongoDB
3. ✅ Mounted Stripe Payment Element
4. ✅ Confirmed payment with Stripe
5. ✅ Received webhook event
6. ✅ Updated order status to "succeeded"
7. ✅ Redirected to success page

---

## Next Steps

- 📖 Read the full [STRIPE_SETUP.md](./STRIPE_SETUP.md) guide
- 🔒 Review [security best practices](#security-checklist)
- 🚀 Deploy to production (see deployment guide)
- 📧 Add email notifications (optional)

---

## Quick Troubleshooting

**Webhooks not working?**
- Make sure `stripe listen` is running
- Check webhook secret in `.env.local`
- Restart your dev server

**MongoDB connection error?**
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env.local`

**Payment not completing?**
- Check browser console for errors
- Verify Stripe keys are correct
- Use test card numbers only

---

## File Structure

```
├── app/
│   ├── api/
│   │   ├── create-payment-intent/
│   │   │   └── route.js          # Creates PaymentIntent
│   │   └── webhook/
│   │       └── route.js           # Handles Stripe webhooks
│   ├── checkout/
│   │   ├── page.jsx               # Checkout form
│   │   └── success/
│   │       └── page.jsx           # Success page
├── components/
│   └── CheckoutForm.jsx           # Stripe Payment Element
├── lib/
│   └── mongodb.js                 # MongoDB connection
├── models/
│   ├── Order.js                   # Order schema
│   └── Payment.js                 # Payment schema
└── .env.local                     # Your secrets
```

---

## Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0027 6000 3184` | 🔐 Requires Authentication |

More test cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Security Checklist

Before going to production:

- [ ] Verify webhook signatures in production
- [ ] Use production Stripe keys (starts with `pk_live_` and `sk_live_`)
- [ ] Set up production webhooks in Stripe Dashboard
- [ ] Enable HTTPS (required by Stripe)
- [ ] Add rate limiting to API routes
- [ ] Validate all amounts server-side
- [ ] Never commit `.env.local` to Git
- [ ] Enable Stripe Radar for fraud detection

---

## Need Help?

- 📖 Full setup guide: [STRIPE_SETUP.md](./STRIPE_SETUP.md)
- 🔧 Stripe docs: [stripe.com/docs](https://stripe.com/docs)
- 💬 Stripe support: Available in your dashboard

---

**You're all set! Start accepting donations! 💚**
