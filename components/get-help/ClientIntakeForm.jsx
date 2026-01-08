/**
 * Client Intake Form
 *
 * Application form for individuals seeking food assistance
 * Submits to backend API - no direct database writes
 */

'use client';

import { useState } from 'react';
import FormField from './FormField';
import FormSection from './FormSection';
import Alert from './Alert';
import { api, endpoints } from '@/lib/apiClient';

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

export default function ClientIntakeForm({ onSuccess, onScrollToMap }) {
  const [formData, setFormData] = useState({
    kind: 'client',
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
    notes: '',
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested fields (e.g., applicant.name, address.zip)
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
    // Handle checkbox groups (allergies, dietaryRestrictions, infantNeeds)
    else if (['allergies', 'dietaryRestrictions', 'infantNeeds'].includes(name)) {
      const currentArray = formData[name] || [];
      setFormData(prev => ({
        ...prev,
        [name]: checked
          ? [...currentArray, value]
          : currentArray.filter(v => v !== value),
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

    // Required fields
    if (!formData.applicant.name?.trim()) {
      newErrors['applicant.name'] = 'Name is required';
    }
    if (!formData.applicant.phone?.trim()) {
      newErrors['applicant.phone'] = 'Phone number is required';
    }
    if (!formData.address.zip?.trim()) {
      newErrors['address.zip'] = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.address.zip)) {
      newErrors['address.zip'] = 'ZIP code must be 5 digits';
    }
    if (!formData.householdSize || formData.householdSize < 1) {
      newErrors.householdSize = 'Household size must be at least 1';
    }
    if (!formData.consent) {
      newErrors.consent = 'You must consent to share your information';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Submit to backend API - no direct database writes
      const response = await api.post(endpoints.intakes.submit, formData, { skipAuth: true });

      if (!response.ok) {
        throw new Error(response.error || 'Failed to submit application');
      }

      const data = response.data;

      setSubmitStatus('success');
      setSubmitMessage(`Thank you! We've received your application and will contact you within 48 hours at ${formData.applicant.phone}.`);

      // Scroll to success message
      setTimeout(() => {
        document.getElementById('form-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit application. Please try again.');

      // Scroll to error message
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
          title="Application Received!"
          message={submitMessage}
          className="mb-6"
        />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">What's Next?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            While you wait, you can find food resources near you right now.
          </p>
          {onScrollToMap && (
            <button
              onClick={onScrollToMap}
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              Find Food Resources Near You
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto" noValidate>
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
        title="Contact Information"
        description="How can we reach you?"
        required
      >
        <FormField
          label="Full Name"
          name="applicant.name"
          value={formData.applicant.name}
          onChange={handleChange}
          error={errors['applicant.name']}
          required
          placeholder="John Doe"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Phone Number"
            name="applicant.phone"
            type="tel"
            value={formData.applicant.phone}
            onChange={handleChange}
            error={errors['applicant.phone']}
            required
            placeholder="(555) 123-4567"
          />

          <FormField
            label="Email (Optional)"
            name="applicant.email"
            type="email"
            value={formData.applicant.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
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
            required
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
        title="Address"
        description="Where are you located? This helps us find resources near you."
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
        title="Household Information"
        description="Tell us about your household"
        required
      >
        <FormField
          label="How many people are in your household?"
          name="householdSize"
          type="number"
          value={formData.householdSize}
          onChange={handleChange}
          error={errors.householdSize}
          required
          min={1}
        />

        <FormField
          label="Do you have children under 2 years old?"
          name="hasChildrenUnder2"
          type="checkbox"
          value={formData.hasChildrenUnder2}
          onChange={handleChange}
        />

        {formData.hasChildrenUnder2 && (
          <div className="ml-7 space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What infant supplies do you need?
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

        <FormField
          label="Does anyone in your household have senior needs or a disability?"
          name="hasSeniorsOrDisability"
          type="checkbox"
          value={formData.hasSeniorsOrDisability}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection
        title="Food Needs & Preferences"
        description="This helps us provide food that works for you"
      >
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Do you or anyone in your household have food allergies?
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
            Dietary restrictions or preferences
          </p>
          <FormField
            name="dietaryRestrictions"
            type="checkbox-group"
            value={formData.dietaryRestrictions}
            onChange={handleChange}
            options={DIETARY_OPTIONS}
          />
        </div>

        <FormField
          label="Kitchen Access"
          name="kitchenAccess"
          type="radio"
          value={formData.kitchenAccess}
          onChange={handleChange}
          options={[
            { value: 'full', label: 'Full kitchen (stove, refrigerator)' },
            { value: 'limited', label: 'Limited (microwave only, mini fridge)' },
            { value: 'none', label: 'No kitchen access' },
          ]}
        />
      </FormSection>

      <FormSection
        title="Programs & Logistics"
        description="Optional information that helps us serve you better"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Are you currently receiving SNAP benefits?"
            name="onSNAP"
            type="radio"
            value={formData.onSNAP}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'unsure', label: 'Unsure/Applied' },
            ]}
          />

          <FormField
            label="Are you currently receiving WIC?"
            name="onWIC"
            type="radio"
            value={formData.onWIC}
            onChange={handleChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </div>

        <FormField
          label="Do you have transportation to pick up food?"
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

        <FormField
          label="Additional Information"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Is there anything else you'd like us to know?"
          rows={4}
        />
      </FormSection>

      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <FormField
          label="I consent to Seed & Spoon NJ using this information to provide food assistance. Your information will be kept confidential."
          name="consent"
          type="checkbox"
          value={formData.consent}
          onChange={handleChange}
          error={errors.consent}
          required
        />

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          We respect your privacy. Your information is confidential and will only be used to connect you with food resources.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </form>
  );
}
