/**
 * TRS UI - Light Theme
 *
 * Clean, professional light interface.
 * Inverted color scheme while maintaining brand identity.
 */

export const lightTheme = {
  colors: {
    // Background colors
    background: '#f8f8f6',     // Off-white - main background
    surface: '#ffffff',        // Pure white - card/surface background
    surfaceHover: '#f0f0ee',   // Light gray - hover state
    surfaceAlt: '#e6e8e4',     // Alternative surface for nested elements

    // Accent colors
    accent: '#fd8216',         // Orange - primary accent (same as dark)
    accentHover: '#ff9233',    // Lighter orange - hover state
    accentMuted: '#cc6812',    // Darker orange - muted state

    // Text colors
    textPrimary: '#0d3a23',    // Deep green - primary text
    textSecondary: '#1a5a35',  // Medium green - secondary text
    textMuted: '#44684e',      // Muted green - tertiary text
    textAccent: '#fd8216',     // Orange for highlighted text

    // Border and divider colors
    border: '#cfd8cf',         // Light green-gray - borders and dividers
    borderLight: '#e6e8e4',    // Lighter border for subtle divisions
    borderHover: '#fd8216',    // Orange border for hover/focus states

    // Status colors
    success: '#22c55e',        // Green - positive metrics
    warning: '#f59e0b',        // Yellow - warnings
    error: '#ef4444',          // Red - errors and negative metrics
    info: '#3b82f6',           // Blue - informational

    // Chart colors (for data visualization)
    chart: {
      primary: '#fd8216',      // Orange
      secondary: '#22c55e',    // Green
      tertiary: '#3b82f6',     // Blue
      quaternary: '#8b5cf6',   // Purple
      quinary: '#ec4899',      // Pink
      senary: '#f59e0b',       // Yellow
    },

    // Opacity variants
    overlay: 'rgba(248, 248, 246, 0.95)',
    backdropBlur: 'rgba(248, 248, 246, 0.8)',
  },

  name: 'light',
  isDark: false,
} as const;

export type LightTheme = typeof lightTheme;
export default lightTheme;
