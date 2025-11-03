/**
 * Create Payment Intent API Route
 *
 * This endpoint creates a Stripe PaymentIntent and stores the pending order in MongoDB.
 * It should be called from your frontend checkout page before mounting the Payment Element.
 *
 * Security:
 * - Never expose Stripe secret keys to the frontend
 * - Validate all input amounts and metadata
 * - Use HTTPS in production
 * - Consider rate limiting to prevent abuse
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      amount,
      currency = 'usd',
      receipt_email,
      customer_name,
      metadata = {},
    } = body;

    // ===== VALIDATION =====
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number.' },
        { status: 400 }
      );
    }

    // Minimum amount check (Stripe requires minimum 50 cents for USD)
    const minimumAmount = currency === 'usd' ? 50 : 50;
    if (amount < minimumAmount) {
      return NextResponse.json(
        { error: `Amount must be at least ${minimumAmount} cents ($0.50 USD).` },
        { status: 400 }
      );
    }

    // Maximum amount check (prevent abuse)
    const maximumAmount = 100000000; // $1,000,000 in cents
    if (amount > maximumAmount) {
      return NextResponse.json(
        { error: 'Amount exceeds maximum allowed value.' },
        { status: 400 }
      );
    }

    // Email validation (basic)
    if (receipt_email && !receipt_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      );
    }

    // ===== CREATE STRIPE PAYMENT INTENT =====
    const paymentIntentParams = {
      amount: Math.round(amount), // Ensure integer (cents)
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true, // Enable all payment methods configured in your Stripe Dashboard
      },
      metadata: {
        ...metadata,
        source: 'seed-and-spoon-checkout',
        environment: process.env.NODE_ENV,
      },
    };

    // Add receipt email if provided
    if (receipt_email) {
      paymentIntentParams.receipt_email = receipt_email;
    }

    // Add customer name to description
    if (customer_name) {
      paymentIntentParams.description = `Donation from ${customer_name}`;
    } else {
      paymentIntentParams.description = 'Seed & Spoon Donation';
    }

    // Create the PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // ===== STORE IN MONGODB =====
    await connectDB();

    const order = await Order.create({
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toLowerCase(),
      customerEmail: receipt_email || null,
      customerName: customer_name || null,
      status: 'pending',
      metadata: metadata,
    });

    console.log(`✅ Payment Intent created: ${paymentIntent.id} | Order ID: ${order._id}`);

    // ===== RETURN CLIENT SECRET =====
    // The client secret is needed by the frontend to confirm the payment
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order._id.toString(),
      amount: amount,
      currency: currency,
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid request to payment processor.' },
        { status: 400 }
      );
    }

    // Generic error response (don't expose internal details)
    return NextResponse.json(
      { error: 'Unable to create payment. Please try again.' },
      { status: 500 }
    );
  }
}

// ===== OPTIONAL: GET METHOD TO RETRIEVE PAYMENT INTENT STATUS =====
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id parameter.' },
        { status: 400 }
      );
    }

    // Retrieve from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Retrieve from database
    await connectDB();
    const order = await Order.findOne({ paymentIntentId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
      },
    });

  } catch (error) {
    console.error('❌ Error retrieving payment intent:', error);
    return NextResponse.json(
      { error: 'Unable to retrieve payment status.' },
      { status: 500 }
    );
  }
}
