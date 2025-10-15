'use client'

import { useMemo } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'

import { RevenueClearClient, RevenueClearIntake, StageStatus } from '../../lib/types'

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Running automation…',
  error: 'Needs attention',
}

type IntakeTabProps = {
  client: RevenueClearClient
  value: RevenueClearIntake
  status: StageStatus
  onChange: (value: RevenueClearIntake) => void
  onSummarize: () => Promise<void>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-white/60">
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function IntakeTab({ client, value, status, onChange, onSummarize }: IntakeTabProps) {
  const profile = value.companyProfile
  const financials = value.financials
  const goals = value.goals

  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Intake & Baseline</h3>
          <p className="text-sm text-white/60">
            Capture the client narrative, revenue picture, and growth objectives. Updates autosave into Supabase in real time.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">Stage Status: {statusLabel}</span>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">Company Profile</h4>
          <Field label="Company Name">
            <Input
              value={profile.name}
              onChange={(event) =>
                onChange({
                  ...value,
                  companyProfile: { ...profile, name: event.target.value },
                })
              }
              placeholder="Acme Labs"
            />
          </Field>
          <Field label="Industry">
            <Input
              value={profile.industry}
              onChange={(event) =>
                onChange({
                  ...value,
                  companyProfile: { ...profile, industry: event.target.value },
                })
              }
              placeholder={client.industry ?? 'SaaS, Services, etc.'}
            />
          </Field>
          <Field label="Revenue Model">
            <Input
              value={profile.revenueModel}
              onChange={(event) =>
                onChange({
                  ...value,
                  companyProfile: { ...profile, revenueModel: event.target.value },
                })
              }
              placeholder={client.revenueModel ?? 'Subscription, Hybrid, Usage…'}
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">Financials</h4>
          <Field label="Monthly Revenue ($)">
            <Input
              type="number"
              value={financials.monthlyRevenue ?? 0}
              onChange={(event) =>
                onChange({
                  ...value,
                  financials: { ...financials, monthlyRevenue: Number(event.target.value) },
                })
              }
            />
          </Field>
          <Field label="Profit Margin (%)">
            <Input
              type="number"
              value={financials.profitMargin ?? 0}
              onChange={(event) =>
                onChange({
                  ...value,
                  financials: { ...financials, profitMargin: Number(event.target.value) },
                })
              }
            />
          </Field>
          <Field label="Target Growth (%)">
            <Input
              type="number"
              value={financials.targetGrowth ?? 0}
              onChange={(event) =>
                onChange({
                  ...value,
                  financials: { ...financials, targetGrowth: Number(event.target.value) },
                })
              }
            />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/70">Goals</h4>
          <Field label="Primary Goal">
            <Input
              value={goals.primaryGoal}
              onChange={(event) =>
                onChange({
                  ...value,
                  goals: { ...goals, primaryGoal: event.target.value },
                })
              }
              placeholder={client.primaryGoal ?? 'Scale MRR, Improve profit…'}
            />
          </Field>
          <Field label="Secondary Goal">
            <Input
              value={goals.secondaryGoal ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  goals: { ...goals, secondaryGoal: event.target.value },
                })
              }
              placeholder="Efficiency, hiring, retention…"
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={goals.notes ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  goals: { ...goals, notes: event.target.value },
                })
              }
              placeholder="Context, KPIs, constraints"
              rows={5}
            />
          </Field>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="text-sm text-white/70">
          {value.claritySummaryUrl ? (
            <a
              href={value.claritySummaryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-white underline"
            >
              Download the latest clarity summary
            </a>
          ) : (
            <span>Summaries will appear here after RevenueClarityAI completes its run.</span>
          )}
        </div>
        <Button onClick={onSummarize} disabled={status === 'running'}>
          Save &amp; Continue with RevenueClarityAI
        </Button>
      </footer>
    </div>
  )
}
