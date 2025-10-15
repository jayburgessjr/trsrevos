'use client'

import { useMemo } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Textarea } from '@/ui/textarea'

import { NextStepPlan, StageStatus } from '../../lib/types'

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Sending proposal…',
  error: 'Needs attention',
}

const OFFER_OPTIONS: Array<{ value: NextStepPlan['nextOffer']; label: string; template: string }> = [
  {
    value: 'Advisory',
    label: 'Advisory Retainer',
    template:
      'Advisory Retainer — Weekly exec standups, RevBoard stewardship, and live diagnostics. Includes TRS growth lab support and quarterly board-readouts.',
  },
  {
    value: 'ProfitOS',
    label: 'ProfitOS Deployment',
    template:
      'ProfitOS Implementation — Deploy the ProfitOS stack across RevOps, finance, and GTM with embedded enablement and 90-day activation sprint.',
  },
  {
    value: 'Equity',
    label: 'Equity Partnership',
    template:
      'Equity Partnership — Structured revenue lab with capital infusion, operational oversight, and shared upside on defined growth milestones.',
  },
  {
    value: 'Other',
    label: 'Custom Engagement',
    template: 'Custom engagement — Detail the bespoke delivery model, pricing, and success criteria.',
  },
]

type NextStepsTabProps = {
  value: NextStepPlan
  status: StageStatus
  onChange: (value: NextStepPlan) => void
  onSendProposal: () => Promise<void>
}

export default function NextStepsTab({ value, status, onChange, onSendProposal }: NextStepsTabProps) {
  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const handleOfferChange = (offer: NextStepPlan['nextOffer']) => {
    const template = OFFER_OPTIONS.find((option) => option.value === offer)?.template ?? value.proposalDoc
    onChange({
      ...value,
      nextOffer: offer,
      proposalDoc: template,
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Next Steps & Proposal</h3>
          <p className="text-sm text-white/60">
            Package the right engagement, align on rationale, and send proposal artifacts with one click.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-white/60">Projected Outcome</p>
            <p className="text-lg font-semibold text-white">${value.projectedOutcome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{statusLabel}</span>
          <Button onClick={onSendProposal} disabled={status === 'running'}>
            Send Proposal
          </Button>
        </div>
      </header>

      <section className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/60">
          <span>Recommended Offer</span>
          <Select value={value.nextOffer} onChange={(event) => handleOfferChange(event.target.value as NextStepPlan['nextOffer'])}>
            {OFFER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/60">
          <span>Rationale</span>
          <Textarea
            rows={4}
            value={value.rationale}
            onChange={(event) => onChange({ ...value, rationale: event.target.value })}
            placeholder="Why this path? Decision criteria, success plan, economics"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/60">
          <span>Projected Outcome ($)</span>
          <Input
            type="number"
            value={value.projectedOutcome ?? 0}
            onChange={(event) => onChange({ ...value, projectedOutcome: Number(event.target.value) })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-white/60">
          <span>Proposal Outline</span>
          <Textarea
            rows={6}
            value={value.proposalDoc}
            onChange={(event) => onChange({ ...value, proposalDoc: event.target.value })}
          />
        </label>
      </section>

      {value.proposalUrl ? (
        <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-5 py-4 text-sm text-sky-200">
          Proposal ready: <a href={value.proposalUrl} target="_blank" rel="noreferrer" className="underline">Download</a>
        </div>
      ) : null}
    </div>
  )
}
