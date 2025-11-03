/**
 * Stripe Webhook Handler
 *
 * This endpoint handles webhook events from Stripe to update order status
 * in MongoDB when payments succeed or fail.
 *
 * CRITICAL SECURITY:
 * - ALWAYS verify webhook signatures to prevent fake events
 * - Use webhook signing secret from Stripe Dashboard
 * - Implement idempotency to handle duplicate events
 * - Never trust event data without signature verification
 *
 * Setup Instructions:
 * 1. Local testing: stripe listen --forward-to localhost:3000/api/webhook
 * 2. Production: Add webhook endpoint in Stripe Dashboard
 * 3. Events to subscribe: payment_intent.succeeded, payment_intent.payment_failed
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Payment from '@/models/Payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook signing secret (different for local testing vs production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * IMPORTANT: We need to get the raw body for signature verification
 * Next.js 13+ App Router requires special handling
 */
export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No stripe-signature header found');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event;

  try {
    // ===== VERIFY WEBHOOK SIGNATURE =====
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type} | Event ID: ${event.id}`);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // ===== HANDLE DIFFERENT EVENT TYPES =====
  try {
    await connectDB();

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'payment_intent.processing':
        await handlePaymentIntentProcessing(event);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event);
        break;

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt of the event
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Still return 200 to prevent Stripe from retrying
    // Log the error for manual investigation
    return NextResponse.json(
      { error: 'Webhook processing failed', received: true },
      { status: 200 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(event) {
  const paymentIntent = event.data.object;

  console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

  // Find the order in MongoDB
  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

  if (!order) {
    console.error(`❌ Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Check idempotency - have we already processed this event?
  const alreadyProcessed = order.addWebhookEvent(event.id, event.type);

  if (alreadyProcessed) {
    console.log(`⚠️  Event ${event.id} already processed, skipping`);
    return;
  }

  // Update order status to succeeded
  await order.markAsPaid(paymentIntent);

  // Create payment record for audit trail
  await createPaymentRecord(paymentIntent, order, 'succeeded');

  console.log(`✅ Order ${order._id} marked as paid`);

  // ===== OPTIONAL: SEND CONFIRMATION EMAIL =====
  // You can integrate with SendGrid, Resend, or other email services here
  // await sendConfirmationEmail(order);

  // ===== OPTIONAL: TRIGGER OTHER BUSINESS LOGIC =====
  // - Update inventory
  // - Send notifications
  // - Create user account
  // - Add to mailing list
  // - Generate PDF receipt
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(event) {
  const paymentIntent = event.data.object;

  console.log(`❌ Payment failed: ${paymentIntent.id}`);

  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

  if (!order) {
    console.error(`❌ Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Check idempotency
  const alreadyProcessed = order.addWebhookEvent(event.id, event.type);

  if (alreadyProcessed) {
    console.log(`⚠️  Event ${event.id} already processed, skipping`);
    return;
  }

  // Get error details
  const lastPaymentError = paymentIntent.last_payment_error;
  const errorMessage = lastPaymentError?.message || 'Payment failed';
  const errorCode = lastPaymentError?.code || 'unknown';

  // Update order status to failed
  await order.markAsFailed(errorMessage, errorCode);

  // Create payment record
  await createPaymentRecord(paymentIntent, order, 'failed');

  console.log(`⚠️  Order ${order._id} marked as failed: ${errorMessage}`);

  // ===== OPTIONAL: SEND FAILURE NOTIFICATION =====
  // await sendPaymentFailedEmail(order, errorMessage);
}

/**
 * Handle payment processing (async payment methods like ACH)
 */
async function handlePaymentIntentProcessing(event) {
  const paymentIntent = event.data.object;

  console.log(`⏳ Payment processing: ${paymentIntent.id}`);

  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

  if (!order) {
    console.error(`❌ Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Check idempotency
  const alreadyProcessed = order.addWebhookEvent(event.id, event.type);

  if (!alreadyProcessed && order.status === 'pending') {
    order.status = 'processing';
    await order.save();
    console.log(`⏳ Order ${order._id} marked as processing`);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentIntentCanceled(event) {
  const paymentIntent = event.data.object;

  console.log(`🚫 Payment canceled: ${paymentIntent.id}`);

  const order = await Order.findOne({ paymentIntentId: paymentIntent.id });

  if (!order) {
    console.error(`❌ Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Check idempotency
  const alreadyProcessed = order.addWebhookEvent(event.id, event.type);

  if (!alreadyProcessed && order.status !== 'succeeded') {
    order.status = 'canceled';
    await order.save();
    console.log(`🚫 Order ${order._id} marked as canceled`);
  }
}

/**
 * Handle refunds
 */
async function handleChargeRefunded(event) {
  const charge = event.data.object;

  console.log(`💸 Refund processed: ${charge.id}`);

  // Find payment by charge ID
  const payment = await Payment.findOne({ chargeId: charge.id });

  if (!payment) {
    console.error(`❌ Payment not found for Charge: ${charge.id}`);
    return;
  }

  // Update payment status
  if (charge.refunded) {
    payment.status = 'refunded';
  } else if (charge.amount_refunded > 0) {
    payment.status = 'partially_refunded';
  }

  // Store refund details
  payment.refunds = charge.refunds.data.map(refund => ({
    id: refund.id,
    amount: refund.amount,
    reason: refund.reason,
    status: refund.status,
    created: new Date(refund.created * 1000),
  }));

  await payment.save();

  console.log(`💸 Payment ${payment._id} updated with refund information`);
}

/**
 * Create payment record for audit trail
 */
async function createPaymentRecord(paymentIntent, order, status) {
  try {
    const charge = paymentIntent.charges?.data?.[0];

    const paymentData = {
      orderId: order._id,
      paymentIntentId: paymentIntent.id,
      chargeId: charge?.id,
      amount: paymentIntent.amount,
      amountReceived: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      status: status,
      customerEmail: order.customerEmail,
      metadata: paymentIntent.metadata,
    };

    // Add payment method details if available
    if (charge?.payment_method_details) {
      const pmDetails = charge.payment_method_details;
      paymentData.paymentMethod = {
        id: charge.payment_method,
        type: pmDetails.type,
      };

      if (pmDetails.card) {
        paymentData.paymentMethod.card = {
          brand: pmDetails.card.brand,
          last4: pmDetails.card.last4,
          exp_month: pmDetails.card.exp_month,
          exp_year: pmDetails.card.exp_year,
        };
      }
    }

    // Add receipt information
    if (charge?.receipt_url) {
      paymentData.receiptUrl = charge.receipt_url;
      paymentData.receiptNumber = charge.receipt_number;
    }

    // Add fee information
    if (charge?.balance_transaction) {
      // Note: balance_transaction is an ID, need to retrieve it for fee details
      // For now, estimate Stripe fee (2.9% + 30¢ for US cards)
      const estimatedFee = Math.round(paymentIntent.amount * 0.029 + 30);
      paymentData.stripeFee = estimatedFee;
      paymentData.netAmount = paymentIntent.amount - estimatedFee;
    }

    // Add timestamps
    if (status === 'succeeded') {
      paymentData.capturedAt = new Date();
    } else if (status === 'failed') {
      paymentData.failedAt = new Date();
      paymentData.failureCode = paymentIntent.last_payment_error?.code;
      paymentData.failureMessage = paymentIntent.last_payment_error?.message;
    }

    // Save payment record
    await Payment.create(paymentData);

    console.log(`✅ Payment record created for Order ${order._id}`);
  } catch (error) {
    console.error('❌ Error creating payment record:', error);
    // Don't throw - this shouldn't fail the webhook
  }
}

/**
 * GET method to verify webhook is working (for testing)
 */
export async function GET() {
  return NextResponse.json({
    status: 'Webhook endpoint is active',
    configured: !!webhookSecret,
  });
}
