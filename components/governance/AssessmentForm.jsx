'use client';

import { useState } from 'react';
import { boardAssessment } from '@/data/boardAssessment';
import FormSection from '@/components/get-help/FormSection';
import Alert from '@/components/get-help/Alert';

function RatingButton({ rating, selected, onSelect }) {
  const colors = {
    SD: 'bg-red-100 text-red-800 border-red-300',
    D: 'bg-orange-100 text-orange-800 border-orange-300',
    A: 'bg-green-100 text-green-800 border-green-300',
    SA: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    DK: 'bg-gray-100 text-gray-600 border-gray-300',
  };
  const base = 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50';

  return (
    <button
      type="button"
      onClick={() => onSelect(rating)}
      className={`
        px-2.5 py-1.5 rounded border text-xs font-semibold transition-all
        ${selected ? colors[rating] : base}
      `}
      title={boardAssessment.ratingLabels[rating]}
    >
      {rating}
    </button>
  );
}

export default function AssessmentForm({ assessmentId, respondentToken, title }) {
  const [ratings, setRatings] = useState({});
  const [texts, setTexts] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function setRating(statementId, domainKey, rating) {
    setRatings(prev => {
      if (prev[statementId]?.rating === rating) {
        const next = { ...prev };
        delete next[statementId];
        return next;
      }
      return { ...prev, [statementId]: { domain_key: domainKey, statement_id: statementId, rating } };
    });
  }

  function setText(promptId, body) {
    setTexts(prev => ({ ...prev, [promptId]: body }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const totalStatements = boardAssessment.domains.reduce((sum, d) => sum + d.statements.length, 0);
    const answered = Object.keys(ratings).length;
    if (answered < totalStatements) {
      const unanswered = totalStatements - answered;
      if (!window.confirm(`You have ${unanswered} unanswered statement(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/governance/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: assessmentId,
          respondent_token: respondentToken,
          ratings: Object.values(ratings),
          texts: Object.entries(texts)
            .filter(([, body]) => body?.trim())
            .map(([prompt_id, body]) => ({ prompt_id, body })),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({ type: 'success', message: 'Your assessment has been submitted. Thank you for your honest input.' });
      } else {
        setResult({ type: 'error', message: data.message || data.error || 'Submission failed.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Could not reach the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.type === 'success') {
    return (
      <div className="text-center py-12">
        <Alert type="success" title="Submitted" message={result.message} />
        <p className="mt-6 text-sm text-gray-500">You can close this page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Rating scale legend */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>SD</strong> Strongly Disagree &middot;{' '}
          <strong>D</strong> Disagree &middot;{' '}
          <strong>A</strong> Agree &middot;{' '}
          <strong>SA</strong> Strongly Agree &middot;{' '}
          <strong>DK</strong> Don&apos;t Know
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          If unsure, choose DK &mdash; that&apos;s useful data too.
        </p>
      </div>

      {/* Domains + statements */}
      {boardAssessment.domains.map(domain => (
        <FormSection
          key={domain.key}
          title={domain.title}
          description={domain.note}
        >
          <div className="space-y-4">
            {domain.statements.map(stmt => (
              <div key={stmt.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                  {stmt.text}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {boardAssessment.ratingScale.map(r => (
                    <RatingButton
                      key={r}
                      rating={r}
                      selected={ratings[stmt.id]?.rating === r}
                      onSelect={(rating) => setRating(stmt.id, domain.key, rating)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      ))}

      {/* Text reflections */}
      <FormSection title="Individual Reflections" description="These are anonymous and help the board grow.">
        {boardAssessment.textPrompts.individual.map(prompt => (
          <div key={prompt.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {prompt.text}
            </label>
            <textarea
              value={texts[prompt.id] || ''}
              onChange={e => setText(prompt.id, e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
        ))}
      </FormSection>

      <FormSection title="Board-Level Reflections">
        {boardAssessment.textPrompts.board.map(prompt => (
          <div key={prompt.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {prompt.text}
            </label>
            <textarea
              value={texts[prompt.id] || ''}
              onChange={e => setText(prompt.id, e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
        ))}
      </FormSection>

      <FormSection title="Action Priorities" description="Optional. If you have specific priorities in mind, note them here.">
        {boardAssessment.textPrompts.action.map(prompt => (
          <div key={prompt.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {prompt.text}
            </label>
            <input
              type="text"
              value={texts[prompt.id] || ''}
              onChange={e => setText(prompt.id, e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="Priority — owner — target date"
            />
          </div>
        ))}
      </FormSection>

      {result && (
        <Alert type={result.type} message={result.message} onClose={() => setResult(null)} />
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Your responses are anonymous. They will be aggregated with other board members&apos; responses.
          No answer will be linked to your name.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-6 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </div>
    </form>
  );
}
