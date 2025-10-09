'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm text-[color:var(--color-text)] shadow-sm shadow-transparent transition focus-visible:border-[color:var(--color-accent-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-muted)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'
