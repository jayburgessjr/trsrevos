'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'

import { BlueprintIntervention, StageStatus } from '../../lib/types'

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Generating…',
  error: 'Needs attention',
}

type BlueprintTabProps = {
  interventions: BlueprintIntervention[]
  status: StageStatus
  baselineRevenue: number
  onChange: (value: BlueprintIntervention[]) => void
  onGenerate: () => Promise<void>
}

export default function BlueprintTab({ interventions, status, baselineRevenue, onChange, onGenerate }: BlueprintTabProps) {
  const [simulatedLift, setSimulatedLift] = useState(12)

  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const projectedRevenue = useMemo(() => {
    const liftMultiplier = 1 + simulatedLift / 100
    return baselineRevenue > 0 ? baselineRevenue * liftMultiplier : 0
  }, [baselineRevenue, simulatedLift])

  const handleInterventionChange = <Key extends keyof BlueprintIntervention>(
    index: number,
    key: Key,
    value: BlueprintIntervention[Key],
  ) => {
    const next = interventions.map((intervention, idx) => (idx === index ? { ...intervention, [key]: value } : intervention))
    onChange(next)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--color-text)]">Blueprint & ROI Model</h3>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Prioritize interventions and pressure test uplift. BlueprintAI returns the top levers and attaches the playbook PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">Projected MRR</p>
            <p className="text-lg font-semibold text-[color:var(--color-text)]">
              ${projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Lift {simulatedLift}% on ${baselineRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs text-[color:var(--color-text-muted)]">
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="grid gap-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
          <span>ROI Simulator — Expected Lift (%)</span>
          <input
            type="range"
            min={0}
            max={50}
            step={1}
            value={simulatedLift}
            onChange={(event) => setSimulatedLift(Number(event.target.value))}
            className="accent-[color:var(--color-accent)]"
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[color:var(--color-border)] bg-white text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
              <TableHead className="text-[color:var(--color-text)]">Intervention</TableHead>
              <TableHead className="text-[color:var(--color-text)]">Diagnosis</TableHead>
              <TableHead className="text-[color:var(--color-text)]">Prescribed Fix</TableHead>
              <TableHead className="text-[color:var(--color-text)]">Lift %</TableHead>
              <TableHead className="text-[color:var(--color-text)]">Effort</TableHead>
              <TableHead className="text-[color:var(--color-text)]">ROI Index</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interventions.map((intervention, index) => (
              <TableRow key={index} className="border-b border-[color:var(--color-border)]">
                <TableCell className="align-top">
                  <Input
                    value={intervention.interventionName}
                    placeholder={`Intervention ${index + 1}`}
                    onChange={(event) => handleInterventionChange(index, 'interventionName', event.target.value)}
                  />
                  {intervention.blueprintUrl ? (
                    <a
                      href={intervention.blueprintUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-xs text-[color:var(--color-accent)] underline"
                    >
                      Download Blueprint
                    </a>
                  ) : null}
                </TableCell>
                <TableCell className="align-top">
                  <Textarea
                    value={intervention.diagnosis}
                    rows={3}
                    onChange={(event) => handleInterventionChange(index, 'diagnosis', event.target.value)}
                    placeholder="What is broken?"
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Textarea
                    value={intervention.fix}
                    rows={3}
                    onChange={(event) => handleInterventionChange(index, 'fix', event.target.value)}
                    placeholder="How will we fix it?"
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Input
                    type="number"
                    value={intervention.projectedLift ?? 0}
                    onChange={(event) => handleInterventionChange(index, 'projectedLift', Number(event.target.value))}
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Input
                    type="number"
                    value={intervention.effortScore ?? 0}
                    onChange={(event) => handleInterventionChange(index, 'effortScore', Number(event.target.value))}
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Input
                    type="number"
                    value={intervention.roiIndex ?? 0}
                    onChange={(event) => handleInterventionChange(index, 'roiIndex', Number(event.target.value))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4">
        <div className="text-sm text-[color:var(--color-text-muted)]">
          {status === 'running'
            ? 'BlueprintAI is composing the intervention plan…'
            : 'Generate BlueprintAI recommendations to refresh interventions and ROI files.'}
        </div>
        <Button onClick={onGenerate} disabled={status === 'running'}>
          Generate Blueprint
        </Button>
      </footer>
    </div>
  )
}
