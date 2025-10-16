'use client'

import { cn } from '@/lib/utils'

import { RevenueClearStageKey, StageStatus } from '../lib/types'

const STATUS_COLORS: Record<StageStatus, string> = {
  idle: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border-[color:var(--color-border)]',
  saving: 'border-amber-200 bg-amber-50 text-amber-700',
  saved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  running: 'border-sky-200 bg-sky-50 text-sky-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

type StepperItem = {
  key: RevenueClearStageKey
  label: string
  description: string
  status: StageStatus
}

type ProgressStepperProps = {
  items: StepperItem[]
  active: RevenueClearStageKey
  onSelect?: (key: RevenueClearStageKey) => void
}

export function ProgressStepper({ items, active, onSelect }: ProgressStepperProps) {
  return (
    <nav className="flex flex-col gap-3 rounded-lg border border-[color:var(--color-border)] bg-white p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
        Revenue Clear Workflow
      </h2>
      <div className="grid gap-3 md:grid-cols-7">
        {items.map((item) => {
          const isActive = item.key === active
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect?.(item.key)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition',
                STATUS_COLORS[item.status],
                isActive
                  ? 'ring-2 ring-[color:var(--color-accent)] ring-offset-2 ring-offset-white'
                  : 'hover:border-[color:var(--color-accent)]/40 hover:bg-[color:var(--color-surface-muted)]',
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text)]">
                {item.label}
              </span>
              <span className="line-clamp-2 text-[11px] text-[color:var(--color-text-muted)]">
                {item.description}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
