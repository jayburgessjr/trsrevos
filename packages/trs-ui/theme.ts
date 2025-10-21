/**
 * TRS UI Design System - Theme Tokens
 *
 * Core design tokens for The Revenue Scientists brand.
 * These tokens define the visual foundation for all TRS products.
 */

export const theme = {
  /**
   * Color Palette
   * Deep green primary with orange accent
   */
  colors: {
    // Background colors
    background: "#0d3a23",     // Deep forest green - main background
    surface: "#124f2e",        // Medium green - card/surface background
    surfaceHover: "#156336",   // Lighter green - hover state

    // Accent colors
    accent: "#fd8216",         // Orange - primary accent for CTAs and highlights
    accentHover: "#ff9233",    // Lighter orange - hover state

    // Text colors
    textPrimary: "#f8f8f6",    // Off-white - primary text
    textSecondary: "#e8e8e6",  // Slightly muted white - secondary text
    textMuted: "#b3c2b0",      // Muted green-gray - tertiary text

    // Border and divider colors
    border: "#1c5c3b",         // Medium-dark green - borders and dividers
    borderLight: "#2a7048",    // Lighter border for subtle divisions

    // Status colors
    success: "#4ade80",        // Green - positive metrics
    warning: "#fbbf24",        // Yellow - warnings
    error: "#f87171",          // Red - errors and negative metrics
    info: "#60a5fa",           // Blue - informational

    // Chart colors (for data visualization)
    chart: {
      primary: "#fd8216",
      secondary: "#4ade80",
      tertiary: "#60a5fa",
      quaternary: "#a78bfa",
      quinary: "#f472b6",
    }
  },

  /**
   * Typography
   * Clean, professional sans-serif system
   */
  fonts: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  },

  /**
   * Font Sizes
   * Modular scale for consistent typography
   */
  fontSizes: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "3rem",      // 48px
  },

  /**
   * Font Weights
   */
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  /**
   * Line Heights
   */
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  /**
   * Spacing Scale
   * Based on 4px base unit
   */
  spacing: {
    0: "0",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
    20: "5rem",     // 80px
  },

  /**
   * Border Radius
   * Consistent rounded corners
   */
  radii: {
    none: "0",
    sm: "0.375rem",   // 6px
    base: "0.75rem",  // 12px
    lg: "1rem",       // 16px
    xl: "1.5rem",     // 24px
    full: "9999px",   // Fully rounded
  },

  /**
   * Shadows
   * Subtle depth for cards and modals
   */
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    card: "0px 4px 10px rgba(0, 0, 0, 0.15)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  /**
   * Layout Constants
   */
  layout: {
    sidebarWidth: "250px",
    sidebarCollapsedWidth: "80px",
    headerHeight: "64px",
    maxContentWidth: "1440px",
  },

  /**
   * Z-Index Scale
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },

  /**
   * Transitions
   * Smooth, consistent animations
   */
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    base: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

export type Theme = typeof theme;

// Type-safe color access
export type ThemeColor = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
export type ThemeFontSize = keyof typeof theme.fontSizes;
export type ThemeRadius = keyof typeof theme.radii;
export type ThemeShadow = keyof typeof theme.shadows;

export default theme;
