'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-[96px] w-full rounded-md border border-[color:var(--color-outline)] bg-white px-3 py-2 text-sm text-[color:var(--color-text)] shadow-sm transition focus-visible:border-[color:var(--color-accent-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent-muted)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'
