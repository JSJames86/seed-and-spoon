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
  isValidDonationAmount,
  getDonationUrls,
} from '@/lib/stripe-helpers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', interval = 'one_time', email, name, source } = body;

    // Validate amount
    if (!isValidDonationAmount(amount)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid donation amount. Minimum donation is $1.00',
        },
        { status: 400 }
      );
    }

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
