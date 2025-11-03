'use client';

/**
 * Payment Success Page
 *
 * This page is shown after a successful payment.
 * It retrieves the payment details and displays a confirmation message.
 */

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment information found');
      setLoading(false);
      return;
    }

    // Fetch payment details from API
    fetch(`/api/create-payment-intent?payment_intent_id=${paymentIntentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPaymentDetails(data);
        }
      })
      .catch(err => {
        console.error('Error fetching payment details:', err);
        setError('Failed to retrieve payment details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Details</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thank You for Your Donation!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your contribution makes a real difference in our community.
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4">Donation Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {paymentDetails.status === 'succeeded' ? 'Completed' : paymentDetails.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="text-sm text-gray-900 font-mono">
                    {paymentIntentId.substring(0, 20)}...
                  </span>
                </div>

                {paymentDetails.order?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">
                      {new Date(paymentDetails.order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Receipt Note */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
            <p className="text-sm text-blue-900">
              <strong>Receipt on the way!</strong> A detailed receipt has been sent to your email address.
              Please check your inbox (and spam folder) for confirmation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Return to Home
            </Link>
            <Link
              href="/checkout"
              className="inline-block bg-white border-2 border-green-500 text-green-500 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Make Another Donation
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow">
          <p className="mb-2">
            📧 Questions about your donation? Contact us at{' '}
            <a href="mailto:support@seedandspoon.org" className="text-green-600 hover:underline">
              support@seedandspoon.org
            </a>
          </p>
          <p>
            💚 Your donation is tax-deductible. Save your receipt for tax purposes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
