'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-muted-foreground bg-transparent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
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
