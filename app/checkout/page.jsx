'use client';

/**
 * Checkout Page - Main entry point
 *
 * This page handles the entire checkout flow:
 * 1. Collect donation amount and customer info
 * 2. Create PaymentIntent via API
 * 3. Mount Stripe Payment Element
 * 4. Confirm payment and handle result
 */

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(25); // Default $25
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [donationPurpose, setDonationPurpose] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Preset donation amounts
  const presetAmounts = [10, 25, 50, 100, 250];

  const handleCreatePaymentIntent = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Determine final amount (custom or preset)
      const finalAmount = customAmount ? parseFloat(customAmount) : amount;

      // Validate
      if (isNaN(finalAmount) || finalAmount < 0.5) {
        throw new Error('Amount must be at least $0.50');
      }

      if (finalAmount > 1000000) {
        throw new Error('Amount exceeds maximum allowed value');
      }

      // Email validation
      if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Please enter a valid email address');
      }

      // Convert dollars to cents
      const amountInCents = Math.round(finalAmount * 100);

      // Call API to create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
          receipt_email: email || undefined,
          customer_name: name || undefined,
          metadata: {
            purpose: donationPurpose,
            amount_dollars: finalAmount.toString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Stripe Elements appearance customization
  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#22c55e', // Green (Tailwind green-500)
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Support Seed & Spoon
          </h1>
          <p className="text-lg text-gray-600">
            Your donation helps us make a difference in our community
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!clientSecret ? (
            /* Step 1: Collect donation info */
            <form onSubmit={handleCreatePaymentIntent} className="space-y-6">
              {/* Donation Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount('');
                      }}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        amount === preset && !customAmount
                          ? 'bg-green-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount(0);
                    }}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-lg"
                    step="0.01"
                    min="0.50"
                  />
                </div>
              </div>

              {/* Donation Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-2">
                  Donation Purpose (Optional)
                </label>
                <select
                  id="purpose"
                  value={donationPurpose}
                  onChange={(e) => setDonationPurpose(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                >
                  <option value="general">General Support</option>
                  <option value="food-drive">Food Drive</option>
                  <option value="education">Education Programs</option>
                  <option value="community-events">Community Events</option>
                  <option value="emergency-relief">Emergency Relief</option>
                </select>
              </div>

              {/* Contact Information */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address (For Receipt)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (!amount && !customAmount)}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl"
              >
                {loading ? 'Processing...' : `Continue to Payment`}
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secured by Stripe · PCI Compliant</span>
              </div>
            </form>
          ) : (
            /* Step 2: Show Stripe Payment Element */
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                clientSecret={clientSecret}
                amount={(customAmount || amount) * 100}
                email={email}
                name={name}
              />
            </Elements>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">🔒 Your payment information is encrypted and secure</p>
          <p>💳 We accept all major credit cards and digital payment methods</p>
        </div>
      </div>
    </div>
  );
}
