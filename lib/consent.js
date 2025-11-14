/**
 * Central Consent Manager
 *
 * Provides utility functions for accessing and managing cookie consent
 * preferences. Works alongside the useConsent hook for non-React contexts.
 *
 * GDPR/CCPA Compliant - respects user privacy choices
 */

const CONSENT_STORAGE_KEY = 'seed_spoon_cookie_consent';
const CONSENT_VERSION = '1.0';

/**
 * Get current consent preferences from localStorage
 * @returns {Object|null} Consent preferences or null if not set
 */
export function getConsent() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Verify version matches
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }

    return parsed.preferences;
  } catch (error) {
    console.error('[Consent] Error reading consent:', error);
    return null;
  }
}

/**
 * Set consent preferences in localStorage
 * @param {Object} preferences - Consent preferences object
 */
export function setConsent(preferences) {
  if (typeof window === 'undefined') return;

  try {
    const consentData = {
      version: CONSENT_VERSION,
      preferences,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));

    // Dispatch event for listeners
    window.dispatchEvent(
      new CustomEvent('consentUpdated', { detail: preferences })
    );
  } catch (error) {
    console.error('[Consent] Error saving consent:', error);
  }
}

/**
 * Register a callback to be invoked when consent changes
 * @param {Function} callback - Function to call with consent preferences
 * @returns {Function} Cleanup function to remove the listener
 */
export function onConsent(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    callback(event.detail);
  };

  window.addEventListener('consentUpdated', handler);

  // Call immediately with current consent if available
  const current = getConsent();
  if (current) {
    callback(current);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('consentUpdated', handler);
  };
}

/**
 * Check if a specific consent category is granted
 * @param {string} category - Category name (necessary, functional, analytics, marketing)
 * @returns {boolean} True if consent is granted for this category
 */
export function hasConsent(category) {
  const consent = getConsent();
  return consent?.[category] === true;
}

/**
 * Check if user has interacted with consent (made a choice)
 * @returns {boolean} True if consent has been saved
 */
export function hasInteracted() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
}

/**
 * Load a script dynamically with optional attributes
 * @param {string} src - Script source URL
 * @param {Object} attrs - Additional attributes to set on the script element
 * @returns {Promise<void>} Promise that resolves when script loads
 */
export function loadScript(src, attrs = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('loadScript can only be called in browser'));
      return;
    }

    // Check if script already exists
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    // Apply additional attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        script.setAttribute(key, String(value));
      }
    });

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
}

/**
 * Log analytics action (for debugging/fallback)
 * @param {string} provider - Analytics provider name
 * @param {string} action - Action being logged
 * @param {*} data - Optional data to log
 */
export function logAnalytics(provider, action, data) {
  if (typeof window === 'undefined') return;

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics/${provider}]`, action, data || '');
  }
}

/**
 * Check if consent is blocked (user hasn't made a choice or rejected analytics)
 * @param {string} category - Category to check (analytics or marketing)
 * @returns {boolean} True if consent is blocked
 */
export function isConsentBlocked(category) {
  if (!hasInteracted()) {
    logAnalytics('Consent', 'blocked', `User has not interacted - ${category} blocked`);
    return true;
  }

  if (!hasConsent(category)) {
    logAnalytics('Consent', 'blocked', `User rejected ${category}`);
    return true;
  }

  return false;
}
