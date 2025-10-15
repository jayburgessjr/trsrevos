'use client'

import { cn } from '@/lib/utils'

import { RevenueClearStageKey, StageStatus } from '../lib/types'

const STATUS_COLORS: Record<StageStatus, string> = {
  idle: 'bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)] border-[color:var(--color-outline)]',
  saving: 'bg-amber-500/20 text-amber-200 border-amber-400/60',
  saved: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60',
  running: 'bg-sky-500/20 text-sky-200 border-sky-400/60',
  error: 'bg-rose-500/20 text-rose-200 border-rose-400/60',
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
    <nav className="sticky top-0 z-10 -mx-6 mb-6 flex flex-col gap-3 border-b border-[color:var(--color-outline)] bg-[color:var(--color-surface)]/90 px-6 py-4 backdrop-blur">
      <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
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
                'flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition',
                STATUS_COLORS[item.status],
                isActive ? 'ring-2 ring-[color:var(--color-accent)] ring-offset-2 ring-offset-[color:var(--color-surface)]' : '',
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{item.label}</span>
              <span className="line-clamp-2 text-[11px] text-white/80">{item.description}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
