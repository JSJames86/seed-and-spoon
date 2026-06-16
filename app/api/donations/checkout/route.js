/**
 * Donations Checkout API Route
 *
 * Creates Stripe Checkout sessions for one-time and recurring donations.
 * Accepts an optional campaign_slug to associate the donation with a campaign.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  createOneTimeCheckoutSession,
  createMonthlyCheckoutSession,
  generateIdempotencyKey,
  getDonationUrls,
} from '@/lib/stripe-helpers';
import { donationCheckoutSchema, validateRequest } from '@/lib/validation';

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Donations API] STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { ok: false, error: 'Payment processing is not configured. Please contact support.' },
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

    const { amount, currency, interval, email, name, source, campaign_slug } = validation.data;

    // If a campaign slug was provided, look up its UUID
    let campaignId = null;
    if (campaign_slug) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('id')
          .eq('slug', campaign_slug)
          .single();
        campaignId = campaign?.id || null;
      }
    }

    const { successUrl, cancelUrl } = getDonationUrls();
    const idempotencyKey = generateIdempotencyKey('donation');

    const metadata = {
      source: source || 'donate_page',
      donorName: name || undefined,
      ...(campaignId && { campaign_id: campaignId }),
    };

    let session;

    if (interval === 'month') {
      session = await createMonthlyCheckoutSession({
        amount, currency, email, name, metadata, successUrl, cancelUrl, idempotencyKey,
      });
    } else {
      session = await createOneTimeCheckoutSession({
        amount, currency, email, name, metadata, successUrl, cancelUrl, idempotencyKey,
      });
    }

    return NextResponse.json({
      ok: true,
      data: { sessionId: session.id, checkoutUrl: session.url },
    });
  } catch (error) {
    console.error('[Donations API] Error creating checkout session:', error);

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { ok: false, error: 'Your card was declined. Please try a different payment method.' },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request. Please check your donation details.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
