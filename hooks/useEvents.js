/**
 * Custom hooks for event management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch and manage events list
 * @param {Object} filters - Filter options (status, eventType, startDate, endDate, upcoming, limit, offset)
 * @returns {Object} - { events, loading, error, refetch, pagination }
 */
export function useEvents(filters = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.upcoming !== undefined) params.append('upcoming', filters.upcoming.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch events');
      }

      setEvents(result.data.events || []);
      setPagination(result.data.pagination || null);
    } catch (err) {
      setError(err.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.eventType,
    filters.startDate,
    filters.endDate,
    filters.upcoming,
    filters.limit,
    filters.offset,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    pagination,
  };
}

/**
 * Hook to fetch and manage a single event
 * @param {string} id - Event ID
 * @returns {Object} - { event, loading, error, refetch, updateEvent, deleteEvent }
 */
export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/events/${id}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch event');
      }

      setEvent(result.data.event);
    } catch (err) {
      setError(err.message);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateEvent = useCallback(async (data) => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to update event');
      }

      setEvent(result.data.event);
      return { success: true, data: result.data.event };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  const deleteEvent = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete event');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
    updateEvent,
    deleteEvent,
  };
}

/**
 * Hook to create a new event
 * @returns {Object} - { createEvent, loading, error }
 */
export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createEvent = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      return { success: true, data: result.data.event };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createEvent,
    loading,
    error,
  };
}
