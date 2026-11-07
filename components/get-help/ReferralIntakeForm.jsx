'use client';

/**
 * Partner referral form (Get Help page). A school administrator, parent advocate,
 * faith leader, or WIC/social service staff member refers a family.
 * Posts to /api/referrals. The family still completes its own intake form.
 */

import { useState } from 'react';
import Alert from './Alert';
import FormSection from './FormSection';
import { REFERRER_ROLES, REFERRAL_UPLOAD } from '@/data/familyIntake';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1';
const helpClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

const EMPTY = {
  referrerRole: '',
  referrerName: '',
  referrerOrg: '',
  referrerEmail: '',
  referrerPhone: '',
  familyContactName: '',
  familyPhone: '',
  childrenCount: '1',
  notes: '',
  familyAgreed: false,
};

export default function ReferralIntakeForm({ onSuccess }) {
  const [fields, setFields] = useState(EMPTY);
  const [letter, setLetter] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    if (!fields.referrerRole) return 'Please choose your role.';
    if (!fields.referrerName.trim()) return 'Please enter your name.';
    if (!fields.referrerOrg.trim()) return 'Please enter your school or organization.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.referrerEmail.trim())) return 'Please enter a valid email so we can confirm the referral.';
    if (!fields.familyContactName.trim()) return 'Please enter the parent or guardian’s name.';
    if (!fields.familyPhone.trim()) return 'Please enter a phone number for the family.';
    if (!(Number(fields.childrenCount) >= 1)) return 'Please enter how many children are in the family.';
    if (!fields.familyAgreed) return 'Please confirm the family agreed to this referral.';
    return '';
  };

  const handleFile = (e) => {
    setError('');
    const file = e.target.files?.[0] || null;
    if (file && !REFERRAL_UPLOAD.allowedTypes.includes(file.type)) {
      e.target.value = '';
      return setError('Please upload a PDF or a photo (JPG or PNG).');
    }
    if (file && file.size > REFERRAL_UPLOAD.maxBytes) {
      e.target.value = '';
      return setError('That file is too large. Please upload a file under 4 MB.');
    }
    setLetter(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      document.getElementById('referral-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    setIsSubmitting(true);
    const form = new FormData();
    form.append('payload', JSON.stringify({ ...fields, childrenCount: Number(fields.childrenCount) }));
    if (letter) form.append('letter', letter);
    try {
      const res = await fetch('/api/referrals', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'We couldn’t send the referral. Please try again.');
      setSubmitted(true);
      onSuccess?.(data);
    } catch (err) {
      setError(err instanceof TypeError ? 'We couldn’t reach our server. Please check your connection and try again.' : err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => document.getElementById('referral-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }
  };

  if (submitted) {
    return (
      <div id="referral-status" className="max-w-2xl mx-auto">
        <Alert
          type="success"
          title="Referral received"
          message={`Thank you, ${fields.referrerName.trim()}. We’ll email you at ${fields.referrerEmail.trim()} if we need anything else.`}
          className="mb-6"
        />
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Please make sure the family also completes their own intake form at seedandspoon.org/get-help and chooses
          “Someone is sending a referral for me.”
        </p>
        <div className="text-center">
          <button
            onClick={() => {
              setFields(EMPTY);
              setLetter(null);
              setSubmitted(false);
            }}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium"
          >
            Refer another family
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10" noValidate>
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <p>
          <strong>Who can refer:</strong> school administrators and staff, parent advocates and case workers, church and faith
          leaders, and WIC or social service staff.
        </p>
        <p>
          Your referral confirms the family’s need, so we never ask the family for income or Social Security numbers. The
          family still completes their own short intake form.
        </p>
      </div>

      <div id="referral-status">
        {error && <Alert type="error" title="Please check this" message={error} onClose={() => setError('')} />}
      </div>

      <FormSection title="1. About you" required>
        <div>
          <label className={labelClass} htmlFor="rf-role">Your role *</label>
          <select id="rf-role" className={inputClass} value={fields.referrerRole} onChange={set('referrerRole')}>
            <option value="">Choose one…</option>
            {REFERRER_ROLES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="rf-name">Your name *</label>
            <input id="rf-name" className={inputClass} value={fields.referrerName} onChange={set('referrerName')} autoComplete="name" />
          </div>
          <div>
            <label className={labelClass} htmlFor="rf-org">School, church, or organization *</label>
            <input id="rf-org" className={inputClass} value={fields.referrerOrg} onChange={set('referrerOrg')} autoComplete="organization" />
          </div>
          <div>
            <label className={labelClass} htmlFor="rf-email">Work email *</label>
            <input id="rf-email" type="email" className={inputClass} value={fields.referrerEmail} onChange={set('referrerEmail')} autoComplete="email" />
          </div>
          <div>
            <label className={labelClass} htmlFor="rf-phone">Phone (optional)</label>
            <input id="rf-phone" type="tel" className={inputClass} value={fields.referrerPhone} onChange={set('referrerPhone')} autoComplete="tel" />
          </div>
        </div>
      </FormSection>

      <FormSection title="2. The family" description="Just enough for us to match your referral to the family’s intake form." required>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="rf-family">Parent or guardian’s name *</label>
            <input id="rf-family" className={inputClass} value={fields.familyContactName} onChange={set('familyContactName')} />
          </div>
          <div>
            <label className={labelClass} htmlFor="rf-children">Children under 18 *</label>
            <input id="rf-children" type="number" min={1} max={15} className={inputClass} value={fields.childrenCount} onChange={set('childrenCount')} />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="rf-fphone">Family’s phone *</label>
            <input id="rf-fphone" type="tel" className={inputClass} value={fields.familyPhone} onChange={set('familyPhone')} />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="rf-letter">Referral letter (optional)</label>
          <input
            id="rf-letter"
            type="file"
            accept={REFERRAL_UPLOAD.accept}
            onChange={handleFile}
            className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-white hover:file:bg-blue-800"
          />
          <p className={helpClass}>
            A signed letter on your organization’s letterhead, PDF or photo under 4 MB. Please leave out income and Social
            Security numbers. We delete letters automatically after 30 days.
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="rf-notes">Anything we should know? (optional)</label>
          <textarea id="rf-notes" rows={3} className={inputClass} value={fields.notes} onChange={set('notes')} />
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={fields.familyAgreed} onChange={set('familyAgreed')} className="mt-0.5 w-5 h-5 text-blue-700 focus:ring-blue-600" />
          <span className="text-sm text-gray-800 dark:text-gray-200">
            The family knows about this referral and agreed to let me share their name and phone number with Seed &amp; Spoon. *
          </span>
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'Sending…' : 'Send referral'}
        </button>
      </FormSection>
    </form>
  );
}
