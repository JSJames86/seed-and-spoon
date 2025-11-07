'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Fetch donation details
    fetch(`/api/donations/session/${sessionId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.ok) {
          setDonation(result.data);
        } else {
          setError(result.error || 'Failed to load donation details');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load donation details');
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something Went Wrong
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'We could not find your donation details.'}
            </p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Thank You Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your generous donation is making a real difference in our community.
            </p>

            {/* Donation Details */}
            <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">Amount</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatAmount(donation.amount, donation.currency)}
                  {donation.interval === 'month' && (
                    <span className="text-lg text-gray-600">/month</span>
                  )}
                </span>
              </div>

              {donation.interval === 'month' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-orange-100 border-2 border-orange-200 rounded-xl p-4"
                >
                  <p className="text-sm text-orange-800 font-medium">
                    🌟 You've set up a monthly donation! Thank you for your ongoing
                    support.
                  </p>
                </motion.div>
              )}

              {donation.status === 'paid' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-700">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Payment confirmed</span>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="text-left mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What Happens Next?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-gray-600">
                    You'll receive an email receipt for your tax-deductible donation
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-gray-600">
                    Your donation will directly support our mission to provide nutritious
                    meals
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-gray-600">
                    We'll keep you updated on the impact you're making in our community
                  </p>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg"
              >
                Return Home
              </Link>
              <Link
                href="/volunteer"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Get Involved
              </Link>
            </div>
          </div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Help Us Spread the Word
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Share our mission with friends and family to multiply your impact
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  'https://seedandspoon.org'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                aria-label="Share on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  'https://seedandspoon.org'
                )}&text=${encodeURIComponent(
                  'I just donated to Seed and Spoon NJ! Join me in supporting families in need.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition"
                aria-label="Share on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
