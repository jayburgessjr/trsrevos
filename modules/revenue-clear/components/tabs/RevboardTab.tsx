'use client'

import { useMemo } from 'react'

import { Input } from '@/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { BlueprintIntervention, RevboardMetric, StageStatus } from '../../lib/types'

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Live',
  running: 'Syncing…',
  error: 'Needs attention',
}

const KPI_ORDER = ['MRR', 'Churn', 'ARPU', 'CAC']

type RevboardTabProps = {
  metrics: RevboardMetric[]
  status: StageStatus
  trsScore: number
  interventions: BlueprintIntervention[]
  onChange: (metrics: RevboardMetric[]) => void
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export default function RevboardTab({ metrics, status, trsScore, interventions, onChange }: RevboardTabProps) {
  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const metricCards = useMemo(() => {
    return KPI_ORDER.map((name) => {
      const metric = metrics.find((item) => item.kpiName.toLowerCase() === name.toLowerCase())
      return {
        name,
        baseline: metric?.baselineValue ?? 0,
        current: metric?.currentValue ?? 0,
        delta: metric?.delta ?? (metric ? metric.currentValue - metric.baselineValue : 0),
      }
    })
  }, [metrics])

  const timelineData = useMemo(() => {
    const grouped = new Map<string, { date: string; baseline: number; current: number; count: number }>()
    metrics.forEach((metric) => {
      const key = new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const entry = grouped.get(key) ?? { date: key, baseline: 0, current: 0, count: 0 }
      entry.baseline += metric.baselineValue
      entry.current += metric.currentValue
      entry.count += 1
      grouped.set(key, entry)
    })
    return Array.from(grouped.values()).map((entry) => ({
      date: entry.date,
      baseline: entry.count ? Number((entry.baseline / entry.count).toFixed(1)) : 0,
      current: entry.count ? Number((entry.current / entry.count).toFixed(1)) : 0,
    }))
  }, [metrics])

  const barData = useMemo(
    () =>
      metrics.map((metric) => ({
        name: metric.kpiName,
        baseline: metric.baselineValue,
        current: metric.currentValue,
      })),
    [metrics],
  )

  const handleMetricChange = (id: string | undefined, key: keyof RevboardMetric, value: number | string) => {
    const next = metrics.map((metric) => {
      if (metric.id !== id) return metric
      const updated: RevboardMetric = {
        ...metric,
        [key]: typeof value === 'number' ? value : value,
      }
      if (key === 'baselineValue' || key === 'currentValue') {
        updated.delta = Number((updated.currentValue - updated.baselineValue).toFixed(2))
      }
      return updated
    })
    onChange(next)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">RevBoard Metrics</h3>
          <p className="text-sm text-white/60">
            Track KPI performance against baseline and surface the TRS Score across the operating rhythm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-white/60">TRS Score</p>
            <p className="text-2xl font-semibold text-white">{trsScore}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{statusLabel}</span>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {metricCards.map((metric) => (
          <div key={metric.name} className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">{metric.name}</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(metric.current)}</p>
            <p className="text-xs text-white/50">
              Baseline {formatCurrency(metric.baseline)} • Δ {metric.delta >= 0 ? '+' : ''}
              {metric.delta.toFixed(2)}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Momentum vs Baseline</h4>
          <div className="h-60 w-full">
            <ResponsiveContainer>
              <LineChart data={timelineData} margin={{ left: -10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#A3A7C9" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A3A7C9" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} dot={false} name="Baseline" />
                <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={3} dot name="Current" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">Baseline vs Current by KPI</h4>
          <div className="h-60 w-full">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ left: -10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#A3A7C9" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A3A7C9" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" radius={[6, 6, 0, 0]} />
                <Bar dataKey="current" fill="#22d3ee" name="Current" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-white/10 text-left text-xs uppercase tracking-wide text-white/60">
              <TableHead className="text-white/70">KPI</TableHead>
              <TableHead className="text-white/70">Baseline</TableHead>
              <TableHead className="text-white/70">Current</TableHead>
              <TableHead className="text-white/70">Delta</TableHead>
              <TableHead className="text-white/70">Intervention</TableHead>
              <TableHead className="text-white/70">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.id ?? `${metric.kpiName}-${metric.date}`}> 
                <TableCell>
                  <Input
                    value={metric.kpiName}
                    onChange={(event) => handleMetricChange(metric.id, 'kpiName', event.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={metric.baselineValue ?? 0}
                    onChange={(event) => handleMetricChange(metric.id, 'baselineValue', Number(event.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={metric.currentValue ?? 0}
                    onChange={(event) => handleMetricChange(metric.id, 'currentValue', Number(event.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={Number(metric.delta ?? metric.currentValue - metric.baselineValue).toFixed(2)}
                    onChange={(event) => handleMetricChange(metric.id, 'delta', Number(event.target.value))}
                  />
                </TableCell>
                <TableCell>{interventions.find((item) => item.id === metric.interventionId)?.interventionName ?? '—'}</TableCell>
                <TableCell>
                  <Input
                    value={metric.date?.slice(0, 10)}
                    type="date"
                    onChange={(event) => handleMetricChange(metric.id, 'date', event.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
