/**
 * Order Model
 *
 * Stores order information for Seed & Spoon donations/purchases.
 * Each order is linked to a Stripe PaymentIntent.
 */

import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    // Stripe PaymentIntent ID (unique identifier)
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Order details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: 'usd',
      lowercase: true,
    },

    // Customer information
    customerEmail: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: false,
      trim: true,
    },

    // Payment status
    status: {
      type: String,
      enum: ['pending', 'processing', 'succeeded', 'failed', 'canceled'],
      default: 'pending',
      index: true,
    },

    // Metadata (store additional information like donation purpose, program, etc.)
    metadata: {
      type: Map,
      of: String,
      default: {},
    },

    // Payment method details (populated after successful payment)
    paymentMethod: {
      type: {
        type: String, // 'card', 'us_bank_account', etc.
      },
      last4: String,
      brand: String, // for cards: 'visa', 'mastercard', etc.
    },

    // Timestamps for tracking
    paidAt: {
      type: Date,
    },

    failedAt: {
      type: Date,
    },

    // Error information if payment failed
    errorMessage: {
      type: String,
    },

    errorCode: {
      type: String,
    },

    // Receipt information
    receiptUrl: {
      type: String,
    },

    // Webhook event IDs for idempotency tracking
    webhookEvents: [{
      eventId: String,
      eventType: String,
      processedAt: Date,
    }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for efficient queries
OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

// Methods
OrderSchema.methods.markAsPaid = function(paymentIntent) {
  this.status = 'succeeded';
  this.paidAt = new Date();

  // Store payment method details
  if (paymentIntent.charges?.data?.[0]?.payment_method_details) {
    const pmDetails = paymentIntent.charges.data[0].payment_method_details;
    this.paymentMethod = {
      type: pmDetails.type,
      last4: pmDetails.card?.last4 || pmDetails.us_bank_account?.last4,
      brand: pmDetails.card?.brand,
    };
  }

  // Store receipt URL
  if (paymentIntent.charges?.data?.[0]?.receipt_url) {
    this.receiptUrl = paymentIntent.charges.data[0].receipt_url;
  }

  return this.save();
};

OrderSchema.methods.markAsFailed = function(errorMessage, errorCode) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

OrderSchema.methods.addWebhookEvent = function(eventId, eventType) {
  // Check if we've already processed this webhook event (idempotency)
  const alreadyProcessed = this.webhookEvents.some(e => e.eventId === eventId);

  if (!alreadyProcessed) {
    this.webhookEvents.push({
      eventId,
      eventType,
      processedAt: new Date(),
    });
  }

  return alreadyProcessed;
};

// Prevent model recompilation in development (Next.js hot reload)
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
