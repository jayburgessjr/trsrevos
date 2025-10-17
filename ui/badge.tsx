'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
  outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-transparent',
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  destructive: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
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
