'use client';

import { useState, useEffect } from 'react';
import Alert from '@/components/get-help/Alert';

export default function AdminPanel({ onSelectAssessment }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Invite form state
  const [inviteAssessmentId, setInviteAssessmentId] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [inviteResult, setInviteResult] = useState(null);
  const [issuedTokens, setIssuedTokens] = useState([]);

  async function loadAssessments() {
    try {
      const res = await fetch('/api/governance');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAssessments(data.assessments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAssessments(); }, []);

  async function createCycle(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_cycle', title: newTitle.trim() }),
      });
      if (!res.ok) throw new Error('Failed to create');
      setNewTitle('');
      await loadAssessments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(assessmentId, status) {
    try {
      await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', assessment_id: assessmentId, status }),
      });
      await loadAssessments();
    } catch (err) {
      setError(err.message);
    }
  }

  async function issueInvite(e) {
    e.preventDefault();
    if (!memberName.trim()) return;
    setInviteResult(null);
    try {
      const memberId = crypto.randomUUID();
      const res = await fetch('/api/governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_invites',
          assessment_id: inviteAssessmentId,
          members: [{ id: memberId, name: memberName.trim(), email: memberEmail.trim() || null }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newTokens = (data.invites || []).map(inv => ({
        name: inv.board_member_name,
        email: inv.board_member_email,
        token: inv.respondent_token,
      }));
      setIssuedTokens(prev => [...prev, ...newTokens]);
      setInviteResult({ type: 'success', message: 'Invite issued' });
      setMemberName('');
      setMemberEmail('');
      await loadAssessments();
    } catch (err) {
      setInviteResult({ type: 'error', message: err.message });
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Create cycle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Assessment Cycle</h3>
        <form onSubmit={createCycle} className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder='e.g. "2026 Annual"'
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {creating ? '...' : 'Create'}
          </button>
        </form>
      </div>

      {/* Assessment list */}
      {assessments.map(a => (
        <div key={a.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
              <p className="text-xs text-gray-500">
                Status: <span className="font-medium capitalize">{a.status}</span>
                {' '}&middot;{' '}
                {a.participation.submitted}/{a.participation.invited} submitted
              </p>
            </div>
            <div className="flex gap-2">
              {a.status === 'draft' && (
                <button onClick={() => updateStatus(a.id, 'open')} className="px-3 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium">
                  Open
                </button>
              )}
              {a.status === 'open' && (
                <button onClick={() => updateStatus(a.id, 'closed')} className="px-3 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 font-medium">
                  Close
                </button>
              )}
              <button onClick={() => onSelectAssessment(a.id)} className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium">
                Results
              </button>
            </div>
          </div>

          {/* Invite section */}
          {a.status !== 'closed' && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              {inviteAssessmentId === a.id ? (
                <div className="space-y-3">
                  <form onSubmit={issueInvite} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={memberName}
                      onChange={e => setMemberName(e.target.value)}
                      placeholder="Board member name"
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      required
                    />
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <button type="submit" className="px-3 py-1.5 text-sm rounded bg-green-700 text-white hover:bg-green-800 font-medium">
                      Issue Token
                    </button>
                  </form>
                  {inviteResult && <Alert type={inviteResult.type} message={inviteResult.message} onClose={() => setInviteResult(null)} />}
                  {issuedTokens.filter(t => assessments.find(aa => aa.id === a.id)).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Issued tokens (share the link privately):</p>
                      {issuedTokens.map((t, i) => (
                        <div key={i} className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-mono break-all">
                          {t.name}: /governance/assess?token={t.token}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setInviteAssessmentId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                    Close invite panel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setInviteAssessmentId(a.id); setIssuedTokens([]); }}
                  className="text-xs text-green-700 hover:text-green-800 font-medium"
                >
                  + Issue board member tokens
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {assessments.length === 0 && (
        <p className="text-center text-gray-500 py-8">No assessment cycles yet. Create one above.</p>
      )}
    </div>
  );
}
