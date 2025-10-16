'use client'

import { useMemo } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'

import { AuditLeak, StageStatus } from '../../lib/types'

const PILLARS: { key: AuditLeak['pillar']; label: string; description: string }[] = [
  {
    key: 'pricing',
    label: 'Pricing',
    description: 'Packaging, monetization, and yield discipline.',
  },
  {
    key: 'demand',
    label: 'Demand',
    description: 'Pipeline velocity and conversion through the funnel.',
  },
  {
    key: 'retention',
    label: 'Retention',
    description: 'Churn, expansion, and customer success execution.',
  },
  {
    key: 'forecasting',
    label: 'Forecasting',
    description: 'RevOps accuracy, cadence, and forward visibility.',
  },
]

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Scanning…',
  error: 'Needs attention',
}

type AuditTabProps = {
  audits: AuditLeak[]
  trsScore: number
  status: StageStatus
  onChange: (value: AuditLeak[]) => void
  onRunLeakScan: () => Promise<void>
}

function FieldLabel({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-[color:var(--color-text)]">{label}</span>
      <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">{description}</span>
    </div>
  )
}

export default function AuditTab({ audits, trsScore, status, onChange, onRunLeakScan }: AuditTabProps) {
  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const aggregateLoss = useMemo(
    () =>
      audits.reduce((total, audit) => {
        return total + Number(audit.estimatedLoss ?? 0)
      }, 0),
    [audits],
  )

  const handleSeverityChange = (pillar: AuditLeak['pillar'], nextSeverity: number) => {
    const next = audits.map((audit) =>
      audit.pillar === pillar
        ? {
            ...audit,
            leakSeverity: nextSeverity,
            score: Math.max(0, 100 - nextSeverity * 10),
          }
        : audit,
    )
    onChange(next)
  }

  const handleDescriptionChange = (pillar: AuditLeak['pillar'], value: string) => {
    const next = audits.map((audit) =>
      audit.pillar === pillar
        ? {
            ...audit,
            leakDescription: value,
          }
        : audit,
    )
    onChange(next)
  }

  const handleLossChange = (pillar: AuditLeak['pillar'], value: number) => {
    const next = audits.map((audit) =>
      audit.pillar === pillar
        ? {
            ...audit,
            estimatedLoss: value,
          }
        : audit,
    )
    onChange(next)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--color-text)]">Revenue Leak Audit</h3>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Map the severity of leaks by growth pillar. Use the leak scan automation to produce a leak map for executive review.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">TRS Score</div>
            <div className="text-2xl font-semibold text-[color:var(--color-text)]">{trsScore}</div>
          </div>
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-center">
            <div className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">Total Est. Loss</div>
            <div className="text-lg font-semibold text-[color:var(--color-text)]">
              ${aggregateLoss.toLocaleString()}
            </div>
          </div>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs text-[color:var(--color-text-muted)]">
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map((pillar) => {
          const audit = audits.find((item) => item.pillar === pillar.key) ?? {
            pillar: pillar.key,
            leakSeverity: 0,
            leakDescription: '',
            estimatedLoss: 0,
            score: 0,
          }

          return (
            <div key={pillar.key} className="space-y-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
              <FieldLabel label={pillar.label} description={pillar.description} />
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <span>Leak Severity ({audit.leakSeverity}/10)</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={audit.leakSeverity}
                  onChange={(event) => handleSeverityChange(pillar.key, Number(event.target.value))}
                  className="accent-[color:var(--color-accent)]"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <span>Leak Description</span>
                <Textarea
                  value={audit.leakDescription}
                  rows={3}
                  onChange={(event) => handleDescriptionChange(pillar.key, event.target.value)}
                  placeholder="Describe the leak dynamics and root cause"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                <span>Estimated Loss ($)</span>
                <Input
                  type="number"
                  value={audit.estimatedLoss ?? 0}
                  onChange={(event) => handleLossChange(pillar.key, Number(event.target.value))}
                />
              </label>
            </div>
          )
        })}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4">
        <div className="text-sm text-[color:var(--color-text-muted)]">
          {status === 'running'
            ? 'RevenueClarityAI is generating the leak map…'
            : 'Trigger RevenueClarityAI to produce leak map JSON and executive summary.'}
        </div>
        <Button onClick={onRunLeakScan} disabled={status === 'running'}>
          Run Leak Scan
        </Button>
      </footer>
    </div>
  )
}
