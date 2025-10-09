import * as React from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-2 border-b border-[color:var(--color-outline)] bg-[color:var(--color-surface)] px-6 py-5 shadow-sm', className)}
      {...props}
    />
  )
}

export function PageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn('text-2xl font-semibold text-[color:var(--color-text)]', className)} {...props} />
}

export function PageDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('max-w-2xl text-sm text-[color:var(--color-text-muted)]', className)} {...props} />
}
