/**
 * EventCalendar Component
 * Calendar view for managing events with CRUD operations
 */

'use client';

import { useState, useMemo } from 'react';
import { useEvents, useCreateEvent, useEvent } from '@/hooks/useEvents';
import Button from '@/components/Button';
import FormField from '@/components/get-help/FormField';
import Alert from '@/components/get-help/Alert';

/**
 * EventCalendar Component
 * Shows events in a calendar/list view with create, edit, delete functionality
 */
export default function EventCalendar() {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  const filters = useMemo(() => ({
    status: statusFilter || undefined,
    eventType: typeFilter || undefined,
    upcoming: upcomingOnly,
    limit: 50,
  }), [statusFilter, typeFilter, upcomingOnly]);

  const { events, loading, error, refetch } = useEvents(filters);

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEditing(false);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setShowEventModal(true);
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsEditing(false);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const handleEventSaved = () => {
    refetch();
    handleCloseModal();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      volunteer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      fundraiser: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      distribution: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      community: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      training: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[type] || colors.other;
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Error loading events: {error}</p>
        <Button onClick={refetch} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Calendar</h2>
        <Button onClick={handleCreateEvent} variant="primary">
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type
            </label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="volunteer">Volunteer</option>
              <option value="fundraiser">Fundraiser</option>
              <option value="distribution">Distribution</option>
              <option value="community">Community</option>
              <option value="training">Training</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => setUpcomingOnly(e.target.checked)}
                className="rounded text-green-500 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Upcoming Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading events...</p>
        </div>
      )}

      {/* Events List */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewEvent(event)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {event.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(event.eventType)}`}>
                    {event.eventType}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>📅 {formatDate(event.startDate)}</p>
                  {event.location?.name && (
                    <p className="mt-1">📍 {event.location.name}</p>
                  )}
                  {event.capacity && (
                    <p className="mt-1">
                      👥 {event.spotsRemaining || 0} / {event.capacity} spots
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(event);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No events found.</p>
          {(statusFilter || typeFilter) && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try adjusting your filters.
            </p>
          )}
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          event={selectedEvent}
          isEditing={isEditing}
          onClose={handleCloseModal}
          onSaved={handleEventSaved}
          onDeleted={handleEventSaved}
        />
      )}
    </div>
  );
}

/**
 * EventModal Component
 * Modal for creating, viewing, editing, and deleting events
 */
function EventModal({ event, isEditing, onClose, onSaved, onDeleted }) {
  const { createEvent, loading: creating } = useCreateEvent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventType: event?.eventType || 'volunteer',
    status: event?.status || 'draft',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    allDay: event?.allDay || false,
    location: event?.location || {
      name: '',
      address: '',
      city: '',
      state: 'NJ',
      zip: '',
      isVirtual: false,
      virtualLink: '',
    },
    capacity: event?.capacity || '',
    registrationRequired: event?.registrationRequired || false,
    contactPerson: event?.contactPerson || '',
    contactEmail: event?.contactEmail || '',
    contactPhone: event?.contactPhone || '',
    notes: event?.notes || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [field]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Convert date strings to ISO format
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      };

      let result;
      if (isEditing && event?.id) {
        const response = await fetch(`/api/admin/events/${event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || 'Failed to update event');
        result = { success: true };
      } else {
        result = await createEvent(payload);
      }

      if (result.success) {
        onSaved?.();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to delete event');
      onDeleted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Event' : event ? 'Event Details' : 'Create Event'}
          </h2>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {error && (
            <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
          )}

          {(!event || isEditing) ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Event Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Food Distribution Event"
              />

              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the event..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Event Type"
                  name="eventType"
                  type="select"
                  value={formData.eventType}
                  onChange={handleChange}
                  options={[
                    { value: 'volunteer', label: 'Volunteer' },
                    { value: 'fundraiser', label: 'Fundraiser' },
                    { value: 'distribution', label: 'Distribution' },
                    { value: 'community', label: 'Community' },
                    { value: 'training', label: 'Training' },
                    { value: 'other', label: 'Other' },
                  ]}
                />

                <FormField
                  label="Status"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'cancelled', label: 'Cancelled' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                />

                <FormField
                  label="Start Date & Time"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="End Date & Time"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />

                <FormField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="50"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="allDay"
                    checked={formData.allDay}
                    onChange={handleChange}
                    className="rounded text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">All Day Event</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="registrationRequired"
                    checked={formData.registrationRequired}
                    onChange={handleChange}
                    className="rounded text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Registration Required</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="location.isVirtual"
                    checked={formData.location.isVirtual}
                    onChange={handleChange}
                    className="rounded text-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Virtual Event</span>
                </label>
              </div>

              {formData.location.isVirtual ? (
                <FormField
                  label="Virtual Link"
                  name="location.virtualLink"
                  type="url"
                  value={formData.location.virtualLink}
                  onChange={handleChange}
                  placeholder="https://zoom.us/..."
                />
              ) : (
                <div className="space-y-4">
                  <FormField
                    label="Location Name"
                    name="location.name"
                    type="text"
                    value={formData.location.name}
                    onChange={handleChange}
                    placeholder="Community Center"
                  />

                  <FormField
                    label="Address"
                    name="location.address"
                    type="text"
                    value={formData.location.address}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      label="City"
                      name="location.city"
                      type="text"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="Newark"
                    />

                    <FormField
                      label="State"
                      name="location.state"
                      type="text"
                      value={formData.location.state}
                      onChange={handleChange}
                      placeholder="NJ"
                    />

                    <FormField
                      label="ZIP"
                      name="location.zip"
                      type="text"
                      value={formData.location.zip}
                      onChange={handleChange}
                      placeholder="07102"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Contact Person"
                  name="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="John Doe"
                />

                <FormField
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                />

                <FormField
                  label="Contact Phone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                />
              </div>

              <FormField
                label="Notes"
                name="notes"
                type="textarea"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Internal notes..."
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" onClick={onClose} variant="outline" disabled={loading || creating}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading || creating}>
                  {loading || creating ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{event.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-gray-900 dark:text-white capitalize">{event.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-gray-900 dark:text-white capitalize">{event.status}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                {event && (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    Delete
                  </Button>
                )}
                <div className="flex space-x-3">
                  <Button onClick={onClose} variant="outline">Close</Button>
                  <Button onClick={() => window.location.reload()} variant="primary">Edit</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this event?
            </p>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="primary" disabled={deleting} className="bg-red-600">
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
