export const colors = {
  // TRS Brand Colors
  background: '#015e32',        // TRS Green
  surface: '#ffffff',           // White for cards/content
  surfaceMuted: '#004d28',      // Darker TRS Green
  border: '#fd8216',            // TRS Orange accent
  outline: '#fd8216',           // TRS Orange
  text: '#ffffff',              // White text on green backgrounds
  textMuted: 'rgba(255, 255, 255, 0.7)',  // Semi-transparent white
  accent: '#fd8216',            // TRS Orange
  accentMuted: '#ff9a3c',       // Lighter orange
  positive: '#16a34a',          // Keep green for success states
  caution: '#f59e0b',           // Keep amber for warnings
  critical: '#ef4444',          // Keep red for errors
}

export const spacing = {
  none: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
}

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
}

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
}

export const shadows = {
  sm: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
  md: '0 10px 25px -10px rgba(15, 23, 42, 0.2)',
}

export const tokens = {
  colors,
  spacing,
  radius,
  fontSizes,
  shadows,
}

export type Tokens = typeof tokens
