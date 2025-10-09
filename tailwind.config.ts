import type { Config } from 'tailwindcss'
import { colors, fontSizes, radius, shadows, spacing } from './ui/tokens'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './ui/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        'surface-muted': colors.surfaceMuted,
        text: colors.text,
        'text-muted': colors.textMuted,
        border: colors.border,
        outline: colors.outline,
        accent: colors.accent,
        'accent-muted': colors.accentMuted,
        positive: colors.positive,
        caution: colors.caution,
        critical: colors.critical,
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        full: radius.full,
      },
      fontSize: {
        xs: fontSizes.xs,
        sm: fontSizes.sm,
        base: fontSizes.base,
        lg: fontSizes.lg,
        xl: fontSizes.xl,
        '2xl': fontSizes['2xl'],
        '3xl': fontSizes['3xl'],
      },
      spacing: {
        none: spacing.none,
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        '2xl': spacing['2xl'],
      },
      boxShadow: {
        sm: shadows.sm,
        md: shadows.md,
      },
    },
  },
  plugins: [],
}

export default config
