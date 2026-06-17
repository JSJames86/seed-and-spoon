'use client';

import { useState } from 'react';
import BaselineSurvey from './BaselineSurvey';
import WeeklyCheckin from './WeeklyCheckin';
import EndlineSurvey from './EndlineSurvey';

const TABS = [
  { key: 'baseline', label: 'Baseline', description: 'Before first kit' },
  { key: 'weekly', label: 'Weekly Check-In', description: 'Each of 6 weeks' },
  { key: 'endline', label: 'End of Pilot', description: 'After week 6' },
];

export default function SurveyPage() {
  const [activeTab, setActiveTab] = useState('baseline');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            5 Loaves Pilot Survey
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Seed &amp; Spoon &mdash; Summer Pilot Program
          </p>
        </div>

        {/* Consent notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
            Taking this survey is completely voluntary. Your answers will <strong>not</strong> affect
            whether your family receives meals &mdash; that never changes. We use a code, not your name,
            and your answers are kept private. You can skip any question or stop at any time. We ask
            only so we can show funders the program works and keep it running.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex-1 py-3 px-2 text-center text-sm font-medium transition-colors
                ${activeTab === tab.key
                  ? 'border-b-2 border-green-700 text-green-700 dark:text-green-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
            >
              <span className="block">{tab.label}</span>
              <span className="block text-xs font-normal mt-0.5 opacity-70">{tab.description}</span>
            </button>
          ))}
        </div>

        {/* Active form */}
        {activeTab === 'baseline' && <BaselineSurvey />}
        {activeTab === 'weekly' && <WeeklyCheckin />}
        {activeTab === 'endline' && <EndlineSurvey />}
      </div>
    </div>
  );
}
