/**
 * DonorForm Component
 * Form for creating or editing donors
 */

'use client';

import { useState, useEffect } from 'react';
import { useCreateDonor } from '@/hooks/useDonors';
import Button from '@/components/Button';
import FormField from '@/components/get-help/FormField';
import Alert from '@/components/get-help/Alert';

/**
 * @param {Object} props
 * @param {Object} props.initialData - Initial donor data for editing
 * @param {Function} props.onSubmit - Callback when form is submitted successfully
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isEditing - Whether form is in edit mode
 */
export default function DonorForm({ initialData = null, onSubmit, onCancel, isEditing = false }) {
  const { createDonor, loading: creating } = useCreateDonor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: 'NJ',
      zip: '',
    },
    donorType: 'individual',
    preferredContact: 'email',
    status: 'active',
    tags: [],
    notes: '',
    isRecurring: false,
    newsletterOptIn: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || {
          street: '',
          city: '',
          state: 'NJ',
          zip: '',
        },
        donorType: initialData.donorType || 'individual',
        preferredContact: initialData.preferredContact || 'email',
        status: initialData.status || 'active',
        tags: initialData.tags || [],
        notes: initialData.notes || '',
        isRecurring: initialData.isRecurring || false,
        newsletterOptIn: initialData.newsletterOptIn || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    try {
      setLoading(true);

      let result;
      if (isEditing && initialData?.id) {
        // Update existing donor
        const response = await fetch(`/api/admin/donors/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!data.ok) {
          throw new Error(data.error || 'Failed to update donor');
        }
        result = { success: true, data: data.data.donor };
      } else {
        // Create new donor
        result = await createDonor(formData);
      }

      if (result.success) {
        setSuccess(true);
        onSubmit?.(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert
          type="success"
          title="Success"
          message={`Donor ${isEditing ? 'updated' : 'created'} successfully!`}
          onClose={() => setSuccess(false)}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            error={validationErrors.fullName}
            required
            placeholder="John Doe / ACME Corporation"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            required
            placeholder="john@example.com"
          />

          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={validationErrors.phone}
            placeholder="(123) 456-7890"
          />

          <FormField
            label="Donor Type"
            name="donorType"
            type="select"
            value={formData.donorType}
            onChange={handleChange}
            error={validationErrors.donorType}
            options={[
              { value: 'individual', label: 'Individual' },
              { value: 'business', label: 'Business' },
              { value: 'foundation', label: 'Foundation' },
              { value: 'other', label: 'Other' },
            ]}
          />

          <FormField
            label="Preferred Contact Method"
            name="preferredContact"
            type="select"
            value={formData.preferredContact}
            onChange={handleChange}
            error={validationErrors.preferredContact}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'mail', label: 'Mail' },
            ]}
          />

          <FormField
            label="Status"
            name="status"
            type="select"
            value={formData.status}
            onChange={handleChange}
            error={validationErrors.status}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'lapsed', label: 'Lapsed' },
            ]}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField
              label="Street Address"
              name="address.street"
              type="text"
              value={formData.address.street}
              onChange={handleChange}
              error={validationErrors['address.street']}
              placeholder="123 Main St"
            />
          </div>

          <FormField
            label="City"
            name="address.city"
            type="text"
            value={formData.address.city}
            onChange={handleChange}
            error={validationErrors['address.city']}
            placeholder="Newark"
          />

          <FormField
            label="State"
            name="address.state"
            type="text"
            value={formData.address.state}
            onChange={handleChange}
            error={validationErrors['address.state']}
            placeholder="NJ"
          />

          <FormField
            label="ZIP Code"
            name="address.zip"
            type="text"
            value={formData.address.zip}
            onChange={handleChange}
            error={validationErrors['address.zip']}
            placeholder="07102"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm rounded-full flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <FormField
          label="Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          error={validationErrors.notes}
          placeholder="Internal notes about this donor..."
          rows={4}
          helpText="For internal use only"
        />

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Recurring Donor
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="newsletterOptIn"
              checked={formData.newsletterOptIn}
              onChange={handleChange}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Newsletter Opt-In
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading || creating}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || creating}
        >
          {loading || creating ? (
            <>
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Donor' : 'Create Donor'
          )}
        </Button>
      </div>
    </form>
  );
}
