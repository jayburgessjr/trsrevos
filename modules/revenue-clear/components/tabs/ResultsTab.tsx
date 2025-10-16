'use client'

import { useMemo } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { RevenueClearResult, StageStatus } from '../../lib/types'

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Generating report…',
  error: 'Needs attention',
}

type ResultsTabProps = {
  value: RevenueClearResult
  status: StageStatus
  onChange: (value: RevenueClearResult) => void
  onGenerateReport: () => Promise<void>
}

export default function ResultsTab({ value, status, onChange, onGenerateReport }: ResultsTabProps) {
  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const roiPercent = useMemo(() => {
    if (!value.beforeProfit) return 0
    return Number((((value.afterProfit - value.beforeProfit) / value.beforeProfit) * 100).toFixed(1))
  }, [value.afterProfit, value.beforeProfit])

  const chartData = useMemo(
    () => [
      {
        name: 'MRR',
        before: value.beforeMRR,
        after: value.afterMRR,
      },
      {
        name: 'Profit',
        before: value.beforeProfit,
        after: value.afterProfit,
      },
    ],
    [value.afterMRR, value.afterProfit, value.beforeMRR, value.beforeProfit],
  )

  const handleChange = <Key extends keyof RevenueClearResult>(key: Key, data: RevenueClearResult[Key]) => {
    onChange({
      ...value,
      [key]: data,
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--color-text)]">Results & ROI</h3>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Finalize the impact narrative with before/after analytics and ROI calculations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">ROI Lift</p>
            <p className="text-lg font-semibold text-[color:var(--color-text)]">{roiPercent}%</p>
            <p className="text-xs text-[color:var(--color-text-muted)]">Payback {value.paybackPeriod} months</p>
          </div>
          <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1 text-xs text-[color:var(--color-text-muted)]">
            {statusLabel}
          </span>
          <Button onClick={onGenerateReport} disabled={status === 'running'}>
            Generate Report
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid rgba(148,163,184,0.4)', borderRadius: 12 }}
                labelStyle={{ color: '#0f172a' }}
              />
              <Legend />
              <Bar dataKey="before" name="Before" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="after" name="After" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[color:var(--color-border)] bg-white text-left text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
              <TableHead className="text-[color:var(--color-text)]">Metric</TableHead>
              <TableHead className="text-[color:var(--color-text)]">Before</TableHead>
              <TableHead className="text-[color:var(--color-text)]">After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-b border-[color:var(--color-border)] last:border-b-0">
              <TableCell className="text-[color:var(--color-text-muted)]">Monthly Recurring Revenue</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={value.beforeMRR ?? 0}
                  onChange={(event) => handleChange('beforeMRR', Number(event.target.value))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={value.afterMRR ?? 0}
                  onChange={(event) => handleChange('afterMRR', Number(event.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow className="border-b border-[color:var(--color-border)] last:border-b-0">
              <TableCell className="text-[color:var(--color-text-muted)]">Monthly Profit</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={value.beforeProfit ?? 0}
                  onChange={(event) => handleChange('beforeProfit', Number(event.target.value))}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={value.afterProfit ?? 0}
                  onChange={(event) => handleChange('afterProfit', Number(event.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow className="border-b border-[color:var(--color-border)] last:border-b-0">
              <TableCell className="text-[color:var(--color-text-muted)]">Total Gain</TableCell>
              <TableCell colSpan={2}>
                <Input
                  type="number"
                  value={value.totalGain ?? value.afterMRR - value.beforeMRR}
                  onChange={(event) => handleChange('totalGain', Number(event.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-[color:var(--color-text-muted)]">Payback Period (months)</TableCell>
              <TableCell colSpan={2}>
                <Input
                  type="number"
                  value={value.paybackPeriod ?? 0}
                  onChange={(event) => handleChange('paybackPeriod', Number(event.target.value))}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {value.reportUrl ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          Report ready:{' '}
          <a href={value.reportUrl} className="font-medium underline" target="_blank" rel="noreferrer">
            Download ROI Report
          </a>
        </div>
      ) : null}
    </div>
  )
}
