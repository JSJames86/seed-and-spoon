'use client';

import { useState } from 'react';
import AdminPanel from '@/components/governance/AdminPanel';
import ResultsDashboard from '@/components/governance/ResultsDashboard';

export default function GovernanceDashboardPage() {
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Board Governance
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Assessment cycles, results &amp; trend lines
            </p>
          </div>
          {selectedAssessment && (
            <button
              onClick={() => setSelectedAssessment(null)}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back to Cycles
            </button>
          )}
        </div>

        {selectedAssessment ? (
          <ResultsDashboard assessmentId={selectedAssessment} />
        ) : (
          <AdminPanel onSelectAssessment={setSelectedAssessment} />
        )}
      </div>
    </div>
  );
}
