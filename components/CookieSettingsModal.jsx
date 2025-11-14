'use client';

import { useConsent } from '@/hooks/useConsent';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CookieSettingsModal() {
  const {
    showSettings,
    consent,
    closeSettings,
    updateCategory,
    saveCustomPreferences,
    acceptAll,
    rejectAll,
    COOKIE_CATEGORIES,
  } = useConsent();

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle focus trap and escape key
  useEffect(() => {
    if (!showSettings) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement;

    // Focus modal
    modalRef.current?.focus();

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeSettings();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      // Restore focus
      previousFocusRef.current?.focus();
    };
  }, [showSettings, closeSettings]);

  // Don't render if modal shouldn't be shown
  if (!showSettings) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🍪</span>
            <h2 id="cookie-settings-title" className="text-2xl font-bold">
              Cookie Settings
            </h2>
          </div>
          <button
            onClick={closeSettings}
            className="text-white hover:text-gray-200 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close cookie settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            We use cookies to improve your experience on our website. You can choose which
            categories of cookies to allow. Please note that essential cookies cannot be
            disabled as they are necessary for the website to function properly.
          </p>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
              <div
                key={key}
                className="border border-gray-200 rounded-lg p-5 hover:border-green-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {category.required && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                          Always Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent[key] || false}
                        onChange={(e) => updateCategory(key, e.target.checked)}
                        disabled={category.required}
                        className="sr-only peer"
                        aria-label={`${category.required ? 'Always enabled' : 'Toggle'} ${category.name} cookies`}
                      />
                      <div
                        className={`
                          w-14 h-8 rounded-full peer
                          peer-focus:ring-4 peer-focus:ring-green-300
                          ${category.required ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-300'}
                          peer-checked:bg-green-600
                          after:content-['']
                          after:absolute
                          after:top-1
                          after:left-[4px]
                          after:bg-white
                          after:rounded-full
                          after:h-6
                          after:w-6
                          after:transition-all
                          peer-checked:after:translate-x-6
                        `}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Links */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              For more information about how we use cookies and protect your data, please read our{' '}
              <Link
                href="/privacy-policy"
                className="text-green-600 hover:text-green-700 underline font-medium"
              >
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link
                href="/terms"
                className="text-green-600 hover:text-green-700 underline font-medium"
              >
                Terms & Conditions
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
          <button
            onClick={rejectAll}
            className="flex-1 px-6 py-3 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-50 hover:border-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reject All
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 hover:border-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Accept All
          </button>
          <button
            onClick={saveCustomPreferences}
            className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Save Preferences
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
