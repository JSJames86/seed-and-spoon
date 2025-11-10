/**
 * FormSection Component
 *
 * Collapsible section for organizing form fields with progressive disclosure
 */

'use client';

import { useState } from 'react';

export default function FormSection({
  title,
  description,
  children,
  defaultExpanded = true,
  collapsible = false,
  required = false,
  completed = false,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`form-section ${className}`}>
      <div
        className={`
          border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-6
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {title}
              {required && <span className="text-red-500 text-sm">*</span>}
              {completed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Complete
                </span>
              )}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
