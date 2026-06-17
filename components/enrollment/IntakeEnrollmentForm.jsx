'use client';

import { useState } from 'react';
import FormField from '@/components/get-help/FormField';
import FormSection from '@/components/get-help/FormSection';
import Alert from '@/components/get-help/Alert';
import AllergenMatrix from './AllergenMatrix';

const INITIAL_HOUSEHOLD = {
  household_id: '',
  enrollment_date: new Date().toISOString().split('T')[0],
  contact_name: '',
  phone: '',
  contact_method: '',
  email: '',
  preferred_language: '',
  preferred_language_other: '',
  children_count: '1',
  adults_in_home: '1',
};

const INITIAL_DELIVERY = {
  delivery_address: '',
  delivery_unit_access: '',
  delivery_window: '',
  if_not_home: '',
  freezer_space: '',
};

const INITIAL_DIETARY = {
  dietary_vegetarian: false,
  dietary_vegan: false,
  dietary_no_pork: false,
  dietary_halal: false,
  dietary_kosher: false,
  dietary_other: '',
};

const INITIAL_CONSENT = {
  consent_allergen_accuracy: false,
  consent_update_changes: false,
  consent_program_messages: false,
  consent_funder_reports: false,
  allergen_confirmed: false,
  intake_completed_by: '',
  signature_name: '',
  signature_date: new Date().toISOString().split('T')[0],
};

const CHILD_LABELS = ['Child A', 'Child B', 'Child C'];

function makeChildren(count) {
  return Array.from({ length: Math.min(count, 3) }, (_, i) => ({
    label: CHILD_LABELS[i],
    age: '',
    texture_medical_needs: '',
  }));
}

export default function IntakeEnrollmentForm() {
  const [household, setHousehold] = useState(INITIAL_HOUSEHOLD);
  const [delivery, setDelivery] = useState(INITIAL_DELIVERY);
  const [dietary, setDietary] = useState(INITIAL_DIETARY);
  const [consent, setConsent] = useState(INITIAL_CONSENT);
  const [children, setChildren] = useState(makeChildren(1));
  const [allergens, setAllergens] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  function updateHousehold(e) {
    const { name, value } = e.target;
    setHousehold(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

    if (name === 'children_count') {
      const count = Math.max(1, Math.min(3, Number(value) || 1));
      setChildren(prev => {
        const next = makeChildren(count);
        return next.map((c, i) => prev[i] ? { ...prev[i], label: c.label } : c);
      });
    }
  }

  function updateDelivery(e) {
    const { name, value } = e.target;
    setDelivery(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }

  function updateDietary(e) {
    const { name, value, type, checked } = e.target;
    setDietary(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function updateConsent(e) {
    const { name, value, type, checked } = e.target;
    setConsent(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }

  function updateChild(index, field, value) {
    setChildren(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  }

  function validate() {
    const errs = {};
    if (!household.household_id.trim()) errs.household_id = 'Required';
    if (!household.contact_name.trim()) errs.contact_name = 'Required';
    if (!household.phone.trim()) errs.phone = 'Required';
    if (!household.contact_method) errs.contact_method = 'Required';
    if (!household.preferred_language) errs.preferred_language = 'Required';
    if (!delivery.delivery_address.trim()) errs.delivery_address = 'Required';
    if (!delivery.if_not_home) errs.if_not_home = 'Required';
    if (!delivery.freezer_space) errs.freezer_space = 'Required';
    if (!consent.consent_allergen_accuracy) errs.consent_allergen_accuracy = 'Must confirm allergen accuracy';
    if (!consent.consent_update_changes) errs.consent_update_changes = 'Must agree to report changes';
    if (!consent.consent_program_messages) errs.consent_program_messages = 'Must consent to messages';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const payload = {
        ...household,
        ...delivery,
        ...dietary,
        ...consent,
        children,
        allergens,
      };

      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        const msgs = [data.message];
        if (data.has_severe_allergens) {
          msgs.push('SEVERE ALLERGEN(S) FLAGGED — this will appear on kit labels and production sheets.');
        }
        setResult({ type: 'success', message: msgs.join(' ') });
      } else {
        setResult({ type: 'error', message: data.message || 'Something went wrong.' });
      }
    } catch {
      setResult({ type: 'error', message: 'Could not reach the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const childCount = Math.max(1, Math.min(3, Number(household.children_count) || 1));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Consent notice */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
          We ask these questions to keep your child safe and to deliver food your family can actually eat.
          Your answers are private and used only to prepare and deliver your meals. Enrollment is voluntary
          and you can update your information at any time. Please tell us about <strong>every</strong> allergy
          or restriction — even mild ones — so our kitchen can prepare your kits safely.
        </p>
      </div>

      {/* Operating rule */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          No confirmed allergen data on file = no kit produced for that household.
        </p>
        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
          An incomplete or unconfirmed intake form blocks enrollment until resolved.
        </p>
      </div>

      {/* Part 1: Household */}
      <FormSection title="Part 1 — Household" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Household Code (assigned)" name="household_id" value={household.household_id} onChange={updateHousehold} error={errors.household_id} required placeholder="e.g. HH-07" />
          <FormField label="Enrollment Date" name="enrollment_date" type="date" value={household.enrollment_date} onChange={updateHousehold} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Primary Contact Name" name="contact_name" value={household.contact_name} onChange={updateHousehold} error={errors.contact_name} required />
          <FormField label="Phone" name="phone" type="tel" value={household.phone} onChange={updateHousehold} error={errors.phone} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Best Way to Reach You"
            name="contact_method"
            type="select"
            value={household.contact_method}
            onChange={updateHousehold}
            error={errors.contact_method}
            required
            placeholder="Select..."
            options={[
              { value: 'call', label: 'Call' },
              { value: 'text', label: 'Text' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Email' },
            ]}
          />
          <FormField label="Email" name="email" type="email" value={household.email} onChange={updateHousehold} placeholder="Optional" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Preferred Language"
            name="preferred_language"
            type="select"
            value={household.preferred_language}
            onChange={updateHousehold}
            error={errors.preferred_language}
            required
            placeholder="Select..."
            options={[
              { value: 'english', label: 'English' },
              { value: 'spanish', label: 'Spanish' },
              { value: 'other', label: 'Other' },
            ]}
          />
          {household.preferred_language === 'other' && (
            <FormField label="Other Language" name="preferred_language_other" value={household.preferred_language_other} onChange={updateHousehold} />
          )}
          <FormField label="Children Receiving Kits" name="children_count" type="number" value={household.children_count} onChange={updateHousehold} required min="1" max="3" />
          <FormField label="Adults in Home" name="adults_in_home" type="number" value={household.adults_in_home} onChange={updateHousehold} required min="1" />
        </div>
      </FormSection>

      {/* Part 2: Children */}
      <FormSection title="Part 2 — Children Served" description="Use a label, not a full name, where possible. Age is needed for portion/nutrition context.">
        {children.slice(0, childCount).map((child, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">{CHILD_LABELS[i]}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Label / Initial"
                name={`child_${i}_label`}
                value={child.label}
                onChange={e => updateChild(i, 'label', e.target.value)}
                required
                placeholder="e.g. Child A"
              />
              <FormField
                label="Age"
                name={`child_${i}_age`}
                type="number"
                value={child.age}
                onChange={e => updateChild(i, 'age', e.target.value)}
                placeholder="Years"
                min="0"
                max="18"
              />
            </div>
            <FormField
              label="Medical or texture-related needs"
              name={`child_${i}_texture`}
              type="textarea"
              value={child.texture_medical_needs}
              onChange={e => updateChild(i, 'texture_medical_needs', e.target.value)}
              rows={2}
              placeholder="e.g. must have soft foods, feeding considerations..."
            />
          </div>
        ))}
      </FormSection>

      {/* Part 3: Allergen Matrix */}
      <FormSection
        title="Part 3 — Allergen & Dietary Matrix"
        description="CRITICAL — check every allergen for each child and mark severity. If unsure, mark it and we will treat it as an allergy."
        required
      >
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>I</strong> = intolerance/sensitivity (discomfort) &middot;{' '}
            <strong>A</strong> = allergy (strict avoidance) &middot;{' '}
            <strong className="text-red-600">S</strong> = SEVERE / anaphylaxis (life-threatening)
          </p>
        </div>
        <AllergenMatrix
          childEntries={children.slice(0, childCount)}
          allergens={allergens}
          onChange={setAllergens}
        />

        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Dietary Pattern (household level)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField label="Vegetarian" name="dietary_vegetarian" type="checkbox" value={dietary.dietary_vegetarian} onChange={updateDietary} />
            <FormField label="Vegan" name="dietary_vegan" type="checkbox" value={dietary.dietary_vegan} onChange={updateDietary} />
            <FormField label="No Pork" name="dietary_no_pork" type="checkbox" value={dietary.dietary_no_pork} onChange={updateDietary} />
            <FormField label="Halal" name="dietary_halal" type="checkbox" value={dietary.dietary_halal} onChange={updateDietary} />
            <FormField label="Kosher" name="dietary_kosher" type="checkbox" value={dietary.dietary_kosher} onChange={updateDietary} />
          </div>
          <FormField label="Other dietary needs" name="dietary_other" value={dietary.dietary_other} onChange={updateDietary} placeholder="Describe..." />
        </div>
      </FormSection>

      {/* Part 4: Delivery */}
      <FormSection title="Part 4 — Delivery Logistics" required>
        <FormField label="Delivery Address" name="delivery_address" value={delivery.delivery_address} onChange={updateDelivery} error={errors.delivery_address} required />
        <FormField label="Unit / Buzzer / Access Notes" name="delivery_unit_access" value={delivery.delivery_unit_access} onChange={updateDelivery} placeholder="Optional" />
        <FormField label="Best Delivery Day / Time Window" name="delivery_window" value={delivery.delivery_window} onChange={updateDelivery} placeholder="e.g. Tuesdays after 3pm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="If No One Is Home"
            name="if_not_home"
            type="select"
            value={delivery.if_not_home}
            onChange={updateDelivery}
            error={errors.if_not_home}
            required
            placeholder="Select..."
            options={[
              { value: 'leave_at_door', label: 'Leave at door' },
              { value: 'call_first', label: 'Call first' },
              { value: 'reschedule', label: 'Do not leave — reschedule' },
            ]}
          />
          <FormField
            label="Freezer Space at Home"
            name="freezer_space"
            type="select"
            value={delivery.freezer_space}
            onChange={updateDelivery}
            error={errors.freezer_space}
            required
            placeholder="Select..."
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'limited', label: 'Limited' },
              { value: 'no', label: 'No' },
            ]}
          />
        </div>
        {(delivery.freezer_space === 'no' || delivery.freezer_space === 'limited') && (
          <Alert
            type="warning"
            message="Limited or no freezer space — delivery lead will be notified. This affects how much can be delivered at once."
          />
        )}
      </FormSection>

      {/* Part 5: Consent */}
      <FormSection title="Part 5 — Consent & Acknowledgements" required>
        <div className="space-y-3">
          <FormField
            label="I confirm the allergy and dietary information above is complete and accurate to the best of my knowledge."
            name="consent_allergen_accuracy"
            type="checkbox"
            value={consent.consent_allergen_accuracy}
            onChange={updateConsent}
            error={errors.consent_allergen_accuracy}
            required
          />
          <FormField
            label="I understand I should tell Seed & Spoon right away if my child's allergies or needs change."
            name="consent_update_changes"
            type="checkbox"
            value={consent.consent_update_changes}
            onChange={updateConsent}
            error={errors.consent_update_changes}
            required
          />
          <FormField
            label="I agree to receive program messages (delivery times, surveys) by my chosen contact method."
            name="consent_program_messages"
            type="checkbox"
            value={consent.consent_program_messages}
            onChange={updateConsent}
            error={errors.consent_program_messages}
            required
          />
          <FormField
            label="(Optional) I consent to my family's de-identified information being used in program reports to funders."
            name="consent_funder_reports"
            type="checkbox"
            value={consent.consent_funder_reports}
            onChange={updateConsent}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <FormField label="Signature (type your name)" name="signature_name" value={consent.signature_name} onChange={updateConsent} placeholder="Full name" />
          <FormField label="Date" name="signature_date" type="date" value={consent.signature_date} onChange={updateConsent} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Intake Completed By (staff)" name="intake_completed_by" value={consent.intake_completed_by} onChange={updateConsent} placeholder="Staff name" />
          <FormField
            label="Allergen Data Confirmed"
            name="allergen_confirmed"
            type="checkbox"
            value={consent.allergen_confirmed}
            onChange={updateConsent}
          />
        </div>
        {!consent.allergen_confirmed && (
          <Alert
            type="warning"
            title="Enrollment will be pending"
            message="Without allergen confirmation, the household will be saved but NOT enrolled. No kit will be produced until allergen data is confirmed by staff."
          />
        )}
      </FormSection>

      {result && (
        <Alert type={result.type} message={result.message} onClose={() => setResult(null)} />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : consent.allergen_confirmed ? 'Enroll Household' : 'Save Intake (Pending Confirmation)'}
      </button>
    </form>
  );
}
