'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const variantClasses = {
  primary:
    'bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]',
  secondary:
    'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-outline)]',
  outline:
    'border border-[color:var(--color-outline)] bg-white text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-outline)]',
  ghost:
    'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-muted)]',
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
  icon: 'h-9 w-9 p-0',
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
