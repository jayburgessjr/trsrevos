import * as React from 'react'

import { cn } from '@/lib/utils'

type PageContainerProps = {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto flex h-full w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

type PageBodyProps = {
  children: React.ReactNode
  className?: string
}

export function PageBody({ children, className }: PageBodyProps) {
  return <div className={cn('flex flex-1 flex-col gap-6', className)}>{children}</div>
}

type PageHeaderProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-6 border-b border-neutral-200 pb-6', className)}>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-400">ReggieAI</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="text-base text-neutral-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}

