/**
 * Client Intake Form - Multi-Step Wizard
 *
 * Application form for individuals seeking food assistance
 * Modern stepped interface for better UX
 */

'use client';

import { useState } from 'react';
import FormField from './FormField';
import FormSection from './FormSection';
import Alert from './Alert';

// Step configuration
const STEPS = [
  { id: 1, name: 'Contact', icon: '👤', description: 'Your information' },
  { id: 2, name: 'Address', icon: '📍', description: 'Where you live' },
  { id: 3, name: 'Household', icon: '👨‍👩‍👧‍👦', description: 'Family details' },
  { id: 4, name: 'Preferences', icon: '🍽️', description: 'Dietary needs' },
  { id: 5, name: 'Review', icon: '✓', description: 'Confirm & submit' },
];

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
  const [currentStep, setCurrentStep] = useState(1);

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

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Contact Information
        if (!formData.applicant.name?.trim()) {
          newErrors['applicant.name'] = 'Name is required';
        }
        if (!formData.applicant.phone?.trim()) {
          newErrors['applicant.phone'] = 'Phone number is required';
        }
        break;
      
      case 2: // Address
        if (!formData.address.zip?.trim()) {
          newErrors['address.zip'] = 'ZIP code is required';
        } else if (!/^\d{5}$/.test(formData.address.zip)) {
          newErrors['address.zip'] = 'ZIP code must be 5 digits';
        }
        if (!formData.address.city?.trim()) {
          newErrors['address.city'] = 'City is required';
        }
        break;
      
      case 3: // Household
        if (!formData.householdSize || formData.householdSize < 1) {
          newErrors.householdSize = 'Household size must be at least 1';
        }
        break;
      
      case 5: // Review & Consent
        if (!formData.consent) {
          newErrors.consent = 'You must consent to share your information';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    // Validate all steps
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to first error
      const firstError = document.querySelector('[aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const response = await fetch('/api/intakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

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
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step Circles */}
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={step.id > currentStep}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 transition-all duration-300
                  ${step.id < currentStep ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700' : ''}
                  ${step.id === currentStep ? 'bg-green-600 text-white ring-4 ring-green-200 dark:ring-green-900' : ''}
                  ${step.id > currentStep ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : ''}
                `}
              >
                {step.id < currentStep ? '✓' : step.icon}
              </button>
              <span className={`
                text-xs font-medium text-center hidden sm:block
                ${step.id === currentStep ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {step.name}
              </span>
            </div>
          ))}
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

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 mb-6">
        {/* Step Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {STEPS[currentStep - 1].name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {STEPS[currentStep - 1].description}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
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
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <FormSection
                title=""
                description=""
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
            </div>
          )}

          {/* Step 3: Household Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <FormSection
                title=""
                description=""
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
            </div>
          )}

          {/* Step 4: Food Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <FormSection
                title=""
                description=""
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
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Review Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Review Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium">{formData.applicant.name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{formData.applicant.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">City</p>
                    <p className="font-medium">{formData.address.city || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">ZIP Code</p>
                    <p className="font-medium">{formData.address.zip || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Household Size</p>
                    <p className="font-medium">{formData.householdSize} {formData.householdSize === 1 ? 'person' : 'people'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Kitchen Access</p>
                    <p className="font-medium capitalize">{formData.kitchenAccess.replace('_', ' ')}</p>
                  </div>
                </div>

                {(formData.allergies.length > 0 || formData.dietaryRestrictions.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    {formData.allergies.length > 0 && (
                      <div className="mb-2">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Allergies</p>
                        <p className="font-medium text-sm">{formData.allergies.join(', ')}</p>
                      </div>
                    )}
                    {formData.dietaryRestrictions.length > 0 && (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Dietary Restrictions</p>
                        <p className="font-medium text-sm">{formData.dietaryRestrictions.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Programs & Notes */}
              <FormSection title="" description="">
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
                    { value: 'yes', label: 'Yes, I can pick up' },
                    { value: 'no', label: 'No, I need delivery' },
                    { value: 'sometimes', label: 'Sometimes' },
                  ]}
                />

                <FormField
                  label="Additional Notes (Optional)"
                  name="notes"
                  type="textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Is there anything else you'd like us to know?"
                  rows={4}
                />
              </FormSection>

              {/* Consent */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
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
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                ← Back
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  '✓ Submit Application'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
