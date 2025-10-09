export const colors = {
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceMuted: '#f3f4f6',
  border: '#e5e7eb',
  outline: '#d1d5db',
  text: '#111827',
  textMuted: '#6b7280',
  accent: '#111827',
  accentMuted: '#4b5563',
  positive: '#16a34a',
  caution: '#f59e0b',
  critical: '#ef4444',
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
