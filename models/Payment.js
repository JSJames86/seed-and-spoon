/**
 * Payment Model
 *
 * Stores detailed payment transaction history for auditing and reconciliation.
 * This is separate from Order to maintain a complete audit trail.
 */

import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    // Reference to Order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    // Stripe identifiers
    paymentIntentId: {
      type: String,
      required: true,
      index: true,
    },

    chargeId: {
      type: String,
      index: true,
    },

    // Transaction details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    amountReceived: {
      type: Number, // Net amount after fees
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: 'usd',
      lowercase: true,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },

    // Customer information
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Payment method
    paymentMethod: {
      id: String,
      type: String, // 'card', 'us_bank_account', etc.
      card: {
        brand: String,
        last4: String,
        exp_month: Number,
        exp_year: Number,
      },
    },

    // Fees and net amount
    stripeFee: {
      type: Number,
      default: 0,
    },

    netAmount: {
      type: Number,
    },

    // Receipt and invoice
    receiptUrl: {
      type: String,
    },

    receiptNumber: {
      type: String,
    },

    // Refund information
    refunds: [{
      id: String,
      amount: Number,
      reason: String,
      status: String,
      created: Date,
    }],

    // Risk evaluation (for fraud detection)
    riskScore: {
      type: Number,
    },

    riskLevel: {
      type: String,
      enum: ['normal', 'elevated', 'highest'],
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
      default: {},
    },

    // Raw Stripe response for debugging (optional)
    stripeResponse: {
      type: Object,
    },

    // Transaction timestamps
    authorizedAt: Date,
    capturedAt: Date,
    failedAt: Date,
    refundedAt: Date,

    // Error details
    failureCode: String,
    failureMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for reporting and queries
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ customerEmail: 1, createdAt: -1 });
PaymentSchema.index({ createdAt: -1 });

// Static methods for reporting
PaymentSchema.statics.getTotalRevenue = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalNet: { $sum: '$netAmount' },
        count: { $sum: 1 },
      },
    },
  ]);
};

// Prevent model recompilation in development
export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
