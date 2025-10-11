"use client"

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CardProps = {
  title?: string
  subtitle?: string
  action?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  children: ReactNode
}

/**
 * Card is the base surface for all analytic panels and list blocks. It stays grayscale
 * and fluid so individual pages can opt into their own padding via `contentClassName`
 * without being forced into fixed dimensions.
 */
export function Card({
  title,
  subtitle,
  action,
  className,
  headerClassName,
  contentClassName,
  children,
}: CardProps) {
  const shouldWrapContent = Boolean(contentClassName)

  return (
    <section className={cn('overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>
      {(title || action || subtitle) && (
        <div
          className={cn(
            'flex min-h-[44px] items-center justify-between gap-3 border-b border-gray-200 px-4',
            headerClassName
          )}
        >
          <div className="flex flex-1 flex-col">
            {title ? <div className="text-sm font-medium text-black">{title}</div> : null}
            {subtitle ? <div className="text-[11px] text-gray-500">{subtitle}</div> : null}
          </div>
          {action}
        </div>
      )}
      {shouldWrapContent ? <div className={contentClassName}>{children}</div> : children}
    </section>
  )
}
