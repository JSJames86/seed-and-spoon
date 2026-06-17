'use client';

import { useState, useEffect } from 'react';
import { volunteerOnboarding } from '@/data/volunteerOnboarding';
import Alert from '@/components/get-help/Alert';

function StatusBadge({ status }) {
  const cfg = volunteerOnboarding.statusFlow[status] || { label: status, color: 'gray' };
  const colorMap = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[cfg.color] || colorMap.gray}`}>
      {cfg.label}
    </span>
  );
}

function InviteForm({ onInviteSent }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  async function handleInvite(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', email: email.trim(), first_name: firstName.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({ type: 'success', message: 'Invite issued', invite: data.invite });
      setEmail('');
      setFirstName('');
      onInviteSent?.();
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">Invite New Volunteer</h3>
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name (optional)" className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <button type="submit" disabled={sending} className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50">
          {sending ? '...' : 'Send Invite'}
        </button>
      </form>
      {result && (
        <div>
          <Alert type={result.type} message={result.message} onClose={() => setResult(null)} />
          {result.invite && (
            <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded p-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Invite link (share privately):</p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                /volunteer/onboard?token={result.invite.invite_token}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VolunteerDetail({ volunteerId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/volunteer/onboard?volunteer_id=${volunteerId}`);
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [volunteerId]);

  async function updateStatus(newStatus) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', volunteer_id: volunteerId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function initiateBgCheck() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initiate_bg_check', volunteer_id: volunteerId, check_type: 'all' }),
      });
      if (!res.ok) throw new Error('Failed to initiate');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function updateBgCheck(status) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_bg_check', volunteer_id: volunteerId, check_type: 'all', status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (error) return <Alert type="error" message={error} />;
  if (!data?.volunteer) return <Alert type="warning" message="Not found" />;

  const { volunteer, roles, guardian, driver, consents, emergency_contacts, background_checks, hours, accommodations, minor_id } = data;
  const bgCheck = background_checks?.find(bc => bc.check_type === 'all');
  const nextStatus = volunteerOnboarding.statusFlow[volunteer.status]?.next;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to list</button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{volunteer.first_name} {volunteer.last_name}</h2>
          <p className="text-sm text-gray-500">{volunteer.email} &middot; {volunteer.phone || 'No phone'}</p>
        </div>
        <StatusBadge status={volunteer.status} />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {nextStatus && volunteer.status !== 'active' && (
          <button onClick={() => updateStatus(nextStatus)} disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium disabled:opacity-50">
            Advance to {volunteerOnboarding.statusFlow[nextStatus]?.label}
          </button>
        )}
        {volunteer.status !== 'inactive' && (
          <button onClick={() => updateStatus('inactive')} disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 font-medium disabled:opacity-50">
            Mark Inactive
          </button>
        )}
        {!bgCheck && (
          <button onClick={initiateBgCheck} disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-purple-100 text-purple-800 hover:bg-purple-200 font-medium disabled:opacity-50">
            Initiate Background Check
          </button>
        )}
      </div>

      {/* Background check status */}
      {bgCheck && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Background Check</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Status: <span className="font-medium capitalize">{bgCheck.status}</span>
            {bgCheck.completed_at && <> &middot; Completed {new Date(bgCheck.completed_at).toLocaleDateString()}</>}
          </p>
          {bgCheck.status === 'in_progress' && (
            <div className="flex gap-2">
              <button onClick={() => updateBgCheck('clear')} disabled={actionLoading} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium">Clear</button>
              <button onClick={() => updateBgCheck('flagged')} disabled={actionLoading} className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium">Flagged</button>
              <button onClick={() => updateBgCheck('disqualified')} disabled={actionLoading} className="px-2 py-1 text-xs rounded bg-red-100 text-red-800 hover:bg-red-200 font-medium">Disqualified</button>
            </div>
          )}
        </div>
      )}

      {/* Detail sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Personal Info</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">DOB: {volunteer.date_of_birth || 'N/A'} {volunteer.is_minor && '(Minor)'}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Address: {[volunteer.street_address, volunteer.city, volunteer.state, volunteer.zip].filter(Boolean).join(', ') || 'N/A'}</p>
        </div>

        {/* Emergency contacts */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Emergency Contacts</h4>
          {emergency_contacts.length === 0 ? (
            <p className="text-xs text-gray-400">None</p>
          ) : emergency_contacts.map(ec => (
            <p key={ec.id} className="text-xs text-gray-600 dark:text-gray-400">
              {ec.contact_name} ({ec.relationship}) — {ec.phone} {ec.is_primary && '(Primary)'}
            </p>
          ))}
        </div>

        {/* Roles */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Role Preferences</h4>
          {roles.length === 0 ? (
            <p className="text-xs text-gray-400">None selected</p>
          ) : roles.map(r => (
            <p key={r.id} className="text-xs text-gray-600 dark:text-gray-400">
              {r.role_key}: <span className="capitalize font-medium">{r.interest_level.replace('_', ' ')}</span>
            </p>
          ))}
        </div>

        {/* Consents */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Consents</h4>
          {consents.length === 0 ? (
            <p className="text-xs text-gray-400">None signed</p>
          ) : consents.map(c => (
            <p key={c.id} className="text-xs text-gray-600 dark:text-gray-400">
              {c.consent_type.replace(/_/g, ' ')} — {new Date(c.signed_at).toLocaleDateString()}
            </p>
          ))}
        </div>

        {/* Guardian */}
        {guardian && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Guardian</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{guardian.guardian_name} ({guardian.guardian_relationship})</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{guardian.guardian_phone} {guardian.guardian_email && `/ ${guardian.guardian_email}`}</p>
          </div>
        )}

        {/* Driver */}
        {driver && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Driver Verification</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">License: {driver.license_state} ****{driver.license_number_last4} (exp {driver.license_expiration})</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Insurance: {driver.has_insurance ? 'Yes' : 'No'} {driver.insurance_expiration && `(exp ${driver.insurance_expiration})`}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">DO-21A: {driver.do21a_result || 'Not yet pulled'}</p>
          </div>
        )}

        {/* Hours */}
        {hours.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Hours Documentation</h4>
            {hours.map(h => (
              <div key={h.id} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span className="capitalize">{h.purpose.replace(/_/g, ' ')}</span>: {h.hours_logged}/{h.hours_needed || '∞'} hrs
                {h.institution_name && ` — ${h.institution_name}`}
              </div>
            ))}
          </div>
        )}

        {/* Accommodations */}
        {accommodations?.has_accommodations && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Accommodations (Confidential)</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">{accommodations.description || 'Requested, no details provided'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VolunteerAdminPanel() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');

  async function loadVolunteers() {
    try {
      const res = await fetch('/api/volunteer/onboard?action=list');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setVolunteers(data.volunteers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVolunteers(); }, []);

  if (selectedId) {
    return <VolunteerDetail volunteerId={selectedId} onBack={() => { setSelectedId(null); loadVolunteers(); }} />;
  }

  const filtered = filter === 'all' ? volunteers : volunteers.filter(v => v.status === filter);

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <InviteForm onInviteSent={loadVolunteers} />

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(volunteerOnboarding.statusFlow)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full font-medium ${
              filter === f ? 'bg-green-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {f === 'all' ? 'All' : volunteerOnboarding.statusFlow[f].label}
            {f !== 'all' && ` (${volunteers.filter(v => v.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No volunteers{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className="w-full text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {v.first_name || 'Unnamed'} {v.last_name || ''}
                  </p>
                  <p className="text-xs text-gray-500">{v.email} {v.is_minor && '(Minor)'}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
