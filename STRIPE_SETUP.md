# Stripe API Keys Setup Guide

## Getting Your Stripe Test Keys

### 1. Create a Stripe Account (if you don't have one)
- Go to https://stripe.com
- Click "Sign up" and create a free account
- No credit card required for test mode

### 2. Access Your Dashboard
- Log in to https://dashboard.stripe.com
- Make sure you're in **TEST MODE** (toggle in top right corner should say "Test mode")

### 3. Get Your API Keys
- Click on "Developers" in the left sidebar
- Click on "API keys"
- You'll see two keys:
  - **Publishable key** (starts with `pk_test_`)
  - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### 4. Add Keys to Your `.env` File

Create or update `d:\Projects\Apps\seedandspoon\seed-and-spoon\.env`:

```env
# Stripe Test Keys (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLIC_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### 5. Set Up Webhook Endpoint (for local testing)

#### Option A: Use Stripe CLI (Recommended for Development)
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:8000/api/payments/webhook/
   ```
4. Copy the webhook signing secret that appears (starts with `whsec_`)
5. Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

#### Option B: Use ngrok (Alternative)
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 8000`
3. Copy the https URL (e.g., `https://abc123.ngrok.io`)
4. Go to Stripe Dashboard → Developers → Webhooks
5. Click "Add endpoint"
6. Enter: `https://abc123.ngrok.io/api/payments/webhook/`
7. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`
8. Copy the signing secret and add to `.env`

## Testing Payment Flow

### 1. Start the servers:
```bash
# Terminal 1 - Django backend
cd d:\Projects\Apps\seedandspoon\seed-and-spoon
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Next.js frontend
cd d:\Projects\Apps\seedandspoon\seed-and-spoon
npm run dev

# Terminal 3 - Stripe webhook forwarding (if using Stripe CLI)
stripe listen --forward-to localhost:8000/api/payments/webhook/
```

### 2. Test with Stripe Test Cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### 3. Test the Flow:
1. Go to http://localhost:3000/donate
2. Select an amount
3. Click "Donate Now"
4. You'll be redirected to Stripe Checkout
5. Use test card `4242 4242 4242 4242`
6. Complete the payment
7. You'll be redirected to success page
8. Check Django admin to see the donation record

## Stripe Dashboard - Monitor Test Payments
- View all test payments: https://dashboard.stripe.com/test/payments
- View webhooks: https://dashboard.stripe.com/test/webhooks
- View customers: https://dashboard.stripe.com/test/customers

## Important Notes
- **NEVER commit your `.env` file to git** (already in .gitignore)
- Test keys are safe to use in development
- Switch to live keys only when ready for production
- Live keys start with `pk_live_` and `sk_live_`
