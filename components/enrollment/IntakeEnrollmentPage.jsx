'use client';

import IntakeEnrollmentForm from './IntakeEnrollmentForm';

export default function IntakeEnrollmentPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            5 Loaves Family Intake &amp; Enrollment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seed &amp; Spoon &mdash; Summer Pilot Program
          </p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
            Safety-critical — complete BEFORE first kit is produced
          </p>
        </div>
        <IntakeEnrollmentForm />
      </div>
    </div>
  );
}
