/**
 * Stripe Webhook Handler
 *
 * Receives and processes Stripe webhook events.
 * The raw body must NOT be parsed — Stripe uses it to verify the signature.
 */

import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-helpers';
import { captureServerEvent } from '@/lib/posthog-server';
import { EVENTS } from '@/analytics/events';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email-service';
import { renderDonationReceiptEmail, renderDonationInternalEmail } from '@/emails/templates/donation';

function getServiceSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// A single one-time donation via Checkout fires both checkout.session.completed and
// payment_intent.succeeded for the same payment intent — dedup on that (or the
// transaction id, for events where no payment intent is available yet) so we never
// insert a second donation row or send a second receipt for the same payment.
async function recordDonation({ donorEmail, donorName, amountCents, isMonthly, transactionId, stripePaymentIntentId }) {
  const supabase = getServiceSupabase();
  if (!supabase) {
    console.warn('[Stripe Webhook] Skipping DB record — service role key not configured');
    return null;
  }
  try {
    const dedupColumn = stripePaymentIntentId ? 'stripe_payment_intent_id' : 'transaction_id';
    const dedupValue = stripePaymentIntentId || transactionId;
    if (dedupValue) {
      const { data: existing } = await supabase
        .from('donations')
        .select('id, receipt_id, receipt_email_sent_at')
        .eq(dedupColumn, dedupValue)
        .maybeSingle();
      if (existing) return existing;
    }

    const { data: inserted, error } = await supabase
      .from('donations')
      .insert({
        donor_email: donorEmail || null,
        donor_name: donorName,
        amount: amountCents / 100,
        donation_type: isMonthly ? 'monthly' : 'one_time',
        transaction_id: transactionId,
        stripe_payment_intent_id: stripePaymentIntentId || null,
        payment_method: 'stripe',
        status: 'completed',
      })
      .select('id, receipt_id, receipt_email_sent_at')
      .single();
    if (error) throw error;
    return inserted;
  } catch (err) {
    console.error('[Stripe Webhook] Failed to record donation (non-fatal):', err);
    return null;
  }
}

async function sendDonationEmails({ donationRow, name, email, amountCents, isMonthly, transactionId, createdAt }) {
  // Idempotency guard — skip if this donation already had its receipt sent
  // (e.g. this is the second of the two webhook events for the same payment).
  if (!donationRow || donationRow.receipt_email_sent_at) return;

  const STAFF_EMAIL = process.env.STAFF_EMAIL || 'team@seedandspoon.org';
  const amountDollars = amountCents / 100;
  const donationType = isMonthly ? 'monthly' : 'one-time';
  const dateStr = new Date(createdAt * 1000).toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    const receiptHtml = await renderDonationReceiptEmail({
      firstName: name,
      amount: amountDollars,
      donationType,
      date: dateStr,
      transactionId,
      receiptId: donationRow.receipt_id,
      paymentMethod: 'Card',
    });
    const result = await sendEmail({
      to: email,
      subject: 'Your gift is already at work — receipt inside',
      html: receiptHtml,
      emailType: 'donation_receipt',
    });
    if (result.success && donationRow.id) {
      const supabase = getServiceSupabase();
      if (supabase) {
        await supabase
          .from('donations')
          .update({ receipt_email_sent_at: new Date().toISOString() })
          .eq('id', donationRow.id);
      }
    }
  } catch (e) {
    console.error('[Stripe Webhook] Donor receipt failed:', e);
  }

  try {
    const internalHtml = await renderDonationInternalEmail({
      name,
      email,
      amount: amountDollars,
      donationType,
      date: dateStr,
      transactionId,
    });
    await sendEmail({
      to: STAFF_EMAIL,
      subject: `New ${donationType} donation: $${amountDollars.toFixed(2)} from ${name}`,
      html: internalHtml,
      emailType: 'donation_internal',
    });
  } catch (e) {
    console.error(`[Stripe Webhook] Staff alert failed (STAFF_EMAIL=${STAFF_EMAIL}):`, e);
  }
}


async function notifyAdmin(type, title, body, href) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: '836fc70f-1fd5-4d61-9250-a806cb92593d', type, title, body, href })
    })
  } catch {}
}

export async function POST(request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    console.error('[Stripe Webhook] Signature verification failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { interval, source, donorName } = session.metadata || {};
        const customerId = session.customer;
        const amount = session.amount_total;
        const isMonthly = interval === 'month';

        await captureServerEvent(customerId || event.id, EVENTS.DONATION_COMPLETED, {
          amount: amount / 100,
          frequency: isMonthly ? 'monthly' : 'one_time',
          tier: session.metadata?.tier || null,
          donor_id: customerId,
        });

        if (isMonthly) {
          await captureServerEvent(customerId || event.id, EVENTS.MONTHLY_SUBSCRIPTION_STARTED, {
            amount: amount / 100,
            donor_id: customerId,
          });
        }

        const donorEmail = session.customer_details?.email;
        const resolvedName = session.customer_details?.name || donorName || 'Friend';

        const checkoutDonationRow = await recordDonation({
          donorEmail,
          donorName: resolvedName,
          amountCents: amount,
          isMonthly,
          transactionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
        });

        if (donorEmail) {
          await sendDonationEmails({
            donationRow: checkoutDonationRow,
            name: resolvedName,
            email: donorEmail,
            amountCents: amount,
            isMonthly,
            transactionId: session.id,
            createdAt: session.created,
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        // Notify admin
        const pi = event.data.object
        await notifyAdmin(
          'donation.received',
          `New donation received`,
          `$${(pi.amount / 100).toFixed(2)} via Stripe`,
          '/admin?tab=Donors'
        )
        const intent = event.data.object;
        if (intent.invoice) break; // skip subscription renewals

        const { interval, donor_name } = intent.metadata || {};
        const amount = intent.amount;
        const isMonthly = interval === 'month';
        const donorEmail = intent.receipt_email;
        const resolvedName = intent.shipping?.name || donor_name || 'Friend';

        const piDonationRow = await recordDonation({
          donorEmail,
          donorName: resolvedName,
          amountCents: amount,
          isMonthly,
          transactionId: intent.id,
          stripePaymentIntentId: intent.id,
        });

        if (donorEmail) {
          await sendDonationEmails({
            donationRow: piDonationRow,
            name: resolvedName,
            email: donorEmail,
            amountCents: amount,
            isMonthly,
            transactionId: intent.id,
            createdAt: intent.created,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const amount = invoice.amount_paid;

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;
        const lastError = invoice.last_finalization_error;

        console.warn(
          `[Stripe Webhook] Recurring payment failed — subscription: ${subscriptionId}`
        );

        await captureServerEvent(customerId || event.id, EVENTS.DONATION_FAILED, {
          error_code: lastError?.code || 'payment_failed',
          tier: null,
          amount: (invoice.amount_due || 0) / 100,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        await captureServerEvent(customerId || event.id, EVENTS.MONTHLY_SUBSCRIPTION_CANCELLED, {
          donor_id: customerId,
          reason: subscription.cancellation_details?.reason || null,
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, error);
    return NextResponse.json({ error: 'Internal error processing webhook' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
