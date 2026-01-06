/**
 * VolunteerForm Component
 * Form for creating or editing volunteers
 */

'use client';

import { useState, useEffect } from 'react';
import { useCreateVolunteer } from '@/hooks/useVolunteers';
import Button from '@/components/Button';
import FormField from '@/components/get-help/FormField';
import Alert from '@/components/get-help/Alert';

const VOLUNTEER_ROLES = [
  'Food Distribution',
  'Event Planning',
  'Marketing & Outreach',
  'Administrative Support',
  'Fundraising',
  'Social Media',
  'Grant Writing',
  'Community Liaison',
  'Board Member',
  'Other',
];

/**
 * @param {Object} props
 * @param {Object} props.initialData - Initial volunteer data for editing
 * @param {Function} props.onSubmit - Callback when form is submitted successfully
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isEditing - Whether form is in edit mode
 */
export default function VolunteerForm({ initialData = null, onSubmit, onCancel, isEditing = false }) {
  const { createVolunteer, loading: creating } = useCreateVolunteer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    roles: [],
    availability: '',
    status: 'pending',
    resume: '',
    linkedin: '',
    accessibilityNotes: '',
    transportation: '',
    message: '',
    orientationCompleted: false,
    photoConsent: false,
    backgroundCheckCompleted: false,
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        preferredContact: initialData.preferredContact || 'email',
        roles: initialData.roles || [],
        availability: initialData.availability || '',
        status: initialData.status || 'pending',
        resume: initialData.resume || '',
        linkedin: initialData.linkedin || '',
        accessibilityNotes: initialData.accessibilityNotes || '',
        transportation: initialData.transportation || '',
        message: initialData.message || '',
        orientationCompleted: initialData.orientationCompleted || false,
        photoConsent: initialData.photoConsent || false,
        backgroundCheckCompleted: initialData.backgroundCheckCompleted || false,
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRolesChange = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role],
    }));
    if (validationErrors.roles) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.roles;
        return newErrors;
      });
    }
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
        // Update existing volunteer
        const response = await fetch(`/api/admin/volunteers/${initialData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();
        if (!data.ok) {
          throw new Error(data.error || 'Failed to update volunteer');
        }
        result = { success: true, data: data.data.volunteer };
      } else {
        // Create new volunteer
        result = await createVolunteer(formData);
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
          message={`Volunteer ${isEditing ? 'updated' : 'created'} successfully!`}
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
            placeholder="John Doe"
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
            label="Preferred Contact Method"
            name="preferredContact"
            type="select"
            value={formData.preferredContact}
            onChange={handleChange}
            error={validationErrors.preferredContact}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'text', label: 'Text' },
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
              { value: 'pending', label: 'Pending' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volunteer Roles <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {VOLUNTEER_ROLES.map(role => (
              <label key={role} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => handleRolesChange(role)}
                  className="rounded text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{role}</span>
              </label>
            ))}
          </div>
          {validationErrors.roles && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.roles}</p>
          )}
        </div>

        <FormField
          label="Availability"
          name="availability"
          type="textarea"
          value={formData.availability}
          onChange={handleChange}
          error={validationErrors.availability}
          required
          placeholder="Describe your availability (days, times, frequency)..."
          rows={3}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Resume URL"
            name="resume"
            type="url"
            value={formData.resume}
            onChange={handleChange}
            error={validationErrors.resume}
            placeholder="https://example.com/resume.pdf"
          />

          <FormField
            label="LinkedIn Profile"
            name="linkedin"
            type="url"
            value={formData.linkedin}
            onChange={handleChange}
            error={validationErrors.linkedin}
            placeholder="https://linkedin.com/in/username"
          />

          <FormField
            label="Transportation"
            name="transportation"
            type="text"
            value={formData.transportation}
            onChange={handleChange}
            error={validationErrors.transportation}
            placeholder="Own car, public transit, etc."
          />
        </div>

        <FormField
          label="Accessibility Notes"
          name="accessibilityNotes"
          type="textarea"
          value={formData.accessibilityNotes}
          onChange={handleChange}
          error={validationErrors.accessibilityNotes}
          placeholder="Any accessibility needs or accommodations..."
          rows={2}
        />

        <FormField
          label="Message"
          name="message"
          type="textarea"
          value={formData.message}
          onChange={handleChange}
          error={validationErrors.message}
          placeholder="Additional comments or information..."
          rows={3}
        />

        <FormField
          label="Admin Notes"
          name="notes"
          type="textarea"
          value={formData.notes}
          onChange={handleChange}
          error={validationErrors.notes}
          placeholder="Internal notes (not visible to volunteer)..."
          rows={3}
          helpText="For internal use only"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Compliance & Consent
        </h3>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="orientationCompleted"
              checked={formData.orientationCompleted}
              onChange={handleChange}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Orientation Completed
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="backgroundCheckCompleted"
              checked={formData.backgroundCheckCompleted}
              onChange={handleChange}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Background Check Completed
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="photoConsent"
              checked={formData.photoConsent}
              onChange={handleChange}
              className="rounded text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Photo Consent Given
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
            isEditing ? 'Update Volunteer' : 'Create Volunteer'
          )}
        </Button>
      </div>
    </form>
  );
}
