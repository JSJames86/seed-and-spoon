/**
 * Custom hooks for donor and donation management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch and manage donors list
 * @param {Object} filters - Filter options (status, donorType, search, limit, offset)
 * @returns {Object} - { donors, loading, error, refetch, pagination }
 */
export function useDonors(filters = {}) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.donorType) params.append('donorType', filters.donorType);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/donors?${params.toString()}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch donors');
      }

      setDonors(result.data.donors || []);
      setPagination(result.data.pagination || null);
    } catch (err) {
      setError(err.message);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.donorType, filters.search, filters.limit, filters.offset]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return {
    donors,
    loading,
    error,
    refetch: fetchDonors,
    pagination,
  };
}

/**
 * Hook to fetch and manage a single donor
 * @param {string} id - Donor ID
 * @returns {Object} - { donor, loading, error, refetch, updateDonor, deleteDonor }
 */
export function useDonor(id) {
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonor = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/donors/${id}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch donor');
      }

      setDonor(result.data.donor);
    } catch (err) {
      setError(err.message);
      setDonor(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateDonor = useCallback(async (data) => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/donors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to update donor');
      }

      setDonor(result.data.donor);
      return { success: true, data: result.data.donor };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  const deleteDonor = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/donors/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to delete donor');
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [id]);

  useEffect(() => {
    fetchDonor();
  }, [fetchDonor]);

  return {
    donor,
    loading,
    error,
    refetch: fetchDonor,
    updateDonor,
    deleteDonor,
  };
}

/**
 * Hook to create a new donor
 * @returns {Object} - { createDonor, loading, error }
 */
export function useCreateDonor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDonor = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to create donor');
      }

      return { success: true, data: result.data.donor };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDonor,
    loading,
    error,
  };
}

/**
 * Hook to fetch and manage donations
 * @param {Object} filters - Filter options (donorId, status, donationType, startDate, endDate, limit, offset)
 * @returns {Object} - { donations, loading, error, refetch, pagination, summary }
 */
export function useDonations(filters = {}) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters.donorId) params.append('donorId', filters.donorId);
      if (filters.status) params.append('status', filters.status);
      if (filters.donationType) params.append('donationType', filters.donationType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/donations?${params.toString()}`);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch donations');
      }

      setDonations(result.data.donations || []);
      setPagination(result.data.pagination || null);
      setSummary(result.data.summary || null);
    } catch (err) {
      setError(err.message);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.donorId,
    filters.status,
    filters.donationType,
    filters.startDate,
    filters.endDate,
    filters.limit,
    filters.offset,
  ]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return {
    donations,
    loading,
    error,
    refetch: fetchDonations,
    pagination,
    summary,
  };
}

/**
 * Hook to create a new donation
 * @returns {Object} - { createDonation, loading, error }
 */
export function useCreateDonation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDonation = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Failed to create donation');
      }

      return { success: true, data: result.data.donation };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDonation,
    loading,
    error,
  };
}
