'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm transition focus-visible:border-blue-500 dark:focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    )
  },
)
Select.displayName = 'Select'
