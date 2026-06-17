'use client';

import { useState, useEffect } from 'react';
import { boardAssessment } from '@/data/boardAssessment';
import Alert from '@/components/get-help/Alert';

function FlagBadge({ label, active, color }) {
  if (!active) return null;
  const colors = {
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {label}
    </span>
  );
}

function RatingBar({ counts, total }) {
  if (!total) return <div className="text-xs text-gray-400">No responses</div>;
  const items = [
    { key: 'SD', count: counts.ct_sd, color: 'bg-red-400' },
    { key: 'D', count: counts.ct_d, color: 'bg-orange-400' },
    { key: 'A', count: counts.ct_a, color: 'bg-green-400' },
    { key: 'SA', count: counts.ct_sa, color: 'bg-emerald-500' },
    { key: 'DK', count: counts.ct_dk, color: 'bg-gray-300' },
  ];
  return (
    <div className="flex h-5 rounded overflow-hidden" title={items.map(i => `${i.key}: ${i.count}`).join(', ')}>
      {items.map(item => {
        const pct = (item.count / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={item.key}
            className={`${item.color} relative group`}
            style={{ width: `${pct}%` }}
          >
            {pct >= 15 && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white">
                {item.count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TextResponses({ texts, prompts }) {
  const grouped = {};
  for (const t of texts) {
    if (!grouped[t.prompt_id]) grouped[t.prompt_id] = [];
    grouped[t.prompt_id].push(t.body);
  }

  const allPrompts = [...prompts.individual, ...prompts.board, ...prompts.action];

  return (
    <div className="space-y-6">
      {allPrompts.map(prompt => {
        const responses = grouped[prompt.id] || [];
        if (responses.length === 0) return null;
        return (
          <div key={prompt.id}>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{prompt.text}</h4>
            <ul className="space-y-2">
              {responses.map((body, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {body}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function ResultsDashboard({ assessmentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/governance?assessment_id=${assessmentId}`);
        if (!res.ok) throw new Error('Failed to load results');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessmentId]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading results...</div>;
  if (error) return <Alert type="error" message={error} />;
  if (!data?.assessment) return <Alert type="warning" message="Assessment not found." />;

  const { assessment, results, participation, texts } = data;

  const resultsByStatement = {};
  for (const r of results) {
    resultsByStatement[r.statement_id] = r;
  }

  const domainScores = boardAssessment.domains.map(domain => {
    const stmtResults = domain.statements
      .map(s => resultsByStatement[s.id])
      .filter(Boolean);
    const avgFavorable = stmtResults.length > 0
      ? stmtResults.reduce((sum, r) => sum + (r.favorable_share || 0), 0) / stmtResults.length
      : null;
    const hasFlags = stmtResults.some(r => r.needs_attention || r.no_shared_view || r.info_gap);
    return { domain, stmtResults, avgFavorable, hasFlags };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{assessment.title}</h2>
          <p className="text-sm text-gray-500">
            Status: <span className="font-medium capitalize">{assessment.status}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-700">
            {participation.submitted} <span className="text-sm font-normal text-gray-500">of {participation.invited}</span>
          </p>
          <p className="text-xs text-gray-500">board members submitted</p>
        </div>
      </div>

      {/* Domain summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainScores.map(({ domain, avgFavorable, hasFlags }) => (
          <div
            key={domain.key}
            className={`p-4 rounded-lg border-2 ${
              hasFlags ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{domain.title}</h3>
            {avgFavorable !== null ? (
              <p className="text-2xl font-bold mt-1" style={{
                color: avgFavorable >= 0.75 ? '#15803d' : avgFavorable >= 0.5 ? '#d97706' : '#dc2626'
              }}>
                {Math.round(avgFavorable * 100)}%
                <span className="text-xs font-normal text-gray-500 ml-1">favorable</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">No data</p>
            )}
            {hasFlags && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">Has flagged items</p>
            )}
          </div>
        ))}
      </div>

      {/* Detailed results per domain */}
      {domainScores.map(({ domain }) => (
        <div key={domain.key} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 pb-2">
            {domain.title}
          </h3>
          {domain.note && (
            <p className="text-xs text-gray-500 italic">{domain.note}</p>
          )}
          {domain.statements.map(stmt => {
            const r = resultsByStatement[stmt.id];
            return (
              <div key={stmt.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{stmt.text}</p>
                {r ? (
                  <>
                    <RatingBar counts={r} total={r.ct_total} />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <FlagBadge label="Needs Attention" active={r.needs_attention} color="red" />
                      <FlagBadge label="No Shared View" active={r.no_shared_view} color="yellow" />
                      <FlagBadge label="Info Gap" active={r.info_gap} color="blue" />
                      {!r.needs_attention && !r.no_shared_view && !r.info_gap && (
                        <span className="text-xs text-gray-400">
                          {Math.round((r.favorable_share || 0) * 100)}% favorable
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">No responses yet</p>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Bar legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> SD</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> D</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> A</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> SA</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-300 inline-block" /> DK</span>
      </div>

      {/* Free-text reflections */}
      {texts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">
            Reflections (unattributed)
          </h3>
          <TextResponses texts={texts} prompts={boardAssessment.textPrompts} />
        </div>
      )}
    </div>
  );
}
