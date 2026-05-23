/**
 * Donations Checkout API Route
 *
 * Creates Stripe Checkout sessions for one-time and recurring donations
 */

import { NextResponse } from 'next/server';
import {
  createOneTimeCheckoutSession,
  createMonthlyCheckoutSession,
  generateIdempotencyKey,
  getDonationUrls,
} from '@/lib/stripe-helpers';
import { donationCheckoutSchema, validateRequest } from '@/lib/validation';

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Donations API] STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        {
          ok: false,
          error: 'Payment processing is not configured. Please contact support.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = validateRequest(body, donationCheckoutSchema);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request', errors: validation.errors },
        { status: 400 }
      );
    }

    const { amount, currency, interval, email, name, source } = validation.data;

    // Get URLs
    const { successUrl, cancelUrl } = getDonationUrls();

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey('donation');

    // Metadata for tracking
    const metadata = {
      source: source || 'donate_page',
      donorName: name || undefined,
    };

    let session;

    if (interval === 'month') {
      // Create monthly recurring donation
      session = await createMonthlyCheckoutSession({
        amount,
        currency,
        email,
        name,
        metadata,
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    } else {
      // Create one-time donation
      session = await createOneTimeCheckoutSession({
        amount,
        currency,
        email,
        name,
        metadata,
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error('[Donations API] Error creating checkout session:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Your card was declined. Please try a different payment method.',
        },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid request. Please check your donation details.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
