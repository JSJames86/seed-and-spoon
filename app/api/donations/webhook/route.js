/**
 * Stripe Webhook Handler
 *
 * Receives and processes Stripe webhook events.
 * The raw body must NOT be parsed — Stripe uses it to verify the signature.
 *
 * Update the webhook URL in your Stripe Dashboard to:
 *   https://seed-and-spoon-backend.vercel.app/api/donations/webhook
 */

import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe-helpers';
import { captureServerEvent } from '@/lib/posthog-server';
import { EVENTS } from '@/analytics/events';

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

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { interval, source, donorName } = session.metadata || {};
        const customerId = session.customer;
        const amount = session.amount_total;
        const isMonthly = interval === 'month';

        console.log(
          `[Stripe Webhook] Donation completed — amount: ${amount}, interval: ${interval}, source: ${source}, name: ${donorName}`
        );

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
        if (donorEmail) {
          try {
            await fetch('https://seed-and-spoon-backend.vercel.app/api/email/donate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: resolvedName,
                email: donorEmail,
                amount: String(amount / 100),
                donationType: isMonthly ? 'monthly' : 'one-time',
                date: new Date(session.created * 1000).toLocaleDateString('en-US', {
                  timeZone: 'America/New_York',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
                transactionId: session.id,
              }),
            });
          } catch (emailErr) {
            console.error('[Stripe Webhook] Failed to send receipt email:', emailErr);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        if (intent.invoice) break; // skip subscription renewals

        const { interval, donor_name } = intent.metadata || {};
        const amount = intent.amount;
        const isMonthly = interval === 'month';
        const donorEmail = intent.receipt_email;
        const resolvedName = intent.shipping?.name || donor_name || 'Friend';

        if (donorEmail) {
          try {
            await fetch('https://seed-and-spoon-backend.vercel.app/api/email/donate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: resolvedName,
                email: donorEmail,
                amount: String(amount / 100),
                donationType: isMonthly ? 'monthly' : 'one-time',
                date: new Date(intent.created * 1000).toLocaleDateString('en-US', {
                  timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric',
                }),
                transactionId: intent.id,
              }),
            });
          } catch (e) {
            console.error('[Stripe Webhook] Receipt email failed:', e);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const amount = invoice.amount_paid;

        console.log(
          `[Stripe Webhook] Recurring payment succeeded — subscription: ${subscriptionId}, amount: ${amount}`
        );
        // TODO: record recurring payment in your database here
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

        // TODO: notify donor or update subscription status here
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log(
          `[Stripe Webhook] Subscription cancelled — id: ${subscription.id}, status: ${subscription.status}`
        );

        await captureServerEvent(customerId || event.id, EVENTS.MONTHLY_SUBSCRIPTION_CANCELLED, {
          donor_id: customerId,
          reason: subscription.cancellation_details?.reason || null,
        });

        // TODO: update subscription status in your database here
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt so Stripe stops retrying
        break;
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, error);
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: 'Internal error processing webhook' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
