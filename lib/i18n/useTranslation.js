/**
 * useTranslation Hook
 *
 * Simple i18n hook for accessing translations
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, DEFAULT_LANGUAGE } from './translations';

// Create context for language state
const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
});

/**
 * Language Provider Component
 * Wrap your app or page with this to enable translations
 */
export function LanguageProvider({ children, defaultLanguage = DEFAULT_LANGUAGE }) {
  const [language, setLanguage] = useState(defaultLanguage);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language');
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = language;
    }
  }, [language]);

  /**
   * Translation function
   * @param {string} key - Translation key (e.g., 'hero.title')
   * @param {object} vars - Optional variables for interpolation
   * @returns {string}
   */
  const t = (key, vars = {}) => {
    const translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;

    // Simple variable interpolation: "Hello {{name}}" with {name: "World"}
    if (Object.keys(vars).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return vars[variable] || match;
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useTranslation Hook
 * Use this in components to access translations
 *
 * @returns {{ language: string, setLanguage: function, t: function }}
 *
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * return <h1>{t('hero.title')}</h1>
 */
export function useTranslation() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  return context;
}

/**
 * Language Switcher Component
 * Drop-in component for switching languages
 */
export function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useTranslation();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700 ${className}`}
      aria-label="Select language"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
