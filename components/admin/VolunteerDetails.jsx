/**
 * VolunteerDetails Component
 * Displays detailed information about a volunteer
 */

'use client';

import { useState } from 'react';
import { useVolunteer } from '@/hooks/useVolunteers';
import Button from '@/components/Button';
import Alert from '@/components/get-help/Alert';

/**
 * @param {Object} props
 * @param {string} props.volunteerId - ID of the volunteer to display
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onClose - Callback when close button is clicked
 * @param {Function} props.onDeleted - Callback after successful deletion
 */
export default function VolunteerDetails({ volunteerId, onEdit, onClose, onDeleted }) {
  const { volunteer, loading, error, deleteVolunteer } = useVolunteer(volunteerId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);

      const result = await deleteVolunteer();
      if (result.success) {
        onDeleted?.();
      } else {
        setDeleteError(result.error);
      }
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading volunteer details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error loading volunteer: {error}</p>
        <Button onClick={onClose} variant="outline" className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200">Volunteer not found</p>
        <Button onClick={onClose} variant="outline" className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deleteError && (
        <Alert
          type="error"
          title="Delete Error"
          message={deleteError}
          onClose={() => setDeleteError(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {volunteer.fullName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{volunteer.email}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
            {volunteer.status}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {volunteer.phone || 'Not provided'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Contact</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
              {volunteer.preferredContact}
            </dd>
          </div>
        </dl>
      </div>

      {/* Volunteer Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Volunteer Information
        </h3>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</dt>
            <dd className="mt-1">
              <div className="flex flex-wrap gap-2">
                {volunteer.roles?.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Availability</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
              {volunteer.availability}
            </dd>
          </div>
          {volunteer.transportation && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transportation</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {volunteer.transportation}
              </dd>
            </div>
          )}
          {volunteer.accessibilityNotes && (
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Accessibility Notes</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {volunteer.accessibilityNotes}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Links & Resources */}
      {(volunteer.resume || volunteer.linkedin) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Links & Resources
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volunteer.resume && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume</dt>
                <dd className="mt-1">
                  <a
                    href={volunteer.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    View Resume →
                  </a>
                </dd>
              </div>
            )}
            {volunteer.linkedin && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">LinkedIn</dt>
                <dd className="mt-1">
                  <a
                    href={volunteer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                  >
                    View Profile →
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Compliance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Compliance & Consent
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Orientation</dt>
            <dd className="mt-1 text-sm">
              <span className={volunteer.orientationCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                {volunteer.orientationCompleted ? '✓ Completed' : '○ Pending'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Background Check</dt>
            <dd className="mt-1 text-sm">
              <span className={volunteer.backgroundCheckCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                {volunteer.backgroundCheckCompleted ? '✓ Completed' : '○ Pending'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Photo Consent</dt>
            <dd className="mt-1 text-sm">
              <span className={volunteer.photoConsent ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                {volunteer.photoConsent ? '✓ Given' : '○ Not Given'}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Messages & Notes */}
      {(volunteer.message || volunteer.notes) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Messages & Notes
          </h3>
          <dl className="space-y-4">
            {volunteer.message && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Volunteer Message</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {volunteer.message}
                </dd>
              </div>
            )}
            {volunteer.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  {volunteer.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Record Information
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatDate(volunteer.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {formatDate(volunteer.updated_at)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="outline"
          className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-500"
        >
          Delete Volunteer
        </Button>
        <div className="flex space-x-3">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={() => onEdit?.(volunteer)} variant="primary">
            Edit Volunteer
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this volunteer? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="primary"
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
