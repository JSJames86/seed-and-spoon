'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Dark mode is a "token remap only" per spec §3/Phase 5 -- this provider
// just tracks light/dark and applies a `.dark` class alongside
// `.spoonassist-v2`; every color the shell uses is a CSS custom property
// that spoonassist-v2.css remaps under `.spoonassist-v2.dark`, so no
// component needs its own dark-mode branch.
const STORAGE_KEY = 'spoonassist_theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') setThemeState(stored);
    } catch {
      // localStorage unavailable -- stays light for this session.
    }
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable -- theme still applies for this tab.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className={`spoonassist-v2${theme === 'dark' ? ' dark' : ''}`}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useSpoonAssistTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useSpoonAssistTheme() must be used within a ThemeProvider');
  return ctx;
}
