/**
 * Custom hooks for volunteer management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch and manage volunteers list
 * @param {Object} filters - Filter options (status, search, limit, offset)
 * @returns {Object} - { volunteers, loading, error, refetch, pagination }
 */
export function useVolunteers(filters = {}) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/volunteers?${params.toString()}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch volunteers');
      }

      setVolunteers(result.data.volunteers || []);
      setPagination(result.data.pagination || null);
    } catch (err) {
      setError(err.message);
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.search, filters.limit, filters.offset]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  return {
    volunteers,
    loading,
    error,
    refetch: fetchVolunteers,
    pagination,
  };
}

/**
 * Hook to fetch and manage a single volunteer
 * @param {string} id - Volunteer ID
 * @returns {Object} - { volunteer, loading, error, refetch, updateVolunteer, deleteVolunteer }
 */
export function useVolunteer(id) {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVolunteer = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/volunteers/${id}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch volunteer');
      }

      setVolunteer(result.data.volunteer);
    } catch (err) {
      setError(err.message);
      setVolunteer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateVolunteer = useCallback(async (data) => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/volunteers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to update volunteer');
      }

      setVolunteer(result.data.volunteer);
      return { success: true, data: result.data.volunteer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  const deleteVolunteer = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/volunteers/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete volunteer');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  useEffect(() => {
    fetchVolunteer();
  }, [fetchVolunteer]);

  return {
    volunteer,
    loading,
    error,
    refetch: fetchVolunteer,
    updateVolunteer,
    deleteVolunteer,
  };
}

/**
 * Hook to create a new volunteer
 * @returns {Object} - { createVolunteer, loading, error }
 */
export function useCreateVolunteer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createVolunteer = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to create volunteer');
      }

      return { success: true, data: result.data.volunteer };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createVolunteer,
    loading,
    error,
  };
}
