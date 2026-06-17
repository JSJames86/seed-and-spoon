'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AssessmentForm from '@/components/governance/AssessmentForm';
import Alert from '@/components/get-help/Alert';

function AssessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No token provided. Please use the link you were given.');
      setLoading(false);
      return;
    }

    async function validate() {
      try {
        const res = await fetch(`/api/governance/assess?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (data.error === 'already_submitted') {
            setError('This assessment has already been submitted. Thank you.');
          } else {
            setError(data.error || data.message || 'Invalid or expired link.');
          }
          return;
        }

        setAssessmentData(data);
      } catch {
        setError('Could not reach the server. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

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

  return (
    <AssessmentForm
      assessmentId={assessmentData.assessment_id}
      respondentToken={assessmentData.respondent_token}
      title={assessmentData.title}
    />
  );
}

export default function GovernanceAssessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Board Governance Self-Assessment
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seed &amp; Spoon, Inc.
          </p>
        </div>

        {/* Confidentiality notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
            Your responses are <strong>anonymous</strong>. Answers are stored with a random token, not your name.
            No one — including the board chair or staff — can see which responses are yours. We track only
            whether you participated, not what you said. Please answer honestly; candor is what makes this useful.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
          <AssessContent />
        </Suspense>
      </div>
    </div>
  );
}
