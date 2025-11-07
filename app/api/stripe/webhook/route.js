/**
 * POST /api/stripe/webhook
 *
 * Handle Stripe webhook events with signature verification
 *
 * IMPORTANT: This endpoint requires raw body parsing
 * Next.js 13+ automatically handles this for webhook routes
 */

import { verifyWebhookSignature } from '@/lib/stripe-helpers';
import {
  findDonationBySessionId,
  markDonationPaid,
  updateDonation,
} from '@/lib/models';
import { Logger } from '@/lib/api-helpers';

// Disable body parsing for webhooks (Next.js will provide raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const logger = new Logger();

  try {
    // Get raw body as text for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      logger.warn('Missing Stripe signature header');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
      logger.info('Webhook signature verified', { eventType: event.type });
    } catch (error) {
      logger.error('Webhook signature verification failed', error);
      return Response.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event, logger);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event, logger);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event, logger);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event, logger);
        break;

      default:
        logger.info('Unhandled webhook event type', { eventType: event.type });
    }

    // Always return 200 to acknowledge receipt
    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Webhook processing failed', error);

    // Still return 200 to prevent Stripe from retrying
    // but log the error for investigation
    return Response.json({ received: true }, { status: 200 });
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutCompleted(event, logger) {
  const session = event.data.object;

  logger.info('Processing checkout.session.completed', {
    sessionId: session.id,
  });

  try {
    // Find the donation record
    const donation = await findDonationBySessionId(session.id);

    if (!donation) {
      logger.warn('Donation not found for session', { sessionId: session.id });
      return;
    }

    // Check if already processed (idempotency)
    if (donation.status === 'paid') {
      logger.info('Donation already marked as paid', { sessionId: session.id });
      return;
    }

    // Extract payment data
    const paymentData = {
      paymentIntentId: session.payment_intent || null,
      subscriptionId: session.subscription || null,
      donorEmail: session.customer_details?.email || donation.donorEmail,
      name: session.customer_details?.name || donation.name,
      amount: session.amount_total || donation.amount,
      currency: session.currency || donation.currency,
      stripeEvent: {
        id: event.id,
        type: event.type,
        created: event.created,
        data: session,
      },
    };

    // Mark donation as paid
    await markDonationPaid(session.id, paymentData);

    logger.info('Donation marked as paid', {
      sessionId: session.id,
      amount: paymentData.amount,
      interval: donation.interval,
    });
  } catch (error) {
    logger.error('Failed to process checkout.session.completed', error, {
      sessionId: session.id,
    });
    throw error;
  }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(event, logger) {
  const charge = event.data.object;

  logger.info('Processing charge.refunded', {
    chargeId: charge.id,
    paymentIntentId: charge.payment_intent,
  });

  try {
    // Find donation by payment intent ID
    const donations = await import('@/lib/mongodb').then((m) =>
      m.getCollection('donations')
    );

    const donation = await donations.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (!donation) {
      logger.warn('Donation not found for refunded charge', {
        chargeId: charge.id,
      });
      return;
    }

    // Update donation status to refunded
    await updateDonation(donation.stripeSessionId, {
      status: 'refunded',
      refundedAt: new Date(charge.refunds.data[0].created * 1000),
      refundAmount: charge.amount_refunded,
    });

    logger.info('Donation marked as refunded', {
      sessionId: donation.stripeSessionId,
      amount: charge.amount_refunded,
    });
  } catch (error) {
    logger.error('Failed to process charge.refunded', error, {
      chargeId: charge.id,
    });
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(event, logger) {
  const subscription = event.data.object;

  logger.info('Processing customer.subscription.deleted', {
    subscriptionId: subscription.id,
  });

  try {
    // Find donation by subscription ID
    const donations = await import('@/lib/mongodb').then((m) =>
      m.getCollection('donations')
    );

    const donation = await donations.findOne({
      stripeSubscriptionId: subscription.id,
    });

    if (!donation) {
      logger.warn('Donation not found for cancelled subscription', {
        subscriptionId: subscription.id,
      });
      return;
    }

    // Update donation status to cancelled
    await updateDonation(donation.stripeSessionId, {
      status: 'cancelled',
      cancelledAt: new Date(subscription.canceled_at * 1000),
    });

    logger.info('Subscription donation marked as cancelled', {
      sessionId: donation.stripeSessionId,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error('Failed to process customer.subscription.deleted', error, {
      subscriptionId: subscription.id,
    });
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(event, logger) {
  const subscription = event.data.object;

  logger.info('Processing customer.subscription.updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
  });

  try {
    // Find donation by subscription ID
    const donations = await import('@/lib/mongodb').then((m) =>
      m.getCollection('donations')
    );

    const donation = await donations.findOne({
      stripeSubscriptionId: subscription.id,
    });

    if (!donation) {
      logger.warn('Donation not found for updated subscription', {
        subscriptionId: subscription.id,
      });
      return;
    }

    // Update subscription status
    await updateDonation(donation.stripeSessionId, {
      subscriptionStatus: subscription.status,
      subscriptionCurrentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ),
    });

    logger.info('Subscription donation updated', {
      sessionId: donation.stripeSessionId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  } catch (error) {
    logger.error('Failed to process customer.subscription.updated', error, {
      subscriptionId: subscription.id,
    });
    throw error;
  }
}
