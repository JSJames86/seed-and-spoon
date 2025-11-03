'use client';

/**
 * CheckoutForm Component
 *
 * This component mounts the Stripe Payment Element and handles payment confirmation.
 * It must be wrapped in the Elements provider from @stripe/react-stripe-js.
 *
 * Key features:
 * - Mounts Payment Element for collecting payment method
 * - Handles payment confirmation
 * - Shows loading states and error messages
 * - Redirects to success page after payment
 */

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ clientSecret, amount, email, name }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if payment was already successful (useful for redirects)
  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded! Redirecting...');
          setTimeout(() => {
            router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
          }, 2000);
          break;
        case 'processing':
          setMessage('Your payment is processing. You will receive a confirmation email shortly.');
          break;
        case 'requires_payment_method':
          // Default state - ready to accept payment
          break;
        default:
          setMessage('Something went wrong. Please try again.');
          break;
      }
    });
  }, [stripe, clientSecret, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Return URL after payment (for redirect-based payment methods)
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: name || undefined,
              email: email || undefined,
            },
          },
        },
        // Redirect handling - set to 'if_required' to handle in-page for cards
        redirect: 'if_required',
      });

      // Handle the result
      if (error) {
        // Payment failed
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message);
        } else {
          setMessage('An unexpected error occurred. Please try again.');
        }
        console.error('Payment error:', error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded!
        setMessage('Payment successful! Redirecting...');
        console.log('Payment successful:', paymentIntent);

        // Redirect to success page
        setTimeout(() => {
          router.push(`/checkout/success?payment_intent=${paymentIntent.id}`);
        }, 2000);
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing (common for bank transfers)
        setMessage('Payment is processing. You will receive a confirmation email.');
      } else {
        setMessage('Unexpected payment status. Please contact support.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
    // You can customize which payment methods appear
    // paymentMethodOrder: ['card', 'klarna', 'affirm'],
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Donation Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
        {email && (
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-gray-600">Receipt email:</span>
            <span className="text-gray-900">{email}</span>
          </div>
        )}
      </div>

      {/* Payment Element */}
      <div className="mb-6">
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
        />
      </div>

      {/* Error/Success Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.includes('success') || message.includes('succeeded')
            ? 'bg-green-50 border-l-4 border-green-500'
            : message.includes('processing')
            ? 'bg-blue-50 border-l-4 border-blue-500'
            : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <p className={
            message.includes('success') || message.includes('succeeded')
              ? 'text-green-700'
              : message.includes('processing')
              ? 'text-blue-700'
              : 'text-red-700'
          }>
            {message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </button>

      {/* Security Note */}
      <p className="text-xs text-center text-gray-500 mt-4">
        By confirming your payment, you allow Seed & Spoon to charge your payment method for this donation.
      </p>
    </form>
  );
}
