/**
 * Donation Page Client Component
 *
 * Data Flow:
 * 1. User selects amount and interval (one-time or monthly)
 * 2. User clicks "Donate" button
 * 3. Component calls createDonation() from /lib/api.js
 * 4. API helper sends POST request to backend: /api/donations/create
 * 5. Backend creates Stripe checkout session and returns clientSecret
 * 6. Component redirects user to Stripe Checkout page
 * 7. After payment, Stripe redirects to success or cancel URL
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { createDonation } from '@/lib/api';

export default function DonatePage() {
  const [interval, setInterval] = useState('one_time');
  const [selectedAmount, setSelectedAmount] = useState(5000); // Default $50
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const presetAmounts = [2500, 5000, 10000, 25000]; // $25, $50, $100, $250

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
    setError(null);
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    setError(null);
  };

  const handleDonate = async () => {
    setError(null);

    // Determine final amount
    let finalAmount;
    if (isCustom) {
      const customAmountInDollars = parseFloat(customAmount);
      if (isNaN(customAmountInDollars) || customAmountInDollars < 1) {
        setError('Please enter an amount of at least $1.00');
        return;
      }
      finalAmount = Math.round(customAmountInDollars * 100);
    } else if (selectedAmount) {
      finalAmount = selectedAmount;
    } else {
      setError('Please select an amount');
      return;
    }

    setIsLoading(true);

    try {
      // Generate success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/donate`;

      // Use centralized API helper to create donation
      const result = await createDonation({
        amount: finalAmount / 100, // Convert cents to dollars
        interval: interval === 'one_time' ? 'one-time' : 'monthly',
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe Checkout using the session URL
      // The backend should return either checkoutUrl or sessionUrl
      const checkoutUrl = result.checkoutUrl || result.sessionUrl || result.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (err) {
      setError(err.message || 'Unable to process donation. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Make a Difference Today
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your donation helps us provide fresh, nutritious meals to families in
              need across New Jersey. Every dollar makes a real impact.
            </p>
          </div>

          {/* Donation Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Interval Toggle */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setInterval('one_time')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  interval === 'one_time'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                One-Time
              </button>
              <button
                onClick={() => setInterval('month')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                  interval === 'month'
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
            </div>

            {interval === 'month' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-orange-800 font-medium">
                  🌟 Monthly donations provide consistent support and help us plan ahead
                  to serve more families!
                </p>
              </motion.div>
            )}

            {/* Amount Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Amount
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountClick(amount)}
                    className={`py-6 px-4 rounded-xl font-bold text-2xl transition-all ${
                      selectedAmount === amount && !isCustom
                        ? 'bg-green-600 text-white shadow-lg scale-105 ring-4 ring-green-200'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    ${amount / 100}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <button
                onClick={handleCustomClick}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all mb-4 ${
                  isCustom
                    ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                Custom Amount
              </button>

              {isCustom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-600">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="w-full py-4 pl-12 pr-6 text-2xl font-bold border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200"
                    autoFocus
                  />
                </motion.div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6"
              >
                <p className="text-red-800 font-medium">{error}</p>
              </motion.div>
            )}

            {/* Donate Button */}
            <button
              onClick={handleDonate}
              disabled={isLoading}
              className={`w-full py-6 rounded-xl font-bold text-xl transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl hover:shadow-2xl hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Donate ${
                  isCustom && customAmount
                    ? `$${customAmount}`
                    : selectedAmount
                    ? `$${selectedAmount / 100}`
                    : ''
                }${interval === 'month' ? '/month' : ''}`
              )}
            </button>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>

          {/* Impact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">$25</div>
              <p className="text-gray-600">Provides meals for a family of 4</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-orange-500 mb-2">$50</div>
              <p className="text-gray-600">Supports our weekly food distribution</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">$100</div>
              <p className="text-gray-600">Feeds 10 families for a week</p>
            </div>
          </motion.div>

          {/* Tax Deductible Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            <p>
              Seed and Spoon NJ is a 501(c)(3) nonprofit organization.
              <br />
              Your donation is tax-deductible to the fullest extent allowed by law.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
