'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)]',
  outline: 'border border-[color:var(--color-outline)] text-[color:var(--color-text-muted)]',
  success: 'bg-[color:var(--color-positive)]/10 text-[color:var(--color-positive)]',
  warning: 'bg-[color:var(--color-caution)]/10 text-[color:var(--color-caution)]',
  destructive: 'bg-[color:var(--color-critical)]/10 text-[color:var(--color-critical)]',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variantStyles[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'
