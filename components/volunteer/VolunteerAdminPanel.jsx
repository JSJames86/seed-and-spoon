'use client';

import { useState, useEffect } from 'react';
import { volunteerOnboarding } from '@/data/volunteerOnboarding';
import Alert from '@/components/get-help/Alert';

function StatusBadge({ status, map }) {
  const cfg = (map || volunteerOnboarding.statusFlow)[status] || { label: status, color: 'gray' };
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
        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name (optional)"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
        <button type="submit" disabled={sending}
          className="px-4 py-2 text-sm rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50">
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
  const [noteText, setNoteText] = useState('');

  // Hours logging
  const [hoursForm, setHoursForm] = useState({ shift_date: '', hours: '', role_key: '' });

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

  async function postAction(body) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function postHoursAction(body) {
    setActionLoading(true);
    try {
      const res = await fetch('/api/volunteer/onboard/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    await postAction({ action: 'add_note', volunteer_id: volunteerId, note: noteText });
    setNoteText('');
  }

  async function logHours(e) {
    e.preventDefault();
    if (!hoursForm.shift_date || !hoursForm.hours) return;
    await postHoursAction({
      action: 'log_shift',
      volunteer_id: volunteerId,
      shift_date: hoursForm.shift_date,
      hours: hoursForm.hours,
      role_key: hoursForm.role_key || null,
    });
    setHoursForm({ shift_date: '', hours: '', role_key: '' });
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (error) return <Alert type="error" message={error} />;
  if (!data?.volunteer) return <Alert type="warning" message="Not found" />;

  const { volunteer, role_assignments, role_preferences, guardian, driver, consents, emergency_contacts,
          background_check, hours_purpose, hours_log, accommodations, availability, languages, notes,
          audit_log, verification_letters } = data;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to list</button>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{volunteer.first_name} {volunteer.last_name}</h2>
          <p className="text-sm text-gray-500">{volunteer.email} &middot; {volunteer.phone || 'No phone'}</p>
          <div className="flex gap-2 mt-1 flex-wrap">
            {volunteer.is_minor && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Minor</span>}
            {volunteer.court_ordered && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium">Court-ordered</span>}
          </div>
        </div>
        <StatusBadge status={volunteer.status} />
      </div>

      {/* Status actions */}
      <div className="flex gap-2 flex-wrap">
        {volunteer.status === 'submitted' && (
          <>
            <button onClick={() => postAction({ action: 'update_status', volunteer_id: volunteerId, status: 'active' })}
              disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium disabled:opacity-50">
              Activate Account
            </button>
            <button onClick={() => postAction({ action: 'update_status', volunteer_id: volunteerId, status: 'needs_info' })}
              disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-orange-100 text-orange-800 hover:bg-orange-200 font-medium disabled:opacity-50">
              Request Info
            </button>
          </>
        )}
        {volunteer.status === 'needs_info' && (
          <button onClick={() => postAction({ action: 'update_status', volunteer_id: volunteerId, status: 'active' })}
            disabled={actionLoading} className="px-3 py-1.5 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium disabled:opacity-50">
            Activate Account
          </button>
        )}
      </div>

      {/* Per-role assignments */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Role Eligibility</h4>
        <p className="text-xs text-gray-500 mb-3">Preferences: {role_preferences.length > 0 ? role_preferences.join(', ') : 'None'}</p>
        {(role_assignments || []).length === 0 ? (
          <p className="text-xs text-gray-400">No role assignments yet</p>
        ) : (
          <div className="space-y-2">
            {role_assignments.map(ra => (
              <div key={ra.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{ra.role_key}</p>
                  {ra.reason && <p className="text-xs text-gray-500">{ra.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ra.eligibility_status} map={volunteerOnboarding.eligibilityStatuses} />
                  <select
                    value={ra.eligibility_status}
                    onChange={e => postAction({
                      action: 'update_role_eligibility',
                      volunteer_id: volunteerId,
                      role_key: ra.role_key,
                      eligibility_status: e.target.value,
                    })}
                    disabled={actionLoading}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="pending">Pending</option>
                    <option value="eligible">Eligible</option>
                    <option value="restricted">Restricted</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Background check */}
      {background_check && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Background Check</h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {['chri', 'sor', 'cari'].map(type => {
              const status = background_check[`${type}_status`];
              return (
                <div key={type} className="space-y-1">
                  <p className="font-medium text-gray-700 dark:text-gray-300 uppercase">{type}</p>
                  <select
                    value={status}
                    onChange={e => postAction({
                      action: 'update_bg_check',
                      volunteer_id: volunteerId,
                      [`${type}_status`]: e.target.value,
                      chri_status: type === 'chri' ? e.target.value : background_check.chri_status,
                      sor_status: type === 'sor' ? e.target.value : background_check.sor_status,
                      cari_status: type === 'cari' ? e.target.value : background_check.cari_status,
                    })}
                    disabled={actionLoading}
                    className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value={type === 'cari' ? 'substantiated' : type === 'sor' ? 'flagged' : 'disqualified'}>
                      {type === 'cari' ? 'Substantiated' : type === 'sor' ? 'Flagged' : 'Disqualified'}
                    </option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Overall: <span className={`font-semibold ${background_check.cleared ? 'text-green-700' : 'text-amber-600'}`}>
                {background_check.cleared ? 'CLEARED' : 'Not cleared'}
              </span>
            </p>
            {background_check.recheck_due && (
              <p className="text-xs text-gray-500">Recheck due: {background_check.recheck_due}</p>
            )}
          </div>
        </div>
      )}

      {/* Guardian consent */}
      {guardian && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Guardian Consent</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {guardian.guardian_name} ({guardian.guardian_relationship}) — {guardian.guardian_email}
          </p>
          <p className="text-xs mt-1">
            Status: <span className={`font-semibold ${guardian.consent_given ? 'text-green-700' : 'text-amber-600'}`}>
              {guardian.consent_given ? `Consented ${new Date(guardian.guardian_consent_at).toLocaleDateString()}` : 'Awaiting consent'}
            </span>
          </p>
          {!guardian.consent_given && (
            <p className="text-xs text-gray-400 mt-1 font-mono break-all">
              Consent link: /volunteer/onboard/guardian?token={guardian.consent_token}
            </p>
          )}
        </div>
      )}

      {/* Driver verification */}
      {driver && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Driver Verification</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <p>NJ Licensed: {driver.nj_licensed ? 'Yes' : 'No'}</p>
            <p>Insurance: {driver.has_valid_insurance ? 'Yes' : 'No'}</p>
            <p>DO-21A Notarized: {driver.do21a_notarized ? 'Yes' : 'No'}</p>
            <p>Abstract: <span className="capitalize">{driver.abstract_status}</span></p>
          </div>
          {driver.driving_restriction_reason && (
            <p className="text-xs text-red-600 mt-1">Restriction: {driver.driving_restriction_reason}</p>
          )}
          <div className="flex gap-2 mt-2">
            {!driver.do21a_notarized && (
              <button onClick={() => postAction({ action: 'update_driver_verification', volunteer_id: volunteerId, do21a_notarized: true, do21a_received_at: new Date().toISOString() })}
                disabled={actionLoading} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium disabled:opacity-50">
                Mark DO-21A Received
              </button>
            )}
            {driver.abstract_status !== 'verified' && driver.nj_licensed && (
              <button onClick={() => postAction({ action: 'update_driver_verification', volunteer_id: volunteerId, abstract_status: 'verified' })}
                disabled={actionLoading} className="px-2 py-1 text-xs rounded bg-green-100 text-green-800 hover:bg-green-200 font-medium disabled:opacity-50">
                Verify Abstract
              </button>
            )}
          </div>
        </div>
      )}

      {/* Detail cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consents */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Consents</h4>
          {consents ? (
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              {[['liability_waiver', 'Liability waiver'], ['code_of_conduct', 'Code of conduct'], ['food_safety_ack', 'Food safety'], ['background_check_consent', 'Background check'], ['media_consent', 'Media consent']].map(([key, label]) => (
                <p key={key}>{consents[key] ? '✓' : '✗'} {label}</p>
              ))}
            </div>
          ) : <p className="text-xs text-gray-400">Not yet submitted</p>}
        </div>

        {/* Emergency contacts */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Emergency Contact</h4>
          {emergency_contacts.length === 0 ? <p className="text-xs text-gray-400">None</p> : emergency_contacts.map(ec => (
            <p key={ec.id} className="text-xs text-gray-600 dark:text-gray-400">{ec.name} ({ec.relationship}) — {ec.phone}</p>
          ))}
        </div>

        {/* Availability */}
        {availability && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Availability</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Days: {availability.weekdays?.join(', ') || 'Any'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Times: {availability.preferred_times?.join(', ') || 'Any'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Max hrs/mo: {availability.max_hours_per_month || 'Flexible'}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Transport: {availability.transportation || 'Not specified'}</p>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Languages</h4>
            {languages.map(l => (
              <p key={l.id} className="text-xs text-gray-600 dark:text-gray-400">{l.language} — <span className="capitalize">{l.proficiency}</span></p>
            ))}
          </div>
        )}

        {/* Accommodations (confidential) */}
        {accommodations && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Accommodations (Confidential)</h4>
            {accommodations.food_allergies && <p className="text-xs text-gray-600 dark:text-gray-400">Allergies: {accommodations.food_allergies}</p>}
            {accommodations.accommodations_needed && <p className="text-xs text-gray-600 dark:text-gray-400">Needs: {accommodations.accommodations_needed}</p>}
          </div>
        )}

        {/* Hours purpose */}
        {hours_purpose && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Hours Documentation</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Purpose: <span className="capitalize">{hours_purpose.purpose.replace(/_/g, ' ')}</span></p>
            {hours_purpose.target_hours && <p className="text-xs text-gray-600 dark:text-gray-400">Target: {hours_purpose.target_hours} hrs</p>}
            {hours_purpose.institution_name && <p className="text-xs text-gray-600 dark:text-gray-400">Institution: {hours_purpose.institution_name}</p>}
            <p className="text-xs text-gray-600 dark:text-gray-400">Letter needed: {hours_purpose.documentation_required ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>

      {/* Hours log + entry */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Hours Log</h4>
        <form onSubmit={logHours} className="flex flex-col sm:flex-row gap-2">
          <input type="date" value={hoursForm.shift_date} onChange={e => setHoursForm(h => ({ ...h, shift_date: e.target.value }))}
            className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" required />
          <input type="number" value={hoursForm.hours} onChange={e => setHoursForm(h => ({ ...h, hours: e.target.value }))}
            placeholder="Hours" step="0.25" min="0.25" className="w-24 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" required />
          <select value={hoursForm.role_key} onChange={e => setHoursForm(h => ({ ...h, role_key: e.target.value }))}
            className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
            <option value="">Any role</option>
            {(role_assignments || []).map(ra => <option key={ra.role_key} value={ra.role_key}>{ra.role_key}</option>)}
          </select>
          <button type="submit" disabled={actionLoading}
            className="px-3 py-1.5 text-sm rounded bg-green-700 text-white hover:bg-green-800 font-medium disabled:opacity-50">Log</button>
        </form>
        {hours_log.length > 0 ? (
          <div className="space-y-1">
            {hours_log.map(h => (
              <div key={h.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <span className="text-gray-600 dark:text-gray-400">
                  {h.shift_date} — {h.hours}h {h.role_key && `(${h.role_key})`}
                </span>
                <div className="flex items-center gap-2">
                  {h.verified_at ? (
                    <span className="text-green-700 font-medium">Verified</span>
                  ) : (
                    <button onClick={() => postHoursAction({ action: 'verify_hours', entry_id: h.id })}
                      disabled={actionLoading}
                      className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium disabled:opacity-50">
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-400">No hours logged yet</p>}
        {verification_letters?.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Verification Letters Issued</p>
            {verification_letters.map(l => (
              <p key={l.id} className="text-xs text-gray-500">{new Date(l.generated_at).toLocaleDateString()} — {l.total_verified_hours}h to {l.recipient}</p>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Admin Notes</h4>
        <form onSubmit={addNote} className="flex gap-2">
          <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..."
            className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
          <button type="submit" disabled={actionLoading}
            className="px-3 py-1.5 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 font-medium disabled:opacity-50">Add</button>
        </form>
        {notes.length > 0 ? (
          <div className="space-y-1">
            {notes.map(n => (
              <div key={n.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <p className="text-gray-600 dark:text-gray-400">{n.note}</p>
                <p className="text-gray-400 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-400">No notes</p>}
      </div>

      {/* Audit log */}
      <details className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <summary className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">Audit Log</summary>
        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
          {audit_log.length > 0 ? audit_log.map(entry => (
            <div key={entry.id} className="text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <span className="font-medium text-gray-700 dark:text-gray-300">{entry.action}</span>
              <span className="text-gray-400 ml-2">{new Date(entry.created_at).toLocaleString()}</span>
              {entry.metadata && <pre className="text-gray-400 mt-0.5 whitespace-pre-wrap">{JSON.stringify(entry.metadata, null, 2)}</pre>}
            </div>
          )) : <p className="text-xs text-gray-400">No audit entries</p>}
        </div>
      </details>
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

      {/* Filter pills */}
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
                  <p className="text-xs text-gray-500">
                    {v.email}
                    {v.is_minor && ' (Minor)'}
                    {v.court_ordered && ' (Court-ordered)'}
                  </p>
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
