'use client';

import VolunteerAdminPanel from '@/components/volunteer/VolunteerAdminPanel';

export default function VolunteerAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Volunteer Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Invite, review, and manage volunteer onboarding
          </p>
        </div>
        <VolunteerAdminPanel />
      </div>
    </div>
  );
}
