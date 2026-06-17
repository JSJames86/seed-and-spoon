'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OnboardingForm from '@/components/volunteer/OnboardingForm';
import Alert from '@/components/get-help/Alert';

function OnboardContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [volunteerData, setVolunteerData] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No token provided. Please use the invite link you were given.');
      setLoading(false);
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/volunteer/onboard?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error === 'already_submitted') {
            setError('This onboarding form has already been submitted. Thank you!');
          } else {
            setError(data.error || 'Invalid or expired invite link.');
          }
          return;
        }

        setVolunteerData(data);
      } catch {
        setError('Could not reach the server. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Validating your invite...</div>;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Alert type="warning" title="Cannot proceed" message={error} />
      </div>
    );
  }

  return (
    <OnboardingForm
      volunteerId={volunteerData.volunteer_id}
      inviteEmail={volunteerData.invite_email}
      firstName={volunteerData.first_name}
      roles={volunteerData.roles}
    />
  );
}

export default function VolunteerOnboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Volunteer Onboarding
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seed &amp; Spoon, Inc.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
            Welcome! Please complete this form to finish your volunteer onboarding. Your personal information
            is stored securely and used only for volunteer coordination. Accommodations and background check
            outcomes are kept <strong>strictly confidential</strong>.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
          <OnboardContent />
        </Suspense>
      </div>
    </div>
  );
}
