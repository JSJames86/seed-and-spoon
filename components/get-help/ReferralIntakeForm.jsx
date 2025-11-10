/**
 * Referral Intake Form
 *
 * Form for partner organizations to refer clients for food assistance
 */

'use client';

import { useState } from 'react';
import FormField from './FormField';
import FormSection from './FormSection';
import Alert from './Alert';

const ALLERGY_OPTIONS = [
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'wheat', label: 'Wheat/Gluten' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' },
];

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'halal', label: 'Halal' },
  { value: 'low_sodium', label: 'Low Sodium' },
  { value: 'diabetic_friendly', label: 'Diabetic-Friendly' },
  { value: 'other', label: 'Other' },
];

const SERVICES_PROVIDED = [
  { value: 'case_management', label: 'Case Management' },
  { value: 'housing_assistance', label: 'Housing Assistance' },
  { value: 'healthcare', label: 'Healthcare/Medical' },
  { value: 'mental_health', label: 'Mental Health Services' },
  { value: 'employment', label: 'Employment Services' },
  { value: 'legal_aid', label: 'Legal Aid' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

export default function ReferralIntakeForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    kind: 'referral',
    referrer: {
      orgName: '',
      contactName: '',
      email: '',
      phone: '',
      servicesProvided: [],
    },
    applicant: {
      name: '',
      phone: '',
      email: '',
      preferredContact: 'phone',
      preferredLanguage: 'English',
    },
    address: {
      street: '',
      city: '',
      state: 'NJ',
      zip: '',
    },
    householdSize: 1,
    hasChildrenUnder2: false,
    infantNeeds: [],
    hasSeniorsOrDisability: false,
    allergies: [],
    dietaryRestrictions: [],
    kitchenAccess: 'full',
    onSNAP: '',
    onWIC: '',
    transportation: '',
    clientConsent: false,
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested fields (e.g., referrer.orgName, applicant.name)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    }
    // Handle checkbox groups
    else if (['allergies', 'dietaryRestrictions', 'infantNeeds'].includes(name)) {
      const currentArray = formData[name] || [];
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...currentArray, value]
          : currentArray.filter(v => v !== value),
      }));
    }
    // Handle referrer services array
    else if (name === 'referrer.servicesProvided') {
      const currentArray = formData.referrer.servicesProvided || [];
      setFormData(prev => ({
        ...prev,
        referrer: {
          ...prev.referrer,
          servicesProvided: checked
            ? [...currentArray, value]
            : currentArray.filter(v => v !== value),
        },
      }));
    }
    // Handle regular fields
    else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Referrer fields
    if (!formData.referrer.orgName?.trim()) {
      newErrors['referrer.orgName'] = 'Organization name is required';
    }
    if (!formData.referrer.contactName?.trim()) {
      newErrors['referrer.contactName'] = 'Contact name is required';
    }
    if (!formData.referrer.email?.trim()) {
      newErrors['referrer.email'] = 'Email is required';
    }
    if (!formData.referrer.phone?.trim()) {
      newErrors['referrer.phone'] = 'Phone number is required';
    }

    // Client fields
    if (!formData.applicant.name?.trim()) {
      newErrors['applicant.name'] = 'Client name is required';
    }
    if (!formData.applicant.phone?.trim()) {
      newErrors['applicant.phone'] = 'Client phone number is required';
    }
    if (!formData.address.zip?.trim()) {
      newErrors['address.zip'] = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.address.zip)) {
      newErrors['address.zip'] = 'ZIP code must be 5 digits';
    }
    if (!formData.householdSize || formData.householdSize < 1) {
      newErrors.householdSize = 'Household size must be at least 1';
    }
    if (!formData.clientConsent) {
      newErrors.clientConsent = 'Client consent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit referral');
      }

      setSubmitStatus('success');
      setSubmitMessage(`Thank you for your referral! We will reach out to ${formData.applicant.name} within 48 hours.`);

      setTimeout(() => {
        document.getElementById('form-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit referral. Please try again.');

      setTimeout(() => {
        document.getElementById('form-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div id="form-status" className="max-w-2xl mx-auto">
        <Alert
          type="success"
          title="Referral Received!"
          message={submitMessage}
          className="mb-6"
        />
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've received your referral and will follow up with your client shortly.
            A copy of this referral has been sent to {formData.referrer.email}.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            Submit Another Referral
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto" noValidate>
      {/* Visual differentiation for referral form */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-700 p-4 mb-8 rounded">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-blue-700 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Partner Referral Form</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">For organizations referring clients for food assistance</p>
          </div>
        </div>
      </div>

      {submitStatus === 'error' && (
        <Alert
          id="form-status"
          type="error"
          title="Submission Failed"
          message={submitMessage}
          onClose={() => setSubmitStatus(null)}
          className="mb-6"
        />
      )}

      <FormSection
        title="Your Information (Referrer)"
        description="Tell us about your organization"
        required
      >
        <FormField
          label="Organization Name"
          name="referrer.orgName"
          value={formData.referrer.orgName}
          onChange={handleChange}
          error={errors['referrer.orgName']}
          required
          placeholder="Community Health Center"
        />

        <FormField
          label="Your Name"
          name="referrer.contactName"
          value={formData.referrer.contactName}
          onChange={handleChange}
          error={errors['referrer.contactName']}
          required
          placeholder="Jane Smith"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Your Email"
            name="referrer.email"
            type="email"
            value={formData.referrer.email}
            onChange={handleChange}
            error={errors['referrer.email']}
            required
            placeholder="jane@organization.org"
          />

          <FormField
            label="Your Phone"
            name="referrer.phone"
            type="tel"
            value={formData.referrer.phone}
            onChange={handleChange}
            error={errors['referrer.phone']}
            required
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What services does your organization provide? (Optional)
          </p>
          <FormField
            name="referrer.servicesProvided"
            type="checkbox-group"
            value={formData.referrer.servicesProvided}
            onChange={handleChange}
            options={SERVICES_PROVIDED}
          />
        </div>
      </FormSection>

      <FormSection
        title="Client Information"
        description="Information about the person you're referring"
        required
      >
        <FormField
          label="Client's Full Name"
          name="applicant.name"
          value={formData.applicant.name}
          onChange={handleChange}
          error={errors['applicant.name']}
          required
          placeholder="John Doe"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Client's Phone Number"
            name="applicant.phone"
            type="tel"
            value={formData.applicant.phone}
            onChange={handleChange}
            error={errors['applicant.phone']}
            required
            placeholder="(555) 123-4567"
          />

          <FormField
            label="Client's Email (Optional)"
            name="applicant.email"
            type="email"
            value={formData.applicant.email}
            onChange={handleChange}
            placeholder="client@example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Preferred Contact Method"
            name="applicant.preferredContact"
            type="select"
            value={formData.applicant.preferredContact}
            onChange={handleChange}
            options={[
              { value: 'phone', label: 'Phone Call' },
              { value: 'text', label: 'Text Message' },
              { value: 'email', label: 'Email' },
            ]}
          />

          <FormField
            label="Preferred Language"
            name="applicant.preferredLanguage"
            type="select"
            value={formData.applicant.preferredLanguage}
            onChange={handleChange}
            options={[
              { value: 'English', label: 'English' },
              { value: 'Spanish', label: 'Español' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </div>
      </FormSection>

      <FormSection
        title="Client's Address"
        description="Where is the client located?"
        required
      >
        <FormField
          label="ZIP Code"
          name="address.zip"
          value={formData.address.zip}
          onChange={handleChange}
          error={errors['address.zip']}
          required
          placeholder="07001"
          maxLength={5}
        />

        <FormField
          label="Street Address (Optional)"
          name="address.street"
          value={formData.address.street}
          onChange={handleChange}
          placeholder="123 Main St"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="City (Optional)"
            name="address.city"
            value={formData.address.city}
            onChange={handleChange}
            placeholder="Newark"
          />

          <FormField
            label="State"
            name="address.state"
            value={formData.address.state}
            disabled
          />
        </div>
      </FormSection>

      <FormSection
        title="Household & Needs"
        description="Information about the client's household"
      >
        <FormField
          label="Household Size"
          name="householdSize"
          type="number"
          value={formData.householdSize}
          onChange={handleChange}
          error={errors.householdSize}
          required
          min={1}
        />

        <FormField
          label="Children under 2 years old in household?"
          name="hasChildrenUnder2"
          type="checkbox"
          value={formData.hasChildrenUnder2}
          onChange={handleChange}
        />

        {formData.hasChildrenUnder2 && (
          <div className="ml-7 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Infant needs
            </p>
            <FormField
              name="infantNeeds"
              type="checkbox-group"
              value={formData.infantNeeds}
              onChange={handleChange}
              options={[
                { value: 'formula', label: 'Formula' },
                { value: 'baby_food', label: 'Baby Food' },
                { value: 'diapers', label: 'Diapers' },
              ]}
            />
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Food allergies
          </p>
          <FormField
            name="allergies"
            type="checkbox-group"
            value={formData.allergies}
            onChange={handleChange}
            options={ALLERGY_OPTIONS}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dietary restrictions
          </p>
          <FormField
            name="dietaryRestrictions"
            type="checkbox-group"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            options={DIETARY_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Currently on SNAP?"
            name="onSNAP"
            type="radio"
            value={formData.onSNAP}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'unsure', label: 'Unsure' },
            ]}
          />

          <FormField
            label="Has transportation?"
            name="transportation"
            type="radio"
            value={formData.transportation}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'sometimes', label: 'Sometimes' },
            ]}
          />
        </div>

        <FormField
          label="Additional Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information about the client's situation..."
          rows={4}
        />
      </FormSection>

      <div className="border-t-2 border-blue-200 dark:border-blue-700 pt-6 mt-8">
        <FormField
          label="I confirm that the client has given permission to share their information with Seed & Spoon NJ for the purpose of receiving food assistance."
          name="clientConsent"
          type="checkbox"
          value={formData.clientConsent}
          onChange={handleChange}
          error={errors.clientConsent}
          required
        />

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting Referral...' : 'Submit Referral'}
          </button>
        </div>
      </div>
    </form>
  );
}
