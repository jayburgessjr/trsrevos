/**
 * TRS UI - Dark Theme
 *
 * Deep green interface with orange accents.
 * Primary theme matching the TRS dashboard screenshot.
 */

export const darkTheme = {
  colors: {
    // Background colors
    background: '#0d3a23',     // Deep forest green - main background
    surface: '#124f2e',        // Medium green - card/surface background
    surfaceHover: '#156336',   // Lighter green - hover state
    surfaceAlt: '#0f4528',     // Alternative surface for nested elements

    // Accent colors
    accent: '#fd8216',         // Orange - primary accent for CTAs and highlights
    accentHover: '#ff9233',    // Lighter orange - hover state
    accentMuted: '#cc6812',    // Darker orange - muted state

    // Text colors
    textPrimary: '#f8f8f6',    // Off-white - primary text
    textSecondary: '#e8e8e6',  // Slightly muted white - secondary text
    textMuted: '#b3c2b0',      // Muted green-gray - tertiary text
    textAccent: '#fd8216',     // Orange for highlighted text

    // Border and divider colors
    border: '#1c5c3b',         // Medium-dark green - borders and dividers
    borderLight: '#2a7048',    // Lighter border for subtle divisions
    borderHover: '#fd8216',    // Orange border for hover/focus states

    // Status colors
    success: '#4ade80',        // Green - positive metrics
    warning: '#fbbf24',        // Yellow - warnings
    error: '#f87171',          // Red - errors and negative metrics
    info: '#60a5fa',           // Blue - informational

    // Chart colors (for data visualization)
    chart: {
      primary: '#fd8216',      // Orange
      secondary: '#4ade80',    // Green
      tertiary: '#60a5fa',     // Blue
      quaternary: '#a78bfa',   // Purple
      quinary: '#f472b6',      // Pink
      senary: '#fbbf24',       // Yellow
    },

    // Opacity variants
    overlay: 'rgba(13, 58, 35, 0.95)',
    backdropBlur: 'rgba(13, 58, 35, 0.8)',
  },

  name: 'dark',
  isDark: true,
} as const;

export type DarkTheme = typeof darkTheme;
export default darkTheme;
