/**
 * TRS UI - Tailwind CSS Configuration Extension
 *
 * Supports dark and light themes via CSS variables.
 * Import this into your main tailwind.config.js to apply TRS theme tokens.
 *
 * Usage:
 * ```ts
 * import { trsUITailwindExtend } from '@trs/ui/tailwind.config.extend';
 *
 * export default {
 *   content: ['./app/**\/*.{js,ts,jsx,tsx}', './packages/trs-ui/**\/*.{js,ts,jsx,tsx}'],
 *   ...trsUITailwindExtend,
 * }
 * ```
 */

import { theme } from './theme/theme';

export const trsUITailwindExtend = {
  theme: {
    extend: {
      // Use CSS variables for theme-aware colors
      colors: {
        trs: {
          // Background colors
          background: 'var(--trs-background)',
          surface: 'var(--trs-surface)',
          'surface-hover': 'var(--trs-surface-hover)',
          'surface-alt': 'var(--trs-surface-alt)',

          // Accent colors
          accent: 'var(--trs-accent)',
          'accent-hover': 'var(--trs-accent-hover)',
          'accent-muted': 'var(--trs-accent-muted)',

          // Text colors
          'text-primary': 'var(--trs-text-primary)',
          'text-secondary': 'var(--trs-text-secondary)',
          'text-muted': 'var(--trs-text-muted)',
          'text-accent': 'var(--trs-text-accent)',

          // Border colors
          border: 'var(--trs-border)',
          'border-light': 'var(--trs-border-light)',
          'border-hover': 'var(--trs-border-hover)',

          // Status colors
          success: 'var(--trs-success)',
          warning: 'var(--trs-warning)',
          error: 'var(--trs-error)',
          info: 'var(--trs-info)',

          // Chart colors
          'chart-primary': 'var(--trs-chart-primary)',
          'chart-secondary': 'var(--trs-chart-secondary)',
          'chart-tertiary': 'var(--trs-chart-tertiary)',
          'chart-quaternary': 'var(--trs-chart-quaternary)',
          'chart-quinary': 'var(--trs-chart-quinary)',
          'chart-senary': 'var(--trs-chart-senary)',

          // Opacity variants
          overlay: 'var(--trs-overlay)',
          'backdrop-blur': 'var(--trs-backdrop-blur)',
        },
      },

      fontFamily: {
        sans: theme.typography.fontFamily.sans.split(', '),
        mono: theme.typography.fontFamily.mono.split(', '),
      },

      fontSize: {
        xs: theme.typography.bodySmall.fontSize,
        sm: theme.typography.body.fontSize,
        base: theme.typography.bodyLarge.fontSize,
        lg: theme.typography.h5.fontSize,
        xl: theme.typography.h4.fontSize,
        '2xl': theme.typography.h3.fontSize,
        '3xl': theme.typography.h2.fontSize,
        '4xl': theme.typography.h1.fontSize,
      },

      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },

      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },

      spacing: theme.spacing,

      borderRadius: {
        ...theme.radii,
        'trs-sm': theme.radii.sm,
        'trs-base': theme.radii.base,
        'trs-lg': theme.radii.lg,
        'trs-xl': theme.radii.xl,
      },

      boxShadow: {
        ...theme.shadows,
        'trs-card': theme.shadows.card,
        'trs-lg': theme.shadows.lg,
        'trs-xl': theme.shadows.xl,
      },

      zIndex: theme.zIndex,

      transitionDuration: {
        fast: `${theme.animation.duration.fast}ms`,
        base: `${theme.animation.duration.base}ms`,
        slow: `${theme.animation.duration.slow}ms`,
        slower: `${theme.animation.duration.slower}ms`,
      },

      transitionTimingFunction: {
        smooth: theme.animation.easing.smooth,
      },

      maxWidth: {
        content: theme.layout.maxContentWidth,
      },

      width: {
        sidebar: theme.layout.sidebarWidth,
        'sidebar-collapsed': theme.layout.sidebarCollapsedWidth,
      },

      height: {
        header: theme.layout.headerHeight,
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
};

/**
 * CSS Variables Generator
 *
 * Generates CSS custom properties for theme switching.
 * Call this in your global CSS or _app.tsx
 */
export function generateThemeCSS() {
  return `
    :root[data-theme="dark"], :root {
      --trs-background: ${theme.dark.colors.background};
      --trs-surface: ${theme.dark.colors.surface};
      --trs-surface-hover: ${theme.dark.colors.surfaceHover};
      --trs-surface-alt: ${theme.dark.colors.surfaceAlt};

      --trs-accent: ${theme.dark.colors.accent};
      --trs-accent-hover: ${theme.dark.colors.accentHover};
      --trs-accent-muted: ${theme.dark.colors.accentMuted};

      --trs-text-primary: ${theme.dark.colors.textPrimary};
      --trs-text-secondary: ${theme.dark.colors.textSecondary};
      --trs-text-muted: ${theme.dark.colors.textMuted};
      --trs-text-accent: ${theme.dark.colors.textAccent};

      --trs-border: ${theme.dark.colors.border};
      --trs-border-light: ${theme.dark.colors.borderLight};
      --trs-border-hover: ${theme.dark.colors.borderHover};

      --trs-success: ${theme.dark.colors.success};
      --trs-warning: ${theme.dark.colors.warning};
      --trs-error: ${theme.dark.colors.error};
      --trs-info: ${theme.dark.colors.info};

      --trs-chart-primary: ${theme.dark.colors.chart.primary};
      --trs-chart-secondary: ${theme.dark.colors.chart.secondary};
      --trs-chart-tertiary: ${theme.dark.colors.chart.tertiary};
      --trs-chart-quaternary: ${theme.dark.colors.chart.quaternary};
      --trs-chart-quinary: ${theme.dark.colors.chart.quinary};
      --trs-chart-senary: ${theme.dark.colors.chart.senary};

      --trs-overlay: ${theme.dark.colors.overlay};
      --trs-backdrop-blur: ${theme.dark.colors.backdropBlur};
    }

    :root[data-theme="light"] {
      --trs-background: ${theme.light.colors.background};
      --trs-surface: ${theme.light.colors.surface};
      --trs-surface-hover: ${theme.light.colors.surfaceHover};
      --trs-surface-alt: ${theme.light.colors.surfaceAlt};

      --trs-accent: ${theme.light.colors.accent};
      --trs-accent-hover: ${theme.light.colors.accentHover};
      --trs-accent-muted: ${theme.light.colors.accentMuted};

      --trs-text-primary: ${theme.light.colors.textPrimary};
      --trs-text-secondary: ${theme.light.colors.textSecondary};
      --trs-text-muted: ${theme.light.colors.textMuted};
      --trs-text-accent: ${theme.light.colors.textAccent};

      --trs-border: ${theme.light.colors.border};
      --trs-border-light: ${theme.light.colors.borderLight};
      --trs-border-hover: ${theme.light.colors.borderHover};

      --trs-success: ${theme.light.colors.success};
      --trs-warning: ${theme.light.colors.warning};
      --trs-error: ${theme.light.colors.error};
      --trs-info: ${theme.light.colors.info};

      --trs-chart-primary: ${theme.light.colors.chart.primary};
      --trs-chart-secondary: ${theme.light.colors.chart.secondary};
      --trs-chart-tertiary: ${theme.light.colors.chart.tertiary};
      --trs-chart-quaternary: ${theme.light.colors.chart.quaternary};
      --trs-chart-quinary: ${theme.light.colors.chart.quinary};
      --trs-chart-senary: ${theme.light.colors.chart.senary};

      --trs-overlay: ${theme.light.colors.overlay};
      --trs-backdrop-blur: ${theme.light.colors.backdropBlur};
    }
  `;
}

export default trsUITailwindExtend;
