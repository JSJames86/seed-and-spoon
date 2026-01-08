/**
 * Provider Submission Modal
 *
 * Modal form for food providers to request being listed in the directory
 * Submits to backend API - no direct database writes
 */

'use client';

import { useState } from 'react';
import FormField from './FormField';
import FormSection from './FormSection';
import Alert from './Alert';
import { NJ_COUNTIES } from '@/lib/validation';
import { api, endpoints } from '@/lib/apiClient';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SERVICE_OPTIONS = [
  { value: 'produce', label: 'Fresh Produce' },
  { value: 'prepared_meals', label: 'Prepared Meals' },
  { value: 'diapers', label: 'Diapers' },
  { value: 'formula', label: 'Infant Formula' },
  { value: 'baby_food', label: 'Baby Food' },
  { value: 'halal', label: 'Halal Options' },
  { value: 'kosher', label: 'Kosher Options' },
  { value: 'vegetarian', label: 'Vegetarian Options' },
  { value: 'vegan', label: 'Vegan Options' },
];

export default function ProviderSubmissionModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    orgName: '',
    siteName: '',
    county: '',
    address: {
      street: '',
      city: '',
      state: 'NJ',
      zip: '',
    },
    type: '',
    hours: [],
    services: [],
    languages: ['English'],
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    eligibility: '',
    notes: '',
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (name === 'services') {
      const currentServices = formData.services || [];
      setFormData(prev => ({
        ...prev,
        services: checked
          ? [...currentServices, value]
          : currentServices.filter(s => s !== value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLanguageChange = (e) => {
    const languages = e.target.value.split(',').map(l => l.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, languages }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.orgName?.trim()) {
      newErrors.orgName = 'Organization name is required';
    }
    if (!formData.county) {
      newErrors.county = 'County is required';
    }
    if (!formData.address.street?.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    if (!formData.address.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.zip?.trim()) {
      newErrors['address.zip'] = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(formData.address.zip)) {
      newErrors['address.zip'] = 'ZIP code must be 5 digits';
    }
    if (!formData.type) {
      newErrors.type = 'Resource type is required';
    }
    if (!formData.contact.phone?.trim() && !formData.contact.email?.trim()) {
      newErrors.contact = 'At least one contact method (phone or email) is required';
    }
    if (!formData.consent) {
      newErrors.consent = 'You must confirm the information is accurate';
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
      // Submit to backend API - no direct database writes
      const response = await api.post(endpoints.providers.submit, formData, { skipAuth: true });

      if (!response.ok) {
        throw new Error(response.error || 'Failed to submit provider information');
      }

      setSubmitStatus('success');
      setSubmitMessage('Thank you! Your submission has been received and will be reviewed within 3-5 business days.');

      setTimeout(() => {
        document.getElementById('modal-status')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setSubmitMessage(error.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitStatus === 'success' || window.confirm('Are you sure you want to close? Your progress will be lost.')) {
      setFormData({
        orgName: '',
        siteName: '',
        county: '',
        address: { street: '', city: '', state: 'NJ', zip: '' },
        type: '',
        hours: [],
        services: [],
        languages: ['English'],
        contact: { phone: '', email: '', website: '' },
        eligibility: '',
        notes: '',
        consent: false,
      });
      setErrors({});
      setSubmitStatus(null);
      setSubmitMessage('');
      onClose();
    }
  };

  if (!isOpen) return null;

  if (submitStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <Alert
            id="modal-status"
            type="success"
            title="Submission Received!"
            message={submitMessage}
            className="mb-6"
          />
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We'll review your information and contact you at {formData.contact.email || formData.contact.phone}.
            </p>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Request to Be Listed
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {submitStatus === 'error' && (
            <Alert
              id="modal-status"
              type="error"
              title="Submission Failed"
              message={submitMessage}
              onClose={() => setSubmitStatus(null)}
            />
          )}

          <div className="space-y-6">
            <FormField
              label="Organization Name"
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
              error={errors.orgName}
              required
              placeholder="Community Food Pantry"
            />

            <FormField
              label="Site Name (if different from organization)"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="Downtown Location"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="County"
                name="county"
                type="select"
                value={formData.county}
                onChange={handleChange}
                error={errors.county}
                required
                options={NJ_COUNTIES.map(c => ({ value: c, label: c }))}
                placeholder="Select a county"
              />

              <FormField
                label="Type of Resource"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleChange}
                error={errors.type}
                required
                options={[
                  { value: 'food_pantry', label: 'Food Pantry' },
                  { value: 'hot_meal', label: 'Hot Meal Site' },
                  { value: 'mobile_pantry', label: 'Mobile Pantry' },
                  { value: 'community_fridge', label: 'Community Fridge' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="Select type"
              />
            </div>

            <FormField
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              error={errors['address.street']}
              required
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                error={errors['address.city']}
                required
                placeholder="Newark"
              />

              <FormField
                label="State"
                name="address.state"
                value={formData.address.state}
                disabled
              />

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
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Services Offered
              </p>
              <FormField
                name="services"
                type="checkbox-group"
                value={formData.services}
                onChange={handleChange}
                options={SERVICE_OPTIONS}
              />
            </div>

            <FormField
              label="Languages Spoken"
              name="languages"
              value={formData.languages.join(', ')}
              onChange={handleLanguageChange}
              helpText="Enter languages separated by commas (e.g., English, Spanish, Arabic)"
              placeholder="English, Spanish"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Phone Number"
                name="contact.phone"
                type="tel"
                value={formData.contact.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />

              <FormField
                label="Email"
                name="contact.email"
                type="email"
                value={formData.contact.email}
                onChange={handleChange}
                placeholder="info@foodpantry.org"
              />
            </div>

            {errors.contact && (
              <p className="text-sm text-red-600">{errors.contact}</p>
            )}

            <FormField
              label="Website (Optional)"
              name="contact.website"
              type="url"
              value={formData.contact.website}
              onChange={handleChange}
              placeholder="https://www.foodpantry.org"
            />

            <FormField
              label="Eligibility Requirements (Optional)"
              name="eligibility"
              type="textarea"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="e.g., Must be resident of Essex County, Must show ID..."
              rows={3}
            />

            <FormField
              label="Additional Notes (Optional)"
              name="notes"
              type="textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about your service..."
              rows={3}
            />

            <FormField
              label="I confirm that the information provided is accurate and I agree to be contacted by Seed & Spoon NJ to verify this information."
              name="consent"
              type="checkbox"
              value={formData.consent}
              onChange={handleChange}
              error={errors.consent}
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
