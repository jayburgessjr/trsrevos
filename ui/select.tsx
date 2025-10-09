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
          'w-full appearance-none rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm text-[color:var(--color-text)] shadow-sm transition focus-visible:border-[color:var(--color-accent-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-muted)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
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
