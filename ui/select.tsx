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
          'w-full appearance-none rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
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
