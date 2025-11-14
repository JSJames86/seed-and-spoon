'use client';

import { useState, useEffect, useCallback } from 'react';

// Cookie categories as per GDPR/CCPA requirements
export const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Necessary',
    description: 'Essential cookies required for the website to function properly. These cannot be disabled.',
    required: true,
  },
  functional: {
    name: 'Functional',
    description: 'Cookies that enable enhanced functionality and personalization, such as remembering your preferences.',
    required: false,
  },
  analytics: {
    name: 'Analytics',
    description: 'Cookies that help us understand how visitors interact with our website by collecting and reporting information anonymously.',
    required: false,
  },
  marketing: {
    name: 'Marketing',
    description: 'Cookies used to track visitors across websites to display relevant advertisements and measure campaign effectiveness.',
    required: false,
  },
};

const CONSENT_STORAGE_KEY = 'seed_spoon_cookie_consent';
const CONSENT_VERSION = '1.0'; // Increment when consent requirements change

export function useConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState(() => {
    // Initialize with necessary cookies enabled by default
    return Object.keys(COOKIE_CATEGORIES).reduce((acc, category) => {
      acc[category] = COOKIE_CATEGORIES[category].required;
      return acc;
    }, {});
  });
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if consent version matches
        if (parsed.version === CONSENT_VERSION) {
          setConsent(parsed.preferences);
          setHasInteracted(true);
          setShowBanner(false);

          // Apply consent settings
          applyConsentSettings(parsed.preferences);
        } else {
          // Version mismatch - show banner again
          setShowBanner(true);
        }
      } else {
        // No stored consent - show banner
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error loading consent preferences:', error);
      setShowBanner(true);
    }
  }, []);

  // Apply consent settings (enable/disable cookies, analytics, etc.)
  const applyConsentSettings = useCallback((preferences) => {
    // Google Analytics
    if (preferences.analytics) {
      // Enable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      });
    } else {
      // Disable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
      });
    }

    // Marketing/Advertising
    if (preferences.marketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else {
      window.gtag?.('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }

    // Functional cookies - store in localStorage if enabled
    if (!preferences.functional) {
      // Clear functional cookies/storage if disabled
      // (preserve only consent settings)
      const consentData = localStorage.getItem(CONSENT_STORAGE_KEY);
      localStorage.clear();
      if (consentData) {
        localStorage.setItem(CONSENT_STORAGE_KEY, consentData);
      }
    }

    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('consentUpdated', { detail: preferences }));
  }, []);

  // Save consent preferences
  const saveConsent = useCallback((preferences) => {
    try {
      const consentData = {
        version: CONSENT_VERSION,
        preferences,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
      setConsent(preferences);
      setHasInteracted(true);
      setShowBanner(false);
      setShowSettings(false);

      applyConsentSettings(preferences);
    } catch (error) {
      console.error('Error saving consent preferences:', error);
    }
  }, [applyConsentSettings]);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const allAccepted = Object.keys(COOKIE_CATEGORIES).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {});

    saveConsent(allAccepted);
  }, [saveConsent]);

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    const onlyNecessary = Object.keys(COOKIE_CATEGORIES).reduce((acc, category) => {
      acc[category] = COOKIE_CATEGORIES[category].required;
      return acc;
    }, {});

    saveConsent(onlyNecessary);
  }, [saveConsent]);

  // Update individual category
  const updateCategory = useCallback((category, value) => {
    // Cannot disable necessary cookies
    if (COOKIE_CATEGORIES[category]?.required) return;

    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  }, []);

  // Open settings modal
  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // Close settings modal
  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // Save custom preferences from modal
  const saveCustomPreferences = useCallback(() => {
    saveConsent(consent);
  }, [consent, saveConsent]);

  // Revoke consent (for testing or user request)
  const revokeConsent = useCallback(() => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      setHasInteracted(false);
      setShowBanner(true);

      // Reset to necessary only
      const onlyNecessary = Object.keys(COOKIE_CATEGORIES).reduce((acc, category) => {
        acc[category] = COOKIE_CATEGORIES[category].required;
        return acc;
      }, {});
      setConsent(onlyNecessary);
      applyConsentSettings(onlyNecessary);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  }, [applyConsentSettings]);

  return {
    // State
    consent,
    showBanner,
    showSettings,
    hasInteracted,

    // Actions
    acceptAll,
    rejectAll,
    updateCategory,
    openSettings,
    closeSettings,
    saveCustomPreferences,
    revokeConsent,

    // Utilities
    COOKIE_CATEGORIES,
  };
}
