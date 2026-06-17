'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Alert from '@/components/get-help/Alert';

function GuardianConsentContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consentData, setConsentData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No consent token provided. Please use the link you were sent.');
      setLoading(false);
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/volunteer/onboard/guardian?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          if (data.error === 'already_consented') {
            setError('Guardian consent has already been given. Thank you!');
          } else {
            setError(data.error || 'Invalid or expired consent link.');
          }
          return;
        }
        setConsentData(data);
      } catch {
        setError('Could not reach the server. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

  async function handleConsent() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/volunteer/onboard/guardian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit consent');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Validating your link...</div>;
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <Alert type="warning" title="Cannot proceed" message={error} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consent confirmed</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Thank you for confirming consent for {consentData?.volunteer_name}. Their volunteer application can now proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Guardian Consent Required</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>{consentData?.volunteer_name}</strong> has applied to volunteer with Seed &amp; Spoon.
          Because they are under 18, we need your consent before they can participate.
        </p>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p><strong>By giving consent, you confirm that:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>You are the parent or legal guardian of the minor named above.</li>
            <li>You give permission for them to participate in Seed &amp; Spoon volunteer activities.</li>
            <li>You understand that Seed &amp; Spoon serves food and works with community members.</li>
            <li>You have read and accept the liability waiver and code of conduct on behalf of the minor.</li>
            <li>You understand minors will only be assigned supervised roles appropriate for their age.</li>
          </ul>
          <p className="text-[10px] text-gray-400 mt-2">Consent version: {consentData?.consent_version}</p>
        </div>

        <button
          onClick={handleConsent}
          disabled={submitting}
          className="w-full py-3 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50 text-sm"
        >
          {submitting ? 'Submitting...' : 'I Confirm — Give Consent'}
        </button>

        <p className="text-[10px] text-gray-400 text-center">
          Your IP address and the time of consent will be recorded for verification purposes.
        </p>
      </div>
    </div>
  );
}

export default function GuardianConsentPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Guardian Consent
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seed &amp; Spoon Volunteer Program
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
          <GuardianConsentContent />
        </Suspense>
      </div>
    </div>
  );
}
