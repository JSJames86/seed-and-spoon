'use client';

/**
 * Family intake form (Get Help page). Posts to /api/applications.
 * Options and wording live in data/familyIntake.js.
 */

import { useEffect, useMemo, useState } from 'react';
import Alert from './Alert';
import FormSection from './FormSection';
import { captureEvent } from '@/analytics/posthog';
import { EVENTS } from '@/analytics/events';
import {
  ALLERGENS,
  SEVERITIES,
  FORMULA_BRANDS,
  FORMULA_TYPES,
  DIETARY_OPTIONS,
  CONTACT_METHODS,
  LANGUAGES,
  REHEAT_OPTIONS,
  DROPOFF_METHODS,
  REFERRAL_TYPES,
  REFERRAL_UPLOAD,
  INTAKE_COPY,
} from '@/data/familyIntake';

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1';
const helpClass = 'text-xs text-gray-500 dark:text-gray-400 mt-1';

const newChild = () => ({
  key: Math.random().toString(36).slice(2),
  label: '',
  ageYears: '',
  school: '',
  underOne: false,
  ageMonths: '',
  needsFormula: '',
  formulaBrand: '',
  formulaType: '',
  hasAllergies: '',
  allergies: {}, // allergenKey -> { severity, otherName }
});

function Choice({ name, value, checked, onChange, children, type = 'radio' }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 hover:border-green-500">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 w-5 h-5 text-green-700 focus:ring-green-600"
      />
      <span className="text-sm text-gray-800 dark:text-gray-200">{children}</span>
    </label>
  );
}

// Phone photos can be large; shrink images over the limit before upload.
async function shrinkImageIfNeeded(file) {
  if (!file || !file.type.startsWith('image/') || file.size <= REFERRAL_UPLOAD.maxBytes) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export default function FamilyIntakeForm({ onSuccess, onScrollToMap }) {
  const [contact, setContact] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    preferredContact: 'text',
    preferredLanguage: 'english',
    city: '',
    zip: '',
    essexCounty: '',
  });
  const [adultsInHome, setAdultsInHome] = useState('1');
  const [children, setChildren] = useState([newChild()]);
  const [dietary, setDietary] = useState([]);
  const [reheatAccess, setReheatAccess] = useState('');
  const [dropoff, setDropoff] = useState({ method: '', address: '', unit: '', school: '' });
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [notes, setNotes] = useState('');
  const [referral, setReferral] = useState({ type: '', file: null, referrerName: '', referrerOrg: '', referrerContact: '' });
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [socialReshareConsent, setSocialReshareConsent] = useState(false);
  const [signatureName, setSignatureName] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    captureEvent(EVENTS.FAMILY_APPLICATION_STARTED, { zip_code: '', household_size: 1 });
  }, []);

  const referralType = useMemo(() => REFERRAL_TYPES.find((r) => r.key === referral.type), [referral.type]);
  const hasBaby = children.some((c) => c.underOne);

  const setContactField = (field) => (e) => setContact((prev) => ({ ...prev, [field]: e.target.value }));
  const updateChild = (key, patch) =>
    setChildren((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const toggleAllergen = (child, allergenKey) => {
    const next = { ...child.allergies };
    if (next[allergenKey]) delete next[allergenKey];
    else next[allergenKey] = { severity: 'A', otherName: '' };
    updateChild(child.key, { allergies: next });
  };

  const setAllergen = (child, allergenKey, patch) =>
    updateChild(child.key, { allergies: { ...child.allergies, [allergenKey]: { ...child.allergies[allergenKey], ...patch } } });

  // Client-side checks mirror the API so families see problems before upload.
  const validate = () => {
    if (!contact.firstName.trim()) return 'Please enter your first name.';
    if (!contact.phone.trim()) return 'Please enter a phone number.';
    if (contact.preferredContact === 'email' && !contact.email.trim()) return 'Please add an email, or choose another way to reach you.';
    if (!/^\d{5}$/.test(contact.zip.trim())) return 'Please enter a 5-digit ZIP code.';
    if (!contact.essexCounty) return 'Please tell us whether you live in Essex County.';
    if (!(Number(adultsInHome) >= 1)) return 'Please enter how many adults live in your home.';
    const labels = new Set();
    for (const [i, c] of children.entries()) {
      const name = c.label.trim() || `Child ${i + 1}`;
      if (!c.label.trim()) return `Child ${i + 1}: please add their first name.`;
      if (labels.has(c.label.trim().toLowerCase())) return `Two children are listed as "${c.label.trim()}". Please add a last initial to tell them apart.`;
      labels.add(c.label.trim().toLowerCase());
      if (c.underOne) {
        if (c.ageMonths === '' || Number(c.ageMonths) < 0 || Number(c.ageMonths) > 11) return `${name}: please enter the baby’s age in months (0 to 11).`;
        if (!c.needsFormula) return `${name}: please tell us whether you need formula.`;
        if (c.needsFormula === 'yes' && (!c.formulaBrand || !c.formulaType)) return `${name}: please choose a formula brand and type.`;
      } else if (!(Number(c.ageYears) >= 1 && Number(c.ageYears) <= 17)) {
        return `${name}: please enter an age from 1 to 17, or check “Under 1 year.”`;
      }
      if (!c.hasAllergies) return `${name}: please tell us whether they have any food allergies.`;
      if (c.hasAllergies === 'yes' && Object.keys(c.allergies).length === 0) return `${name}: please check at least one allergy, or choose No.`;
      if (c.allergies.other && !c.allergies.other.otherName.trim()) return `${name}: please name the “Other” allergy.`;
    }
    if (!dropoff.method) return 'Please choose where we should drop off your meals.';
    if (dropoff.method === 'home' && !dropoff.address.trim()) return 'Please enter your street address for home drop-off.';
    if (dropoff.method === 'school' && !dropoff.school.trim()) return 'Please tell us which school.';
    if (!referralType) return 'Please choose your referral type.';
    if (referralType.how === 'upload' && !referral.file) return 'Please attach your referral document.';
    if (referralType.how === 'partner' && (!referral.referrerName.trim() || !referral.referrerOrg.trim())) {
      return 'Please tell us who is sending your referral and where they work.';
    }
    if (!privacyAcknowledged) return 'Please confirm you’ve read our privacy promise.';
    if (!signatureName.trim()) return 'Please type your full name to sign.';
    return '';
  };

  const handleFile = async (e) => {
    setError('');
    const picked = e.target.files?.[0] || null;
    if (!picked) return setReferral((prev) => ({ ...prev, file: null }));
    if (!REFERRAL_UPLOAD.allowedTypes.includes(picked.type)) {
      e.target.value = '';
      return setError('Please upload a PDF or a photo (JPG or PNG).');
    }
    const file = await shrinkImageIfNeeded(picked);
    if (file.size > REFERRAL_UPLOAD.maxBytes) {
      e.target.value = '';
      return setError('That file is too large. Please upload a file under 4 MB, or take a photo instead.');
    }
    setReferral((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      document.getElementById('intake-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    setIsSubmitting(true);

    const payload = {
      ...contact,
      essexCounty: contact.essexCounty === 'yes',
      adultsInHome: Number(adultsInHome),
      children: children.map((c) => ({
        label: c.label.trim(),
        underOne: c.underOne,
        school: c.school.trim(),
        ageYears: c.underOne ? 0 : Number(c.ageYears),
        ageMonths: c.underOne ? Number(c.ageMonths) : null,
        formulaBrand: c.underOne && c.needsFormula === 'yes' ? c.formulaBrand : null,
        formulaType: c.underOne && c.needsFormula === 'yes' ? c.formulaType : null,
      })),
      allergens: children.flatMap((c) =>
        c.hasAllergies === 'yes'
          ? Object.entries(c.allergies).map(([allergen, v]) => ({
              childLabel: c.label.trim(),
              allergen,
              severity: v.severity,
              otherName: allergen === 'other' ? v.otherName : '',
            }))
          : []
      ),
      dietary,
      reheatAccess,
      dropoffMethod: dropoff.method,
      dropoffAddress: dropoff.address,
      dropoffUnit: dropoff.unit,
      dropoffSchool: dropoff.school,
      medicalNeeds,
      notes,
      referralType: referral.type,
      referrerName: referral.referrerName,
      referrerOrg: referral.referrerOrg,
      referrerContact: referral.referrerContact,
      privacyAcknowledged,
      socialReshareConsent,
      signatureName,
    };

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));
    if (referralType?.how === 'upload' && referral.file) form.append('referralDoc', referral.file);

    try {
      const res = await fetch('/api/applications', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'We couldn’t send your form. Please try again.');

      captureEvent(EVENTS.FAMILY_APPLICATION_SUBMITTED, {
        zip_code: contact.zip,
        household_size: Number(adultsInHome) + children.length,
        application_id: data.applicationId,
      });
      setSubmitted(true);
      onSuccess?.(data);
      setTimeout(() => document.getElementById('intake-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch (err) {
      setError(err instanceof TypeError ? 'We couldn’t reach our server. Please check your connection and try again.' : err.message);
      document.getElementById('intake-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div id="intake-status" className="max-w-2xl mx-auto">
        <Alert
          type="success"
          title="We received your intake form"
          message={`Thank you, ${contact.firstName.trim()}. We’ll reach out by ${
            CONTACT_METHODS.find((m) => m.key === contact.preferredContact)?.label.toLowerCase() ?? 'phone'
          } once we’ve reviewed it.`}
          className="mb-6"
        />
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">{INTAKE_COPY.lottery}</p>
          {onScrollToMap && (
            <button
              onClick={onScrollToMap}
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              Find food resources near you now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10" noValidate>
      <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-5 text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <p><strong>What you’ll need:</strong> about 10 minutes, your children’s names, ages, and allergies, where you’d like meals dropped off, and a referral (a SNAP or WIC letter, or a letter from a school, parent advocate, or faith leader).</p>
        <p>{INTAKE_COPY.noIncome}</p>
      </div>

      <div id="intake-status">
        {error && <Alert type="error" title="Please check this" message={error} onClose={() => setError('')} />}
      </div>

      {/* ── 1. Contact ─────────────────────────────────────────────── */}
      <FormSection title="1. About you" description="The parent or guardian we should contact." required>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="fi-first">First name *</label>
            <input id="fi-first" className={inputClass} value={contact.firstName} onChange={setContactField('firstName')} autoComplete="given-name" />
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-last">Last name</label>
            <input id="fi-last" className={inputClass} value={contact.lastName} onChange={setContactField('lastName')} autoComplete="family-name" />
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-phone">Phone *</label>
            <input id="fi-phone" type="tel" className={inputClass} value={contact.phone} onChange={setContactField('phone')} autoComplete="tel" placeholder="(973) 555-0123" />
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-email">Email (optional)</label>
            <input id="fi-email" type="email" className={inputClass} value={contact.email} onChange={setContactField('email')} autoComplete="email" />
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-contact">Best way to reach you *</label>
            <select id="fi-contact" className={inputClass} value={contact.preferredContact} onChange={setContactField('preferredContact')}>
              {CONTACT_METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-lang">Preferred language</label>
            <select id="fi-lang" className={inputClass} value={contact.preferredLanguage} onChange={setContactField('preferredLanguage')}>
              {LANGUAGES.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-city">City</label>
            <input id="fi-city" className={inputClass} value={contact.city} onChange={setContactField('city')} placeholder="Newark" autoComplete="address-level2" />
          </div>
          <div>
            <label className={labelClass} htmlFor="fi-zip">ZIP code *</label>
            <input id="fi-zip" inputMode="numeric" maxLength={5} className={inputClass} value={contact.zip} onChange={setContactField('zip')} placeholder="07103" autoComplete="postal-code" />
          </div>
        </div>
        <fieldset>
          <legend className={labelClass}>Do you live in Essex County? *</legend>
          <div className="grid grid-cols-2 gap-2 max-w-sm">
            {['yes', 'no'].map((v) => (
              <Choice key={v} name="essexCounty" value={v} checked={contact.essexCounty === v} onChange={setContactField('essexCounty')}>
                {v === 'yes' ? 'Yes' : 'No'}
              </Choice>
            ))}
          </div>
          {contact.essexCounty === 'no' && (
            <p className={helpClass}>Our pilot serves Essex County families. You can still send this form, and we’ll share other resources near you.</p>
          )}
        </fieldset>
      </FormSection>

      {/* ── 2. Household & children ────────────────────────────────── */}
      <FormSection
        title="2. Your household"
        description="List each child under 18 who lives with you."
        required
      >
        <div className="max-w-xs">
          <label className={labelClass} htmlFor="fi-adults">Adults in your home (18 and over) *</label>
          <input id="fi-adults" type="number" min={1} max={20} className={inputClass} value={adultsInHome} onChange={(e) => setAdultsInHome(e.target.value)} />
        </div>

        <div className="space-y-6">
          {children.map((child, i) => {
            const name = child.label.trim() || `Child ${i + 1}`;
            return (
              <div key={child.key} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Child {i + 1}</h4>
                  {children.length > 1 && (
                    <button type="button" onClick={() => setChildren((prev) => prev.filter((c) => c.key !== child.key))} className="text-sm text-red-600 hover:underline">
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor={`fi-label-${child.key}`}>First name *</label>
                    <input id={`fi-label-${child.key}`} className={inputClass} value={child.label} onChange={(e) => updateChild(child.key, { label: e.target.value })} maxLength={40} />
                  </div>
                  <div>
                    {child.underOne ? (
                      <>
                        <label className={labelClass} htmlFor={`fi-months-${child.key}`}>Age in months *</label>
                        <input id={`fi-months-${child.key}`} type="number" min={0} max={11} className={inputClass} value={child.ageMonths} onChange={(e) => updateChild(child.key, { ageMonths: e.target.value })} />
                      </>
                    ) : (
                      <>
                        <label className={labelClass} htmlFor={`fi-age-${child.key}`}>Age in years *</label>
                        <input id={`fi-age-${child.key}`} type="number" min={1} max={17} className={inputClass} value={child.ageYears} onChange={(e) => updateChild(child.key, { ageYears: e.target.value })} />
                      </>
                    )}
                    <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={child.underOne}
                        onChange={(e) => updateChild(child.key, { underOne: e.target.checked })}
                        className="w-4 h-4 text-green-700 focus:ring-green-600"
                      />
                      Under 1 year old
                    </label>
                  </div>
                </div>

                {!child.underOne && (
                  <div className="max-w-md">
                    <label className={labelClass} htmlFor={`fi-school-${child.key}`}>School {name} attends (optional)</label>
                    <input id={`fi-school-${child.key}`} className={inputClass} value={child.school} onChange={(e) => updateChild(child.key, { school: e.target.value })} maxLength={120} />
                  </div>
                )}

                {child.underOne && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 space-y-4">
                    <fieldset>
                      <legend className={labelClass}>Do you need formula for {name}? *</legend>
                      <div className="grid grid-cols-2 gap-2 max-w-sm">
                        {['yes', 'no'].map((v) => (
                          <Choice key={v} name={`needsFormula-${child.key}`} value={v} checked={child.needsFormula === v} onChange={() => updateChild(child.key, { needsFormula: v })}>
                            {v === 'yes' ? 'Yes' : 'No'}
                          </Choice>
                        ))}
                      </div>
                    </fieldset>
                    {child.needsFormula === 'yes' && (
                      <>
                        <fieldset>
                          <legend className={labelClass}>Formula brand *</legend>
                          <div className="grid grid-cols-2 gap-2 max-w-sm">
                            {FORMULA_BRANDS.map((b) => (
                              <Choice key={b.key} name={`brand-${child.key}`} value={b.key} checked={child.formulaBrand === b.key} onChange={() => updateChild(child.key, { formulaBrand: b.key })}>
                                {b.label}
                              </Choice>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className={labelClass}>Formula type *</legend>
                          <div className="grid grid-cols-2 gap-2 max-w-sm">
                            {FORMULA_TYPES.map((t) => (
                              <Choice key={t.key} name={`type-${child.key}`} value={t.key} checked={child.formulaType === t.key} onChange={() => updateChild(child.key, { formulaType: t.key })}>
                                {t.label}
                              </Choice>
                            ))}
                          </div>
                        </fieldset>
                        <p className={helpClass}>
                          We can provide Similac or Enfamil, Regular or Sensitive. If your baby needs a specialty or prescription formula, tell us in the notes below and we’ll help you find other support.
                        </p>
                      </>
                    )}
                  </div>
                )}

                <fieldset>
                  <legend className={labelClass}>Does {name} have any food allergies or sensitivities? *</legend>
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    {['yes', 'no'].map((v) => (
                      <Choice key={v} name={`hasAllergies-${child.key}`} value={v} checked={child.hasAllergies === v} onChange={() => updateChild(child.key, { hasAllergies: v, ...(v === 'no' ? { allergies: {} } : {}) })}>
                        {v === 'yes' ? 'Yes' : 'No'}
                      </Choice>
                    ))}
                  </div>
                </fieldset>

                {child.hasAllergies === 'yes' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Check each one, then tell us how serious it is.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALLERGENS.map((a) => {
                        const entry = child.allergies[a.key];
                        return (
                          <div key={a.key} className={`rounded-lg border px-3 py-2.5 ${entry ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" checked={Boolean(entry)} onChange={() => toggleAllergen(child, a.key)} className="w-5 h-5 text-orange-600 focus:ring-orange-500" />
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.label}</span>
                            </label>
                            {entry && (
                              <div className="mt-2 space-y-2">
                                {a.key === 'other' && (
                                  <input
                                    aria-label={`Name the other allergy for ${name}`}
                                    className={inputClass}
                                    placeholder="What is it?"
                                    value={entry.otherName}
                                    onChange={(e) => setAllergen(child, a.key, { otherName: e.target.value })}
                                  />
                                )}
                                <select
                                  aria-label={`How serious is ${name}'s ${a.label} allergy`}
                                  className={inputClass}
                                  value={entry.severity}
                                  onChange={(e) => setAllergen(child, a.key, { severity: e.target.value })}
                                >
                                  {SEVERITIES.map((s) => (
                                    <option key={s.key} value={s.key}>{s.label}: {s.help}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(child.allergies).some((v) => v.severity === 'S') && (
                      <p className="text-sm font-semibold text-red-700">
                        Thank you for telling us. Our kitchen team reviews every severe allergy before a family is enrolled.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setChildren((prev) => [...prev, newChild()])}
          disabled={children.length >= 10}
          className="px-4 py-2 rounded-lg border-2 border-dashed border-green-600 text-green-700 font-medium hover:bg-green-50 disabled:opacity-50"
        >
          + Add another child
        </button>
      </FormSection>

      {/* ── 3. Food needs ──────────────────────────────────────────── */}
      <FormSection title="3. Food needs" description="Helps our kitchen plan meals your family will eat.">
        <fieldset>
          <legend className={labelClass}>Does your family follow any of these?</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIETARY_OPTIONS.map((d) => (
              <Choice
                key={d.key}
                type="checkbox"
                name="dietary"
                value={d.key}
                checked={dietary.includes(d.key)}
                onChange={() => setDietary((prev) => (prev.includes(d.key) ? prev.filter((x) => x !== d.key) : [...prev, d.key]))}
              >
                {d.label}
              </Choice>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={labelClass}>Can you refrigerate and reheat prepared meals at home?</legend>
          <div className="space-y-2">
            {REHEAT_OPTIONS.map((r) => (
              <Choice key={r.key} name="reheat" value={r.key} checked={reheatAccess === r.key} onChange={() => setReheatAccess(r.key)}>
                {r.label}
              </Choice>
            ))}
          </div>
        </fieldset>
        <div>
          <label className={labelClass} htmlFor="fi-medical">Medical or texture needs (optional)</label>
          <textarea id="fi-medical" rows={3} className={inputClass} value={medicalNeeds} onChange={(e) => setMedicalNeeds(e.target.value)} placeholder="For example: soft foods only, diabetes, trouble swallowing" />
        </div>
      </FormSection>

      {/* ── 4. Drop-off ────────────────────────────────────────────── */}
      <FormSection title="4. Meal drop-off" description="We can only drop off meals at one of these three kinds of places." required>
        <div className="space-y-2">
          {DROPOFF_METHODS.map((m) => (
            <Choice
              key={m.key}
              name="dropoff"
              value={m.key}
              checked={dropoff.method === m.key}
              onChange={() =>
                setDropoff((prev) => ({
                  ...prev,
                  method: m.key,
                  school: m.key === 'school' && !prev.school ? (children.find((c) => c.school.trim())?.school.trim() ?? '') : prev.school,
                }))
              }
            >
              <span className="font-medium">{m.label}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{m.help}</span>
            </Choice>
          ))}
        </div>

        {dropoff.method === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="fi-addr">Street address *</label>
              <input id="fi-addr" className={inputClass} value={dropoff.address} onChange={(e) => setDropoff((p) => ({ ...p, address: e.target.value }))} autoComplete="street-address" placeholder="123 Main St" />
            </div>
            <div>
              <label className={labelClass} htmlFor="fi-unit">Apt, buzzer, or safe spot</label>
              <input id="fi-unit" className={inputClass} value={dropoff.unit} onChange={(e) => setDropoff((p) => ({ ...p, unit: e.target.value }))} placeholder="Apt 2B, ring twice" />
            </div>
          </div>
        )}

        {dropoff.method === 'school' && (
          <div className="max-w-md">
            <label className={labelClass} htmlFor="fi-dropschool">Which school? *</label>
            <input id="fi-dropschool" list="fi-school-options" className={inputClass} value={dropoff.school} onChange={(e) => setDropoff((p) => ({ ...p, school: e.target.value }))} />
            <datalist id="fi-school-options">
              {[...new Set(children.map((c) => c.school.trim()).filter(Boolean))].map((sch) => <option key={sch} value={sch} />)}
            </datalist>
            <p className={helpClass}>We’ll confirm whether this school is a Seed &amp; Spoon partner.</p>
          </div>
        )}
      </FormSection>

      {/* ── 5. Referral ────────────────────────────────────────────── */}
      <FormSection title="5. Your referral" description={INTAKE_COPY.noIncome} required>
        <fieldset>
          <legend className={labelClass}>Which referral do you have? *</legend>
          <div className="space-y-2">
            {REFERRAL_TYPES.map((r) => (
              <Choice key={r.key} name="referralType" value={r.key} checked={referral.type === r.key} onChange={() => setReferral((prev) => ({ ...prev, type: r.key }))}>
                <span className="font-medium">{r.label}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{r.help}</span>
              </Choice>
            ))}
          </div>
        </fieldset>

        {referralType?.how === 'upload' && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-4 space-y-3">
            <p className="text-sm text-gray-800 dark:text-gray-200"><strong>{INTAKE_COPY.coverInfo}</strong></p>
            {['snap_letter', 'wic_letter'].includes(referral.type) && (
              <p className="text-sm text-gray-800 dark:text-gray-200">{INTAKE_COPY.matchRule}</p>
            )}
            <div>
              <label className={labelClass} htmlFor="fi-doc">Attach your referral (PDF or photo, under 4 MB) *</label>
              <input
                id="fi-doc"
                type="file"
                accept={REFERRAL_UPLOAD.accept}
                onChange={handleFile}
                className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-green-700 file:px-4 file:py-2 file:text-white hover:file:bg-green-800"
              />
              {referral.file && <p className={helpClass}>Ready to send: {referral.file.name}</p>}
            </div>
            <p className={helpClass}>{INTAKE_COPY.docRetention}</p>
          </div>
        )}

        {referralType?.how === 'partner' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-4 space-y-4">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Ask them to send it using the <strong>Partner Referral</strong> tab on this page. We’ll match it to your form.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="fi-ref-name">Their name *</label>
                <input id="fi-ref-name" className={inputClass} value={referral.referrerName} onChange={(e) => setReferral((p) => ({ ...p, referrerName: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass} htmlFor="fi-ref-org">School, church, or organization *</label>
                <input id="fi-ref-org" className={inputClass} value={referral.referrerOrg} onChange={(e) => setReferral((p) => ({ ...p, referrerOrg: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="fi-ref-contact">Their phone or email (optional)</label>
              <input id="fi-ref-contact" className={inputClass} value={referral.referrerContact} onChange={(e) => setReferral((p) => ({ ...p, referrerContact: e.target.value }))} />
            </div>
          </div>
        )}
      </FormSection>

      {/* ── 6. Privacy, social media, signature ────────────────────── */}
      <FormSection title="6. Privacy and signature" required>
        <div>
          <label className={labelClass} htmlFor="fi-notes">Anything else we should know? (optional)</label>
          <textarea id="fi-notes" rows={3} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={privacyAcknowledged} onChange={(e) => setPrivacyAcknowledged(e.target.checked)} className="mt-0.5 w-5 h-5 text-green-700 focus:ring-green-600" />
          <span className="text-sm text-gray-800 dark:text-gray-200">{INTAKE_COPY.privacyPromise} *</span>
        </label>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Social media permission</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={socialReshareConsent} onChange={(e) => setSocialReshareConsent(e.target.checked)} className="mt-0.5 w-5 h-5 text-green-700 focus:ring-green-600" />
            <span className="text-sm text-gray-800 dark:text-gray-200">{INTAKE_COPY.socialReshare}</span>
          </label>
          <p className={`${helpClass} ml-8`}>{INTAKE_COPY.socialReshareNote}</p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">{INTAKE_COPY.lottery}</p>

        <div className="max-w-md">
          <label className={labelClass} htmlFor="fi-sign">Type your full name to sign *</label>
          <input id="fi-sign" className={inputClass} value={signatureName} onChange={(e) => setSignatureName(e.target.value)} autoComplete="name" />
          <p className={helpClass}>By signing, you confirm the information above is true to the best of your knowledge.</p>
        </div>

        {hasBaby && (
          <p className={helpClass}>Formula support is a separate pilot with limited spots. We’ll confirm availability when we contact you.</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? 'Sending…' : 'Send my intake form'}
        </button>
      </FormSection>
    </form>
  );
}
