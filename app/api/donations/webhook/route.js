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
        const email = session.customer_details?.email;
        const amount = session.amount_total;

        console.log(
          `[Stripe Webhook] Donation completed — amount: ${amount}, interval: ${interval}, email: ${email}, source: ${source}, name: ${donorName}`
        );
        // TODO: record donation in your database here
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const amount = invoice.amount_paid;
        const email = invoice.customer_email;

        console.log(
          `[Stripe Webhook] Recurring payment succeeded — subscription: ${subscriptionId}, amount: ${amount}, email: ${email}`
        );
        // TODO: record recurring payment in your database here
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const email = invoice.customer_email;

        console.warn(
          `[Stripe Webhook] Recurring payment failed — subscription: ${subscriptionId}, email: ${email}`
        );
        // TODO: notify donor or update subscription status here
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(
          `[Stripe Webhook] Subscription cancelled — id: ${subscription.id}, status: ${subscription.status}`
        );
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
