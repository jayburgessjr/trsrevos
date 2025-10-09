import * as React from 'react'
import { cn } from '@/lib/utils'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-[color:var(--color-outline)] px-5 py-4', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn('text-base font-semibold text-[color:var(--color-text)]', className)} {...props} />
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn('text-sm text-[color:var(--color-text-muted)]', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-[color:var(--color-outline)] px-5 py-3', className)}
      {...props}
    />
  )
}
