'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../theme/theme';

const THEME_STORAGE_KEY = 'trs-ui-theme';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Theme Toggle Hook
 *
 * Manages theme state with:
 * - localStorage persistence
 * - System preference detection
 * - Automatic DOM updates
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme, systemTheme } = useThemeToggle();
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     Current: {theme}
 *   </button>
 * );
 * ```
 */
export function useThemeToggle(defaultTheme: ThemeMode = 'dark') {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Initial detection
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load theme from localStorage or use system preference
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored && (stored === 'dark' || stored === 'light')) {
      setThemeState(stored);
    } else {
      // Use system preference if no stored value
      setThemeState(systemTheme);
    }
    setMounted(true);
  }, [systemTheme]);

  // Update DOM and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return;

    // Update HTML attribute
    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);

    // Update localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Dispatch custom event for other components
    window.dispatchEvent(
      new CustomEvent('themechange', { detail: { theme } })
    );
  }, [theme, mounted]);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Set specific theme
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  // Reset to system preference
  const useSystemTheme = useCallback(() => {
    setThemeState(systemTheme);
    localStorage.removeItem(THEME_STORAGE_KEY);
  }, [systemTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    useSystemTheme,
    systemTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    mounted,
  };
}

/**
 * Theme Toggle Component Helper
 *
 * Prevents hydration mismatch by only rendering after mount.
 */
export function ThemeGuard({ children }: { children: React.ReactNode }) {
  const { mounted } = useThemeToggle();

  if (!mounted) {
    return null;
  }

  return React.createElement(React.Fragment, null, children);
}

export default useThemeToggle;
