'use client';

import { useConsent } from '@/hooks/useConsent';
import Link from 'next/link';

export default function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openSettings } = useConsent();

  // Don't render if banner shouldn't be shown
  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop overlay for focus */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Cookie Banner */}
      <div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-green-600 shadow-2xl animate-slide-up"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h2
                id="cookie-banner-title"
                className="text-xl font-bold text-gray-900 mb-2"
              >
                🍪 We Value Your Privacy
              </h2>
              <p
                id="cookie-banner-description"
                className="text-sm text-gray-700 leading-relaxed"
              >
                We use cookies to enhance your browsing experience, serve personalized content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                You can manage your preferences or reject non-essential cookies.{' '}
                <Link
                  href="/legal/privacy"
                  className="text-green-600 hover:text-green-700 underline font-medium"
                >
                  Learn more in our Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              {/* Customize Button */}
              <button
                onClick={openSettings}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Customize cookie preferences"
              >
                Customize
              </button>

              {/* Reject All Button */}
              <button
                onClick={rejectAll}
                className="px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 hover:border-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Reject all non-essential cookies"
              >
                Reject All
              </button>

              {/* Accept All Button */}
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Additional Info for GDPR/CCPA Compliance */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Your Privacy Rights:</strong> Under GDPR and CCPA, you have the right to
              access, delete, or opt-out of the sale of your personal data. Essential cookies
              are required for basic site functionality and cannot be disabled. For more
              information about our data practices, please review our{' '}
              <Link
                href="/legal/privacy"
                className="text-green-600 hover:text-green-700 underline"
              >
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link
                href="/legal/terms"
                className="text-green-600 hover:text-green-700 underline"
              >
                Terms & Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
