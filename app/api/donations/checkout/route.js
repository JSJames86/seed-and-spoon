// app/api/donations/checkout/route.js
// Create Stripe Checkout session and log to Supabase

import { NextResponse } from "next/server";
import {
  createOneTimeCheckoutSession,
  createMonthlyCheckoutSession,
  generateIdempotencyKey,
  isValidDonationAmount,
  getDonationUrls,
} from "@/lib/stripe-helpers";
import { createServerSupabaseClient, handleSupabaseError } from "@/lib/supabase";

export async function POST(request) {
  try {
    console.log('[API] Processing donation checkout request...');

    const body = await request.json();
    const { amount, currency = 'usd', interval = 'one_time', source = 'donate_page' } = body;

    // Validate amount
    if (!isValidDonationAmount(amount)) {
      return NextResponse.json(
        { ok: false, error: 'Donation amount must be at least $1.00' },
        { status: 400 }
      );
    }

    // Validate interval
    if (!['one_time', 'month'].includes(interval)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid donation interval. Must be "one_time" or "month"' },
        { status: 400 }
      );
    }

    // Get success and cancel URLs
    const { successUrl, cancelUrl } = getDonationUrls();

    // Generate idempotency key for this request
    const idempotencyKey = generateIdempotencyKey('donation');

    // Create Stripe Checkout Session
    let session;
    if (interval === 'one_time') {
      session = await createOneTimeCheckoutSession({
        amount,
        currency,
        metadata: {
          source,
          idempotency_key: idempotencyKey,
        },
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    } else {
      session = await createMonthlyCheckoutSession({
        amount,
        currency,
        metadata: {
          source,
          idempotency_key: idempotencyKey,
        },
        successUrl,
        cancelUrl,
        idempotencyKey,
      });
    }

    // Log checkout session to Supabase
    const supabase = createServerSupabaseClient();
    const { error: dbError } = await supabase
      .from('donation_sessions')
      .insert([
        {
          stripe_session_id: session.id,
          amount,
          currency,
          interval,
          source,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.error('[API] Failed to log donation session to database:', dbError);
      // Don't fail the request, just log the error
    }

    console.log('[API] Checkout session created:', session.id);

    // Return the checkout URL
    return NextResponse.json({
      ok: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });

  } catch (error) {
    console.error('[API] Error creating checkout session:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create checkout session',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
