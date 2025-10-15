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
          <h3 className="text-xl font-semibold">Results & ROI</h3>
          <p className="text-sm text-white/60">Finalize the impact narrative with before/after analytics and ROI calculations.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-white/60">ROI Lift</p>
            <p className="text-lg font-semibold text-white">{roiPercent}%</p>
            <p className="text-xs text-white/50">Payback {value.paybackPeriod} months</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{statusLabel}</span>
          <Button onClick={onGenerateReport} disabled={status === 'running'}>
            Generate Report
          </Button>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#A3A7C9" tick={{ fontSize: 12 }} />
              <YAxis stroke="#A3A7C9" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="before" name="Before" fill="#94a3b8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="after" name="After" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-white/10 text-left text-xs uppercase tracking-wide text-white/60">
              <TableHead className="text-white/70">Metric</TableHead>
              <TableHead className="text-white/70">Before</TableHead>
              <TableHead className="text-white/70">After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Monthly Recurring Revenue</TableCell>
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
            <TableRow>
              <TableCell>Monthly Profit</TableCell>
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
            <TableRow>
              <TableCell>Total Gain</TableCell>
              <TableCell colSpan={2}>
                <Input
                  type="number"
                  value={value.totalGain ?? value.afterMRR - value.beforeMRR}
                  onChange={(event) => handleChange('totalGain', Number(event.target.value))}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Payback Period (months)</TableCell>
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
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
          Report ready: <a href={value.reportUrl} className="underline" target="_blank" rel="noreferrer">Download ROI Report</a>
        </div>
      ) : null}
    </div>
  )
}
