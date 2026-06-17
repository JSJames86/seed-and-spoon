'use client';

import { useState } from 'react';
import { volunteerOnboarding } from '@/data/volunteerOnboarding';
import Alert from '@/components/get-help/Alert';

const SECTIONS = ['personal', 'emergency', 'roles', 'hours', 'guardian', 'minor_info', 'driver', 'consents', 'accommodations'];

function SectionHeader({ number, title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        <span className="text-green-700 mr-2">{number}.</span>{title}
      </h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700 text-sm";

export default function OnboardingForm({ volunteerId, inviteEmail, firstName }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [personal, setPersonal] = useState({
    first_name: firstName || '',
    last_name: '',
    email: inviteEmail || '',
    phone: '',
    date_of_birth: '',
    street_address: '',
    city: '',
    state: 'NJ',
    zip: '',
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { contact_name: '', relationship: '', phone: '', is_primary: true },
  ]);

  const [rolePrefs, setRolePrefs] = useState(
    volunteerOnboarding.roles.map(r => ({ role_key: r.key, interest_level: 'not_interested' }))
  );

  const [hoursPurpose, setHoursPurpose] = useState({
    purpose: 'general',
    hours_needed: '',
    due_date: '',
    institution_name: '',
    supervisor_name: '',
    supervisor_contact: '',
  });

  const [guardian, setGuardian] = useState({
    guardian_name: '',
    guardian_relationship: 'Parent',
    guardian_phone: '',
    guardian_email: '',
  });

  const [minorInfo, setMinorInfo] = useState({
    school_name: '',
    grade: '',
    school_contact_phone: '',
    parent_work_schedule: '',
    availability_notes: '',
  });

  const [driver, setDriver] = useState({
    wants_to_drive: false,
    license_state: 'NJ',
    license_number_last4: '',
    license_expiration: '',
    has_insurance: false,
    insurance_expiration: '',
  });

  const [consents, setConsents] = useState([]);
  const [accommodations, setAccommodations] = useState({ has_accommodations: false, description: '' });

  function isMinor() {
    if (!personal.date_of_birth) return false;
    const dob = new Date(personal.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    return age < 18 || (age === 18 && m < 0) || (age === 18 && m === 0 && today.getDate() < dob.getDate());
  }

  function getVisibleSections() {
    const sections = ['personal', 'emergency', 'roles', 'hours'];
    if (isMinor()) {
      sections.push('guardian', 'minor_info');
    }
    if (driver.wants_to_drive) {
      sections.push('driver');
    }
    sections.push('consents', 'accommodations');
    return sections;
  }

  const visibleSections = getVisibleSections();
  const currentSection = visibleSections[step];

  function toggleConsent(type) {
    setConsents(prev =>
      prev.includes(type) ? prev.filter(c => c !== type) : [...prev, type]
    );
  }

  function addEmergencyContact() {
    setEmergencyContacts(prev => [...prev, { contact_name: '', relationship: '', phone: '', is_primary: false }]);
  }

  function removeEmergencyContact(idx) {
    setEmergencyContacts(prev => prev.filter((_, i) => i !== idx));
  }

  function updateEmergencyContact(idx, field, value) {
    setEmergencyContacts(prev => prev.map((ec, i) => i === idx ? { ...ec, [field]: value } : ec));
  }

  function updateRole(roleKey, level) {
    setRolePrefs(prev => prev.map(r => r.role_key === roleKey ? { ...r, interest_level: level } : r));
  }

  function canProceed() {
    switch (currentSection) {
      case 'personal':
        return personal.first_name.trim() && personal.last_name.trim() && personal.email.trim();
      case 'emergency':
        return emergencyContacts.length > 0 && emergencyContacts[0].contact_name.trim() && emergencyContacts[0].phone.trim();
      case 'roles':
        return rolePrefs.some(r => r.interest_level !== 'not_interested');
      case 'guardian':
        return guardian.guardian_name.trim() && guardian.guardian_phone.trim();
      case 'consents': {
        const required = volunteerOnboarding.consentTypes.filter(c => c.required).map(c => c.key);
        return required.every(r => consents.includes(r));
      }
      default:
        return true;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const activeRoles = rolePrefs.filter(r => r.interest_level !== 'not_interested');
      const res = await fetch('/api/volunteer/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_onboarding',
          volunteer_id: volunteerId,
          personal,
          emergency_contacts: emergencyContacts,
          roles: activeRoles,
          guardian: isMinor() ? guardian : null,
          minor_info: isMinor() ? minorInfo : null,
          driver: driver.wants_to_drive ? driver : null,
          hours_purpose: hoursPurpose.purpose !== 'general' ? hoursPurpose : null,
          consents,
          accommodations: accommodations.has_accommodations ? accommodations : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You&apos;re all set!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your onboarding information has been submitted. Our team will review your application and reach out
          with next steps. Thank you for volunteering with Seed &amp; Spoon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-1">
        {visibleSections.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-green-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <p className="text-xs text-gray-500">Step {step + 1} of {visibleSections.length}</p>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">

        {/* === PERSONAL INFO === */}
        {currentSection === 'personal' && (
          <div className="space-y-4">
            <SectionHeader number={1} title="Personal Information" description="We'll use this to set up your volunteer profile." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input type="text" value={personal.first_name} onChange={e => setPersonal(p => ({ ...p, first_name: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Last Name" required>
                <input type="text" value={personal.last_name} onChange={e => setPersonal(p => ({ ...p, last_name: e.target.value }))} className={inputClass} />
              </Field>
            </div>
            <Field label="Email" required>
              <input type="email" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input type="tel" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Date of Birth" required>
              <input type="date" value={personal.date_of_birth} onChange={e => setPersonal(p => ({ ...p, date_of_birth: e.target.value }))} className={inputClass} />
            </Field>
            {personal.date_of_birth && isMinor() && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Based on your date of birth, you&apos;re under 18. Additional guardian and school information will be required.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Street Address">
                <input type="text" value={personal.street_address} onChange={e => setPersonal(p => ({ ...p, street_address: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="City">
                <input type="text" value={personal.city} onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="State">
                  <input type="text" value={personal.state} onChange={e => setPersonal(p => ({ ...p, state: e.target.value }))} className={inputClass} maxLength={2} />
                </Field>
                <Field label="ZIP">
                  <input type="text" value={personal.zip} onChange={e => setPersonal(p => ({ ...p, zip: e.target.value }))} className={inputClass} maxLength={10} />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* === EMERGENCY CONTACTS === */}
        {currentSection === 'emergency' && (
          <div className="space-y-4">
            <SectionHeader number={2} title="Emergency Contacts" description="At least one emergency contact is required." />
            {emergencyContacts.map((ec, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact {i + 1} {ec.is_primary && '(Primary)'}</p>
                  {i > 0 && (
                    <button type="button" onClick={() => removeEmergencyContact(i)} className="text-xs text-red-600 hover:text-red-800">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Name" required>
                    <input type="text" value={ec.contact_name} onChange={e => updateEmergencyContact(i, 'contact_name', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Relationship" required>
                    <input type="text" value={ec.relationship} onChange={e => updateEmergencyContact(i, 'relationship', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Phone" required>
                    <input type="tel" value={ec.phone} onChange={e => updateEmergencyContact(i, 'phone', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={addEmergencyContact} className="text-sm text-green-700 hover:text-green-800 font-medium">+ Add another contact</button>
          </div>
        )}

        {/* === ROLE PREFERENCES === */}
        {currentSection === 'roles' && (
          <div className="space-y-4">
            <SectionHeader number={3} title="Role Preferences" description="Select the areas you're interested in. You can choose multiple." />
            {volunteerOnboarding.roles.map(role => {
              const pref = rolePrefs.find(r => r.role_key === role.key);
              return (
                <div key={role.key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{role.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {['preferred', 'interested', 'not_interested'].map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => updateRole(role.key, level)}
                          className={`px-2 py-1 text-xs rounded font-medium ${
                            pref?.interest_level === level
                              ? level === 'preferred' ? 'bg-green-700 text-white'
                                : level === 'interested' ? 'bg-blue-600 text-white'
                                : 'bg-gray-400 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {level === 'preferred' ? 'Preferred' : level === 'interested' ? 'Interested' : 'Pass'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {role.key === 'delivery' && pref?.interest_level !== 'not_interested' && !driver.wants_to_drive && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <label className="flex items-center gap-2 text-xs text-blue-800 dark:text-blue-200">
                        <input type="checkbox" checked={driver.wants_to_drive} onChange={e => setDriver(d => ({ ...d, wants_to_drive: e.target.checked }))} className="rounded" />
                        I have a valid NJ driver&apos;s license and want to drive for deliveries
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* === HOURS PURPOSE === */}
        {currentSection === 'hours' && (
          <div className="space-y-4">
            <SectionHeader number={4} title="Hours Documentation" description="Do you need hours tracked for a specific purpose?" />
            <Field label="Purpose of Volunteering">
              <select value={hoursPurpose.purpose} onChange={e => setHoursPurpose(h => ({ ...h, purpose: e.target.value }))} className={inputClass}>
                {volunteerOnboarding.hoursPurposes.map(hp => (
                  <option key={hp.key} value={hp.key}>{hp.label}</option>
                ))}
              </select>
            </Field>
            {hoursPurpose.purpose !== 'general' && (
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Hours documentation details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Hours Needed">
                    <input type="number" value={hoursPurpose.hours_needed} onChange={e => setHoursPurpose(h => ({ ...h, hours_needed: e.target.value }))} className={inputClass} min="0" step="0.5" />
                  </Field>
                  <Field label="Due Date">
                    <input type="date" value={hoursPurpose.due_date} onChange={e => setHoursPurpose(h => ({ ...h, due_date: e.target.value }))} className={inputClass} />
                  </Field>
                </div>
                <Field label="Institution / Organization Name">
                  <input type="text" value={hoursPurpose.institution_name} onChange={e => setHoursPurpose(h => ({ ...h, institution_name: e.target.value }))} className={inputClass} placeholder="e.g. Newark High School" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Supervisor Name">
                    <input type="text" value={hoursPurpose.supervisor_name} onChange={e => setHoursPurpose(h => ({ ...h, supervisor_name: e.target.value }))} className={inputClass} />
                  </Field>
                  <Field label="Supervisor Contact">
                    <input type="text" value={hoursPurpose.supervisor_contact} onChange={e => setHoursPurpose(h => ({ ...h, supervisor_contact: e.target.value }))} className={inputClass} placeholder="Email or phone" />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === GUARDIAN (minor branch) === */}
        {currentSection === 'guardian' && (
          <div className="space-y-4">
            <SectionHeader number={5} title="Parent / Guardian Information" description="Required for volunteers under 18." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Guardian Name" required>
                <input type="text" value={guardian.guardian_name} onChange={e => setGuardian(g => ({ ...g, guardian_name: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Relationship" required>
                <select value={guardian.guardian_relationship} onChange={e => setGuardian(g => ({ ...g, guardian_relationship: e.target.value }))} className={inputClass}>
                  {volunteerOnboarding.guardianRelationships.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Guardian Phone" required>
                <input type="tel" value={guardian.guardian_phone} onChange={e => setGuardian(g => ({ ...g, guardian_phone: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Guardian Email">
                <input type="email" value={guardian.guardian_email} onChange={e => setGuardian(g => ({ ...g, guardian_email: e.target.value }))} className={inputClass} />
              </Field>
            </div>
          </div>
        )}

        {/* === MINOR INFO (minor branch) === */}
        {currentSection === 'minor_info' && (
          <div className="space-y-4">
            <SectionHeader number={6} title="School Information" description="Helps us coordinate schedules and communicate with your school if needed." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="School Name">
                <input type="text" value={minorInfo.school_name} onChange={e => setMinorInfo(m => ({ ...m, school_name: e.target.value }))} className={inputClass} />
              </Field>
              <Field label="Grade">
                <input type="text" value={minorInfo.grade} onChange={e => setMinorInfo(m => ({ ...m, grade: e.target.value }))} className={inputClass} placeholder="e.g. 10th" />
              </Field>
            </div>
            <Field label="School Contact Phone">
              <input type="tel" value={minorInfo.school_contact_phone} onChange={e => setMinorInfo(m => ({ ...m, school_contact_phone: e.target.value }))} className={inputClass} />
            </Field>
            <Field label="Parent/Guardian Work Schedule">
              <input type="text" value={minorInfo.parent_work_schedule} onChange={e => setMinorInfo(m => ({ ...m, parent_work_schedule: e.target.value }))} className={inputClass} placeholder="e.g. Mon-Fri 9am-5pm" />
            </Field>
            <Field label="Your Availability Notes">
              <textarea value={minorInfo.availability_notes} onChange={e => setMinorInfo(m => ({ ...m, availability_notes: e.target.value }))} className={inputClass} rows={3} placeholder="When are you available to volunteer?" />
            </Field>
          </div>
        )}

        {/* === DRIVER VERIFICATION === */}
        {currentSection === 'driver' && (
          <div className="space-y-4">
            <SectionHeader number={step + 1} title="Driver Verification" description="Required for delivery volunteers. NJ DO-21A consent will be collected separately." />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Delivery drivers must have a valid NJ license. We&apos;ll pull your driver abstract under notarized DO-21A consent.
                Only the last 4 digits of your license number are stored.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="License State">
                <input type="text" value={driver.license_state} onChange={e => setDriver(d => ({ ...d, license_state: e.target.value }))} className={inputClass} maxLength={2} />
              </Field>
              <Field label="License Last 4 Digits">
                <input type="text" value={driver.license_number_last4} onChange={e => setDriver(d => ({ ...d, license_number_last4: e.target.value }))} className={inputClass} maxLength={4} placeholder="Last 4 only" />
              </Field>
            </div>
            <Field label="License Expiration">
              <input type="date" value={driver.license_expiration} onChange={e => setDriver(d => ({ ...d, license_expiration: e.target.value }))} className={inputClass} />
            </Field>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={driver.has_insurance} onChange={e => setDriver(d => ({ ...d, has_insurance: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">I have valid auto insurance</span>
              </label>
            </div>
            {driver.has_insurance && (
              <Field label="Insurance Expiration">
                <input type="date" value={driver.insurance_expiration} onChange={e => setDriver(d => ({ ...d, insurance_expiration: e.target.value }))} className={inputClass} />
              </Field>
            )}
          </div>
        )}

        {/* === CONSENTS === */}
        {currentSection === 'consents' && (
          <div className="space-y-4">
            <SectionHeader number={step + 1} title="Agreements & Consents" description="Check each agreement. Items marked with * are required." />
            {volunteerOnboarding.consentTypes.map(ct => {
              const show = ct.key === 'minor_guardian_consent' ? isMinor()
                : ct.key === 'driver_do21a_consent' ? driver.wants_to_drive
                : ct.key === 'background_check_authorization' ? true
                : true;
              if (!show) return null;
              return (
                <label key={ct.key} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consents.includes(ct.key)}
                    onChange={() => toggleConsent(ct.key)}
                    className="rounded mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {ct.label}{ct.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* === ACCOMMODATIONS === */}
        {currentSection === 'accommodations' && (
          <div className="space-y-4">
            <SectionHeader number={step + 1} title="Accommodations" description="This information is voluntary and confidential." />
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <p className="text-xs text-purple-800 dark:text-purple-200">
                This section is entirely optional. Any accommodations you share will be kept confidential and used only
                to ensure we can support you effectively.
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={accommodations.has_accommodations} onChange={e => setAccommodations(a => ({ ...a, has_accommodations: e.target.checked }))} className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">I need or would like to request accommodations</span>
            </label>
            {accommodations.has_accommodations && (
              <Field label="Please describe the accommodations you need">
                <textarea value={accommodations.description} onChange={e => setAccommodations(a => ({ ...a, description: e.target.value }))} className={inputClass} rows={4} placeholder="e.g. wheelchair accessibility, modified tasks, schedule flexibility..." />
              </Field>
            )}
          </div>
        )}
      </div>

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
