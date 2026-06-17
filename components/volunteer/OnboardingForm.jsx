'use client';

import { useState } from 'react';
import { volunteerOnboarding } from '@/data/volunteerOnboarding';
import Alert from '@/components/get-help/Alert';

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700 text-sm";

function Field({ label, required, note, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
    </div>
  );
}

function SectionCard({ title, description, info, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {info && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-200">{info}</p>
        </div>
      )}
      {children}
    </div>
  );
}

function MultiToggle({ options, selected, onChange, label }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt])}
              className={`px-3 py-1.5 text-xs rounded-full font-medium border ${
                isSelected
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function OnboardingForm({ volunteerId, inviteEmail, firstName, roles }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [guardianConsentToken, setGuardianConsentToken] = useState(null);

  // Form state
  const [personal, setPersonal] = useState({
    first_name: firstName || '',
    last_name: '',
    email: inviteEmail || '',
    phone: '',
    date_of_birth: '',
    tshirt_size: '',
    why_volunteering: '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '', relationship: '', phone: '',
  });

  const [selectedRoles, setSelectedRoles] = useState([]);

  const [hoursPurpose, setHoursPurpose] = useState({
    purpose: 'none',
    target_hours: '',
    institution_name: '',
    documentation_required: false,
  });

  const [driverInfo, setDriverInfo] = useState({
    nj_licensed: null,
    has_valid_insurance: false,
  });

  const [guardian, setGuardian] = useState({
    guardian_name: '', guardian_relationship: 'Parent',
    guardian_email: '', guardian_phone: '',
  });

  const [availability, setAvailability] = useState({
    weekdays: [], preferred_times: [],
    max_hours_per_month: '', transportation: '',
  });

  const [languagesList, setLanguagesList] = useState([
    { language: 'English', proficiency: 'native' },
  ]);

  const [accommodationsData, setAccommodationsData] = useState({
    food_allergies: '', accommodations_needed: '',
  });

  const [consentsData, setConsentsData] = useState({
    liability_waiver: false, code_of_conduct: false,
    food_safety_ack: false, background_check_consent: false,
    media_consent: false,
  });

  function isMinor() {
    if (!personal.date_of_birth) return false;
    const dob = new Date(personal.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age < 18;
  }

  function hasDrivingRole() {
    return selectedRoles.includes('driving');
  }

  function hasBgCheckRole() {
    return selectedRoles.some(rk => roles?.find(r => r.key === rk)?.requires_background_check);
  }

  function getVisibleSections() {
    const sections = ['contact', 'motivation', 'hours', 'roles'];
    if (hasDrivingRole()) sections.push('driver');
    sections.push('availability', 'languages', 'accommodations', 'emergency');
    if (isMinor()) sections.push('guardian');
    sections.push('agreements');
    return sections;
  }

  const visibleSections = getVisibleSections();
  const currentSection = visibleSections[step];

  function canProceed() {
    switch (currentSection) {
      case 'contact':
        return personal.first_name.trim() && personal.last_name.trim() && personal.email.trim() && personal.phone.trim() && personal.date_of_birth;
      case 'motivation':
        return personal.why_volunteering.trim();
      case 'roles':
        return selectedRoles.length > 0;
      case 'emergency':
        return emergencyContact.name.trim() && emergencyContact.phone.trim();
      case 'guardian':
        return guardian.guardian_name.trim() && guardian.guardian_email.trim() && guardian.guardian_phone.trim() && guardian.guardian_relationship.trim();
      case 'driver':
        return driverInfo.nj_licensed !== null;
      case 'agreements':
        return consentsData.liability_waiver && consentsData.code_of_conduct && consentsData.food_safety_ack
          && (!hasBgCheckRole() || consentsData.background_check_consent);
      default:
        return true;
    }
  }

  function toggleRole(roleKey) {
    const role = roles?.find(r => r.key === roleKey);
    if (isMinor() && role && !role.allows_minors) return;
    setSelectedRoles(prev =>
      prev.includes(roleKey) ? prev.filter(r => r !== roleKey) : [...prev, roleKey]
    );
  }

  function addLanguage() {
    setLanguagesList(prev => [...prev, { language: '', proficiency: 'basic' }]);
  }

  function removeLanguage(idx) {
    setLanguagesList(prev => prev.filter((_, i) => i !== idx));
  }

  function updateLanguage(idx, field, value) {
    setLanguagesList(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_onboarding',
          volunteer_id: volunteerId,
          personal,
          emergency_contact: emergencyContact,
          role_preferences: selectedRoles,
          guardian: isMinor() ? guardian : null,
          driver: hasDrivingRole() ? driverInfo : null,
          hours_purpose: hoursPurpose.purpose !== 'none' ? hoursPurpose : null,
          consents: consentsData,
          accommodations: accommodationsData,
          availability,
          languages: languagesList.filter(l => l.language.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
      if (data.guardian_consent_token) setGuardianConsentToken(data.guardian_consent_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You&apos;re all set!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your onboarding information has been submitted. Our team will review your application and reach out with next steps.
        </p>
        {guardianConsentToken && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-md mx-auto mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Because you&apos;re under 18, we&apos;ve sent your parent/guardian a consent link.
              You cannot be approved for any role until they confirm. Please ask them to check their email.
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500">Thank you for volunteering with Seed &amp; Spoon!</p>
      </div>
    );
  }

  const purposeNeedsDocs = !['none', 'personal'].includes(hoursPurpose.purpose);
  const purposeNeedsInstitution = ['school_service', 'college_app', 'court_ordered', 'corporate_social'].includes(hoursPurpose.purpose);

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {visibleSections.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500">Step {step + 1} of {visibleSections.length}</p>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* ===== CONTACT ===== */}
      {currentSection === 'contact' && (
        <SectionCard title="Your details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name" required>
              <input type="text" value={personal.first_name} onChange={e => setPersonal(p => ({ ...p, first_name: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Last name" required>
              <input type="text" value={personal.last_name} onChange={e => setPersonal(p => ({ ...p, last_name: e.target.value }))} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" required>
              <input type="email" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Phone" required>
              <input type="tel" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of birth" required note="Drives consent requirements for under-18 volunteers.">
              <input type="date" value={personal.date_of_birth} onChange={e => setPersonal(p => ({ ...p, date_of_birth: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="T-shirt size">
              <select value={personal.tshirt_size} onChange={e => setPersonal(p => ({ ...p, tshirt_size: e.target.value }))} className={inputClass}>
                <option value="">Select...</option>
                {volunteerOnboarding.tshirtSizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          {personal.date_of_birth && isMinor() && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You&apos;re under 18 — additional guardian consent and school ID verification will be required.
                Some roles may not be available.
              </p>
            </div>
          )}
        </SectionCard>
      )}

      {/* ===== MOTIVATION ===== */}
      {currentSection === 'motivation' && (
        <SectionCard title="Why you're here">
          <Field label="In a sentence or two, why did you choose to volunteer with Seed & Spoon?" required>
            <textarea value={personal.why_volunteering} onChange={e => setPersonal(p => ({ ...p, why_volunteering: e.target.value }))} className={inputClass} rows={3} />
          </Field>
        </SectionCard>
      )}

      {/* ===== HOURS ===== */}
      {currentSection === 'hours' && (
        <SectionCard title="Volunteer hours">
          <Field label="What are your hours for?" required>
            <select value={hoursPurpose.purpose} onChange={e => setHoursPurpose(h => ({ ...h, purpose: e.target.value }))} className={inputClass}>
              {volunteerOnboarding.hoursPurposes.map(hp => (
                <option key={hp.value} value={hp.value}>{hp.label}</option>
              ))}
            </select>
          </Field>
          {hoursPurpose.purpose === 'court_ordered' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Court-ordered hours require staff verification for each shift. The verification letter is a legal document —
                accuracy is non-negotiable.
              </p>
            </div>
          )}
          {purposeNeedsDocs && (
            <Field label="Target hours" note="Do you have a set number of hours to reach?">
              <input type="number" value={hoursPurpose.target_hours} onChange={e => setHoursPurpose(h => ({ ...h, target_hours: e.target.value }))} className={inputClass} min="0" />
            </Field>
          )}
          {purposeNeedsInstitution && (
            <Field label="Institution / organization" note="Which school, program, or organization are these hours for?">
              <input type="text" value={hoursPurpose.institution_name} onChange={e => setHoursPurpose(h => ({ ...h, institution_name: e.target.value }))} className={inputClass} />
            </Field>
          )}
          {purposeNeedsDocs && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={hoursPurpose.documentation_required} onChange={e => setHoursPurpose(h => ({ ...h, documentation_required: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">I&apos;ll need a verification letter for my hours</span>
            </label>
          )}
        </SectionCard>
      )}

      {/* ===== ROLES ===== */}
      {currentSection === 'roles' && (
        <SectionCard title="How you'd like to help" description="Select one or more roles. Some require additional verification.">
          <div className="space-y-3">
            {(roles || []).map(role => {
              const isSelected = selectedRoles.includes(role.key);
              const disabledForMinor = isMinor() && !role.allows_minors;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => toggleRole(role.key)}
                  disabled={disabledForMinor}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    disabledForMinor ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                    : isSelected ? 'border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{role.title}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {role.requires_background_check && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">Background check</span>
                        )}
                        {role.requires_driver_verification && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">Driver verification</span>
                        )}
                        {role.requires_food_safety_ack && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-medium">Food safety</span>
                        )}
                        {!role.allows_minors && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium">18+ only</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-green-700 bg-green-700' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ===== DRIVER ===== */}
      {currentSection === 'driver' && (
        <SectionCard
          title="Driving verification"
          info="All drivers must have a notarized DO-21A on file. Seed & Spoon pulls your certified NJ MVC abstract — no self-upload. Only NJ-licensed volunteers may drive."
        >
          <Field label="Do you hold a valid New Jersey driver's license?" required>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setDriverInfo(d => ({ ...d, nj_licensed: val }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                    driverInfo.nj_licensed === val
                      ? val ? 'border-green-700 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {val ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </Field>
          {driverInfo.nj_licensed === false && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                No problem — driving roles require a NJ license, so we&apos;ll route you to other roles. You can still volunteer in kitchen, packing, outreach, or admin.
              </p>
            </div>
          )}
          {driverInfo.nj_licensed === true && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={driverInfo.has_valid_insurance} onChange={e => setDriverInfo(d => ({ ...d, has_valid_insurance: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">I have valid auto insurance</span>
            </label>
          )}
        </SectionCard>
      )}

      {/* ===== AVAILABILITY ===== */}
      {currentSection === 'availability' && (
        <SectionCard title="When you can help">
          <MultiToggle label="Available days" options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} selected={availability.weekdays} onChange={v => setAvailability(a => ({ ...a, weekdays: v }))} />
          <MultiToggle label="Preferred times" options={['Morning', 'Afternoon', 'Evening']} selected={availability.preferred_times} onChange={v => setAvailability(a => ({ ...a, preferred_times: v }))} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Max hours/month" note="Roughly how many hours a month can you give?">
              <input type="number" value={availability.max_hours_per_month} onChange={e => setAvailability(a => ({ ...a, max_hours_per_month: e.target.value }))} className={inputClass} min="0" />
            </Field>
            <Field label="Transportation">
              <select value={availability.transportation} onChange={e => setAvailability(a => ({ ...a, transportation: e.target.value }))} className={inputClass}>
                <option value="">Select...</option>
                <option value="can_drive">I can drive</option>
                <option value="bus_only">Bus / transit only</option>
                <option value="rideshare">Rideshare</option>
                <option value="walk">I walk</option>
              </select>
            </Field>
          </div>
        </SectionCard>
      )}

      {/* ===== LANGUAGES ===== */}
      {currentSection === 'languages' && (
        <SectionCard title="Languages you speak" description="Helps us match family-facing and outreach roles.">
          <div className="space-y-3">
            {languagesList.map((lang, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Field label={i === 0 ? 'Language' : undefined}>
                    <input
                      type="text"
                      value={lang.language}
                      onChange={e => updateLanguage(i, 'language', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Spanish"
                      list="language-suggestions"
                    />
                  </Field>
                </div>
                <div className="w-36">
                  <Field label={i === 0 ? 'Proficiency' : undefined}>
                    <select value={lang.proficiency} onChange={e => updateLanguage(i, 'proficiency', e.target.value)} className={inputClass}>
                      {volunteerOnboarding.languageProficiencies.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                {i > 0 && (
                  <button type="button" onClick={() => removeLanguage(i)} className="pb-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                )}
              </div>
            ))}
            <datalist id="language-suggestions">
              {['English', 'Spanish', 'Portuguese', 'Haitian Creole', 'Arabic', 'French', 'Mandarin', 'Hindi'].map(l => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <button type="button" onClick={addLanguage} className="text-sm text-green-700 hover:text-green-800 font-medium">+ Add another language</button>
          </div>
        </SectionCard>
      )}

      {/* ===== ACCOMMODATIONS ===== */}
      {currentSection === 'accommodations' && (
        <SectionCard title="Keeping you safe (optional & confidential)">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
            <p className="text-xs text-purple-800 dark:text-purple-200">
              This section is entirely optional. Anything you share is confidential and used only to keep you safe and well-matched.
              You don&apos;t need to share a diagnosis.
            </p>
          </div>
          <Field label="Food allergies" note="We handle food, including common allergens — this is for your safety.">
            <textarea value={accommodationsData.food_allergies} onChange={e => setAccommodationsData(a => ({ ...a, food_allergies: e.target.value }))} className={inputClass} rows={2} />
          </Field>
          <Field label="Accommodations" note="Any accommodations that would help, or tasks to steer you away from?">
            <textarea value={accommodationsData.accommodations_needed} onChange={e => setAccommodationsData(a => ({ ...a, accommodations_needed: e.target.value }))} className={inputClass} rows={2} />
          </Field>
        </SectionCard>
      )}

      {/* ===== EMERGENCY ===== */}
      {currentSection === 'emergency' && (
        <SectionCard title="Emergency contact">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Name" required>
              <input type="text" value={emergencyContact.name} onChange={e => setEmergencyContact(ec => ({ ...ec, name: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Relationship">
              <input type="text" value={emergencyContact.relationship} onChange={e => setEmergencyContact(ec => ({ ...ec, relationship: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Phone" required>
              <input type="tel" value={emergencyContact.phone} onChange={e => setEmergencyContact(ec => ({ ...ec, phone: e.target.value }))} className={inputClass} />
            </Field>
          </div>
        </SectionCard>
      )}

      {/* ===== GUARDIAN (minor) ===== */}
      {currentSection === 'guardian' && (
        <SectionCard
          title="Parent / guardian"
          info="We'll email your parent/guardian a separate link to confirm consent. You can't be approved until they do."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guardian name" required>
              <input type="text" value={guardian.guardian_name} onChange={e => setGuardian(g => ({ ...g, guardian_name: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Relationship" required>
              <select value={guardian.guardian_relationship} onChange={e => setGuardian(g => ({ ...g, guardian_relationship: e.target.value }))} className={inputClass}>
                {volunteerOnboarding.guardianRelationships.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guardian email" required note="Consent link will be sent here.">
              <input type="email" value={guardian.guardian_email} onChange={e => setGuardian(g => ({ ...g, guardian_email: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Guardian phone" required>
              <input type="tel" value={guardian.guardian_phone} onChange={e => setGuardian(g => ({ ...g, guardian_phone: e.target.value }))} className={inputClass} />
            </Field>
          </div>
        </SectionCard>
      )}

      {/* ===== AGREEMENTS ===== */}
      {currentSection === 'agreements' && (
        <SectionCard title="Agreements">
          {volunteerOnboarding.sections.find(s => s.key === 'agreements')?.consents.map(consent => {
            const show = consent.showIf === 'has_bg_check_role' ? hasBgCheckRole() : true;
            if (!show) return null;
            const isRequired = consent.required === true || (consent.showIf === 'has_bg_check_role' && hasBgCheckRole());
            return (
              <label key={consent.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentsData[consent.id] || false}
                  onChange={e => setConsentsData(c => ({ ...c, [consent.id]: e.target.checked }))}
                  className="rounded mt-0.5"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {consent.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </span>
              </label>
            );
          })}
        </SectionCard>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          Back
        </button>
        {step < visibleSections.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 text-sm rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
            className="px-6 py-2 text-sm rounded-lg bg-green-700 text-white font-medium hover:bg-green-800 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
