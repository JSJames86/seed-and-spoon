'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DonationSuccessPage() {
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

    const fetchDonationDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/donations/checkout/success?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error('Failed to retrieve donation details');
        }

        const data = await response.json();
        setDonation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to retrieve donation details'}</p>
          <Link
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            {/* Thank You Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Donation! 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your generosity helps us make a real difference in our community.
            </p>

            {/* Donation Details */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
              <div className="text-5xl font-bold text-green-600 mb-2">
                ${(donation.amount / 100).toFixed(2)}
              </div>
              {donation.interval === 'monthly' && (
                <div className="text-lg font-semibold text-green-700 mb-1">
                  Monthly Donation
                </div>
              )}
              <div className="text-sm text-gray-600">
                {donation.interval === 'monthly' 
                  ? 'Thank you for becoming a monthly supporter!'
                  : 'One-time donation'}
              </div>
            </div>

            {/* Campaign Info */}
            {donation.campaign && (
              <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Supporting: {donation.campaign.name}
                </h3>
                <p className="text-sm text-gray-600">{donation.campaign.description}</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
              <ul className="text-left space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    A confirmation email has been sent to{' '}
                    <strong>{donation.email}</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Your tax-deductible receipt will be generated and emailed within 24 hours
                  </span>
                </li>
                {donation.interval === 'monthly' && (
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      Your monthly donation will be processed automatically each month
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition text-center"
              >
                View Dashboard
              </Link>
              <Link
                href="/"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition text-center"
              >
                Return Home
              </Link>
            </div>
          </div>

          {/* Impact Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 bg-orange-50 border-2 border-orange-200 rounded-2xl p-6"
          >
            <h3 className="font-semibold text-orange-900 mb-2">
              Your Impact
            </h3>
            <p className="text-orange-800">
              Your donation will help provide fresh, nutritious meals to families in need
              across New Jersey. Together, we're building a stronger, healthier community.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
