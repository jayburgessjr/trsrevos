/**
 * TRS UI - Unified Theme System
 *
 * Complete theme configuration with dark and light mode support.
 * Single source of truth for all TRS design tokens.
 */

import { darkTheme } from './dark';
import { lightTheme } from './light';

/**
 * Typography System
 * Consistent font styles across all themes
 */
export const typography = {
  fontFamily: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },

  // Heading styles
  h1: {
    fontSize: '2.25rem',      // 36px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.875rem',     // 30px
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',       // 24px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',      // 20px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: '1.125rem',     // 18px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',         // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },

  // Body styles
  body: {
    fontSize: '0.875rem',     // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  bodyLarge: {
    fontSize: '1rem',         // 16px
    fontWeight: 400,
    lineHeight: 1.6,
  },
  bodySmall: {
    fontSize: '0.75rem',      // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },

  // Special styles
  label: {
    fontSize: '0.75rem',      // 12px
    fontWeight: 500,
    lineHeight: 1.5,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  metric: {
    fontSize: '2rem',         // 32px
    fontWeight: 700,
    lineHeight: 1.2,
  },
  caption: {
    fontSize: '0.6875rem',    // 11px
    fontWeight: 400,
    lineHeight: 1.5,
  },
} as const;

/**
 * Spacing Scale
 * Based on 4px base unit
 */
export const spacing = {
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const;

/**
 * Border Radius
 */
export const radii = {
  none: '0',
  sm: '0.375rem',   // 6px
  base: '0.75rem',  // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',
} as const;

/**
 * Shadows
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  card: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

/**
 * Layout Constants
 */
export const layout = {
  sidebarWidth: '250px',
  sidebarCollapsedWidth: '80px',
  headerHeight: '64px',
  maxContentWidth: '1440px',
  cardPadding: '20px',
} as const;

/**
 * Z-Index Scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * Animation Timing
 */
export const animation = {
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Breakpoints (mobile-first)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Complete Theme Object
 */
export const theme = {
  dark: darkTheme,
  light: lightTheme,
  typography,
  spacing,
  radii,
  shadows,
  layout,
  zIndex,
  animation,
  breakpoints,
} as const;

export type Theme = typeof theme;
export type ThemeMode = 'dark' | 'light';
export type ThemeColors = typeof darkTheme.colors | typeof lightTheme.colors;

export { darkTheme, lightTheme };
export default theme;
