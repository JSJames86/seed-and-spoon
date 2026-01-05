/**
 * Centralized API Helper for Seed & Spoon Frontend
 *
 * This module provides a clean interface for communicating with the backend API.
 * All API requests flow through these helper functions to ensure consistency,
 * proper error handling, and a maintainable codebase.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_API_BASE_URL: Backend API base URL (e.g., https://seed-and-spoon-backend.vercel.app)
 */

/**
 * Get the backend API base URL from environment variables
 * Throws an error if not configured to fail fast during development
 */
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not configured. Please add it to your .env.local file.'
    );
  }

  return baseUrl.replace(/\/$/, ''); // Remove trailing slash
};

/**
 * Generic fetch wrapper with error handling
 * Provides consistent error handling across all API calls
 *
 * @param {string} endpoint - API endpoint (e.g., '/api/directory/food-banks')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Response data
 */
const apiFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    return data;

  } catch (error) {
    // Re-throw with user-friendly message
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }

    throw error;
  }
};

/**
 * Fetch all food banks from the directory
 *
 * @returns {Promise<Array>} Array of food bank objects
 *
 * Data Flow:
 * 1. Frontend calls getFoodBanks()
 * 2. Request sent to GET /api/directory/food-banks on backend
 * 3. Backend queries database and returns food bank list
 * 4. Frontend receives data for display in directory and map
 */
export const getFoodBanks = async () => {
  try {
    const data = await apiFetch('/api/directory/food-banks');

    // Backend should return: { foodBanks: [...] } or just [...]
    // Handle both formats for flexibility
    return Array.isArray(data) ? data : data.foodBanks || [];

  } catch (error) {
    console.error('Error fetching food banks:', error);
    throw new Error('Unable to load food banks. Please try again later.');
  }
};

/**
 * Fetch services/resources from a specific food bank
 *
 * @param {string|number} foodBankId - Optional food bank ID to filter by
 * @returns {Promise<Array>} Array of service objects
 *
 * Data Flow:
 * 1. Frontend calls getServices(foodBankId)
 * 2. Request sent to GET /api/directory/services?foodBankId=X
 * 3. Backend returns services for that food bank
 * 4. Frontend displays available services (food pantry, meal programs, etc.)
 */
export const getServices = async (foodBankId = null) => {
  try {
    const endpoint = foodBankId
      ? `/api/directory/services?foodBankId=${foodBankId}`
      : '/api/directory/services';

    const data = await apiFetch(endpoint);

    // Backend should return: { services: [...] } or just [...]
    return Array.isArray(data) ? data : data.services || [];

  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('Unable to load services. Please try again later.');
  }
};

/**
 * Create a donation via Stripe
 *
 * @param {Object} payload - Donation details
 * @param {number} payload.amount - Amount in dollars (e.g., 25.00)
 * @param {string} payload.interval - 'one-time' or 'monthly'
 * @param {string} payload.successUrl - URL to redirect after successful payment
 * @param {string} payload.cancelUrl - URL to redirect if payment is cancelled
 * @returns {Promise<Object>} Object with client_secret for Stripe
 *
 * Data Flow:
 * 1. User selects amount and interval on donation page
 * 2. Frontend calls createDonation({ amount, interval, successUrl, cancelUrl })
 * 3. Request sent to POST /api/donations/create on backend
 * 4. Backend creates Stripe checkout session
 * 5. Backend returns { clientSecret, sessionId }
 * 6. Frontend uses clientSecret to redirect to Stripe Checkout
 * 7. After payment, Stripe redirects to successUrl or cancelUrl
 *
 * Security Notes:
 * - Amount is validated on backend (never trust client input)
 * - Stripe secret keys are ONLY on backend, never exposed to frontend
 * - Client secret is safe to use in frontend (it's designed for that)
 */
export const createDonation = async (payload) => {
  try {
    const data = await apiFetch('/api/donations/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Backend should return: { clientSecret, sessionId }
    if (!data.clientSecret) {
      throw new Error('Invalid response from donation API');
    }

    return data;

  } catch (error) {
    console.error('Error creating donation:', error);
    throw new Error('Unable to process donation. Please try again later.');
  }
};

/**
 * Submit a client intake form (for individuals seeking food assistance)
 *
 * @param {Object} formData - Client intake form data
 * @returns {Promise<Object>} Confirmation response
 */
export const submitClientIntake = async (formData) => {
  try {
    const data = await apiFetch('/api/forms/intake-client', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return data;

  } catch (error) {
    console.error('Error submitting client intake:', error);
    throw new Error('Unable to submit form. Please try again later.');
  }
};

/**
 * Submit a referral intake form (for agencies referring clients)
 *
 * @param {Object} formData - Referral intake form data
 * @returns {Promise<Object>} Confirmation response
 */
export const submitReferralIntake = async (formData) => {
  try {
    const data = await apiFetch('/api/forms/intake-referral', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return data;

  } catch (error) {
    console.error('Error submitting referral:', error);
    throw new Error('Unable to submit referral. Please try again later.');
  }
};

/**
 * Submit a new provider/food bank to the directory
 *
 * @param {Object} providerData - Provider submission data
 * @returns {Promise<Object>} Confirmation response
 */
export const submitProvider = async (providerData) => {
  try {
    const data = await apiFetch('/api/forms/provider-submission', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });

    return data;

  } catch (error) {
    console.error('Error submitting provider:', error);
    throw new Error('Unable to submit provider information. Please try again later.');
  }
};

/**
 * Health check endpoint to verify backend connectivity
 * Useful for debugging and monitoring
 *
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const data = await apiFetch('/api/health');
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', message: error.message };
  }
};

// Export a default object with all API functions for convenience
export default {
  getFoodBanks,
  getServices,
  createDonation,
  submitClientIntake,
  submitReferralIntake,
  submitProvider,
  checkHealth,
};
