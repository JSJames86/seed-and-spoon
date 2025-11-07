/**
 * Stripe Integration Helpers
 */

import Stripe from 'stripe';
import { nanoid } from 'nanoid';

// Lazy-initialize Stripe client (only when actually used at runtime)
let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: false,
    });
  }
  return stripeClient;
}

// Export as 'stripe' for backward compatibility
export const stripe = new Proxy({}, {
  get: (target, prop) => {
    return getStripe()[prop];
  }
});

/**
 * Generate idempotency key for Stripe operations
 * @param {string} prefix - Optional prefix for the key
 * @returns {string}
 */
export function generateIdempotencyKey(prefix = 'idem') {
  return `${prefix}_${nanoid(24)}`;
}

/**
 * Create Stripe Checkout Session for one-time donation
 * @param {object} params
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export async function createOneTimeCheckoutSession({
  amount,
  currency = 'usd',
  email,
  name,
  metadata = {},
  successUrl,
  cancelUrl,
  idempotencyKey,
}) {
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: 'Donation to Seed and Spoon NJ',
              description: 'One-time donation to support our mission',
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        org: 'SeedAndSpoon',
        interval: 'one_time',
      },
      payment_intent_data: {
        metadata: {
          ...metadata,
          org: 'SeedAndSpoon',
          interval: 'one_time',
        },
      },
    },
    {
      idempotencyKey,
    }
  );

  return session;
}

/**
 * Create Stripe Checkout Session for monthly recurring donation
 * @param {object} params
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export async function createMonthlyCheckoutSession({
  amount,
  currency = 'usd',
  email,
  name,
  metadata = {},
  successUrl,
  cancelUrl,
  idempotencyKey,
}) {
  // Create a dynamic price for the subscription
  const price = await stripe.prices.create(
    {
      currency,
      unit_amount: amount,
      recurring: {
        interval: 'month',
      },
      product_data: {
        name: 'Monthly Donation to Seed and Spoon NJ',
        description: 'Monthly recurring donation to support our mission',
      },
    },
    {
      idempotencyKey: `${idempotencyKey}_price`,
    }
  );

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        org: 'SeedAndSpoon',
        interval: 'month',
      },
      subscription_data: {
        metadata: {
          ...metadata,
          org: 'SeedAndSpoon',
          interval: 'month',
        },
      },
    },
    {
      idempotencyKey,
    }
  );

  return session;
}

/**
 * Verify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Stripe.Event}
 */
export function verifyWebhookSignature(payload, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Retrieve a Checkout Session
 * @param {string} sessionId
 * @returns {Promise<Stripe.Checkout.Session>}
 */
export async function retrieveCheckoutSession(sessionId) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Format amount for display (cents to dollars)
 * @param {number} amount - Amount in cents
 * @param {string} currency
 * @returns {string}
 */
export function formatAmount(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return formatter.format(amount / 100);
}

/**
 * Validate donation amount (minimum $1)
 * @param {number} amount - Amount in cents
 * @returns {boolean}
 */
export function isValidDonationAmount(amount) {
  return Number.isInteger(amount) && amount >= 100; // Minimum $1.00
}

/**
 * Get success and cancel URLs from environment
 * @returns {object}
 */
export function getDonationUrls() {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    successUrl:
      process.env.DONATE_SUCCESS_URL ||
      `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: process.env.DONATE_CANCEL_URL || `${baseUrl}/donate`,
  };
}
