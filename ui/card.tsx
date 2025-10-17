import * as React from 'react'
import { cn } from '@/lib/utils'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a] shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 px-5 py-4', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h3 className={cn('text-base font-semibold text-slate-900 dark:text-slate-100', className)} {...props} />
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn('text-sm text-slate-600 dark:text-slate-400', className)} {...props} />
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 px-5 py-3', className)}
      {...props}
    />
  )
}
