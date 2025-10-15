'use client'

import { useMemo } from 'react'

import type { ProjectMilestone, ProjectStats, ClientHealthSnapshot } from '@/core/projects/types'
import type { ProjectRecord } from '@/core/projects/queries'

const CARD_CLASS = 'rounded-xl border border-gray-200 bg-white p-4'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

type HealthDashboardProps = {
  projects: ProjectRecord[]
  milestones: ProjectMilestone[]
  healthHistory: ClientHealthSnapshot[]
  stats: ProjectStats
}

type BurndownEntry = {
  id: string
  project: string
  targetRemaining: number
  actualRemaining: number
  daysElapsed: number
  totalDays: number
}

function computeBurndown(projects: ProjectRecord[]): BurndownEntry[] {
  const today = new Date()

  return projects.map((project) => {
    const start = project.start_date ? new Date(project.start_date) : today
    const end = project.end_date ? new Date(project.end_date) : today
    const totalMs = Math.max(end.getTime() - start.getTime(), 1)
    const elapsedMs = clamp(today.getTime() - start.getTime(), 0, totalMs)
    const targetProgress = (elapsedMs / totalMs) * 100
    const actualProgress = typeof project.progress === 'number' ? project.progress : 0

    return {
      id: project.id,
      project: project.name,
      targetRemaining: clamp(100 - targetProgress, 0, 100),
      actualRemaining: clamp(100 - actualProgress, 0, 100),
      daysElapsed: Math.round(elapsedMs / (1000 * 60 * 60 * 24)),
      totalDays: Math.round(totalMs / (1000 * 60 * 60 * 24)),
    }
  })
}

function computeResourceAllocations(projects: ProjectRecord[]) {
  return projects
    .map((project) => {
      const budget = typeof project.budget === 'number' ? project.budget : 0
      const spent = typeof project.spent === 'number' ? project.spent : 0
      const utilization = budget > 0 ? Math.round((spent / budget) * 100) : 0
      return {
        id: project.id,
        project: project.name,
        budget,
        spent,
        utilization,
      }
    })
    .filter((entry) => entry.budget > 0 || entry.spent > 0)
}

function computeMilestoneRisk(milestones: ProjectMilestone[]) {
  const now = new Date()
  return milestones
    .map((milestone) => {
      const due = milestone.dueDate ? new Date(milestone.dueDate) : null
      const daysUntil = due ? Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
      const confidence = milestone.confidence ?? 0

      let level: 'On Track' | 'Watch' | 'Escalate' = 'On Track'
      if (confidence < 60 || (daysUntil !== null && daysUntil < 0)) {
        level = 'Escalate'
      } else if ((daysUntil !== null && daysUntil <= 7) || confidence < 75) {
        level = 'Watch'
      }

      return {
        id: milestone.id,
        project: milestone.projectName,
        title: milestone.title,
        dueDate: milestone.dueDate ?? 'Unscheduled',
        confidence,
        level,
        daysUntil,
      }
    })
    .slice(0, 6)
}

function groupHealthHistory(history: ClientHealthSnapshot[]) {
  const byClient = new Map<string, ClientHealthSnapshot[]>()
  history.forEach((snapshot) => {
    const list = byClient.get(snapshot.clientId) ?? []
    list.push(snapshot)
    byClient.set(snapshot.clientId, list)
  })
  return Array.from(byClient.entries()).map(([clientId, entries]) => {
    const sorted = entries.sort((a, b) => (a.snapshotDate > b.snapshotDate ? 1 : -1))
    return { clientId, clientName: sorted[0]?.clientName ?? clientId, entries: sorted }
  })
}

function Sparkline({ points }: { points: { x: number; y: number }[] }) {
  if (points.length <= 1) {
    return <div className="h-12 w-full" />
  }
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const range = Math.max(maxY - minY, 1)
  const width = 120
  const height = 48
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - ((point.y - minY) / range) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-full" role="img">
      <path d={path} stroke="#111827" strokeWidth={2} fill="none" />
    </svg>
  )
}

export function HealthDashboard({ projects, milestones, healthHistory, stats }: HealthDashboardProps) {
  const burndown = useMemo(() => computeBurndown(projects), [projects])
  const allocations = useMemo(() => computeResourceAllocations(projects), [projects])
  const milestoneRisks = useMemo(() => computeMilestoneRisk(milestones), [milestones])
  const healthGroups = useMemo(() => groupHealthHistory(healthHistory), [healthHistory])

  return (
    <div className="grid gap-4">
      <section className={CARD_CLASS}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-black">Portfolio burndown</h3>
          <span className="text-xs text-gray-500">
            Budget utilization {stats.budgetUtilization}% • Active projects {stats.active}
          </span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {burndown.map((entry) => {
            const onTrack = entry.actualRemaining <= entry.targetRemaining
            return (
              <div key={entry.id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-black">
                  <span>{entry.project}</span>
                  <span className={onTrack ? 'text-emerald-600' : 'text-amber-600'}>
                    {entry.actualRemaining.toFixed(0)} pts remaining
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-20">Target</span>
                    <div className="h-2 flex-1 rounded bg-gray-100">
                      <div
                        className="h-2 rounded bg-gray-400"
                        style={{ width: `${100 - entry.targetRemaining}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20">Actual</span>
                    <div className="h-2 flex-1 rounded bg-gray-100">
                      <div
                        className={`h-2 rounded ${onTrack ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${100 - entry.actualRemaining}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {entry.daysElapsed} of {entry.totalDays || 1} days elapsed
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className={CARD_CLASS}>
        <h3 className="text-sm font-semibold text-black">Resource allocation</h3>
        <p className="mt-1 text-xs text-gray-500">
          Track budgets and utilization to keep delivery teams aligned to plan.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Budget</th>
                <th className="py-2 pr-4">Spent</th>
                <th className="py-2 pr-4">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No budget data recorded. Add budgets to projects to unlock allocation insights.
                  </td>
                </tr>
              ) : (
                allocations.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-2 pr-4 font-medium text-black">{entry.project}</td>
                    <td className="py-2 pr-4">${entry.budget.toLocaleString()}</td>
                    <td className="py-2 pr-4">${entry.spent.toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full rounded bg-gray-100">
                          <div
                            className="h-2 rounded bg-gray-900"
                            style={{ width: `${clamp(entry.utilization, 0, 130)}%` }}
                          />
                        </div>
                        <span>{entry.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={CARD_CLASS}>
        <h3 className="text-sm font-semibold text-black">Milestone risk indicators</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {milestoneRisks.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500">
              No milestones logged. Capture project milestones to monitor delivery risk.
            </div>
          ) : (
            milestoneRisks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-gray-100 p-3 text-xs text-gray-600">
                <div className="flex items-center justify-between text-sm font-medium text-black">
                  <span>{risk.title}</span>
                  <span
                    className={
                      risk.level === 'Escalate'
                        ? 'text-red-600'
                        : risk.level === 'Watch'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }
                  >
                    {risk.level}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{risk.project}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Due {risk.dueDate}{' '}
                  {typeof risk.daysUntil === 'number' ? `(${risk.daysUntil} days)` : ''}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">Confidence {risk.confidence ?? 0}%</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={CARD_CLASS}>
        <h3 className="text-sm font-semibold text-black">Client health timeline</h3>
        <p className="mt-1 text-xs text-gray-500">
          Trend TRS score, health, and sentiment to spot delivery impact on retention.
        </p>
        <div className="mt-3 space-y-4">
          {healthGroups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500">
              No health snapshots yet. Sync client health history from Supabase to enable timelines.
            </div>
          ) : (
            healthGroups.map((group) => {
              const sparkPoints = group.entries.map((entry, index) => ({
                x: index,
                y: entry.trsScore ?? entry.health ?? 0,
              }))
              return (
                <div key={group.clientId} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-medium text-black">{group.clientName}</div>
                      <div className="text-[11px] text-gray-500">
                        Latest sentiment {group.entries.at(-1)?.sentiment ?? 'Neutral'} • TRS score{' '}
                        {group.entries.at(-1)?.trsScore ?? 'n/a'}
                      </div>
                    </div>
                    <div className="md:w-40">
                      <Sparkline points={sparkPoints} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-[11px] text-gray-600 md:grid-cols-2 xl:grid-cols-3">
                    {group.entries.map((entry) => (
                      <div
                        key={`${group.clientId}-${entry.snapshotDate}`}
                        className="rounded border border-gray-100 p-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-black">{entry.snapshotDate}</span>
                          <span
                            className={
                              entry.sentiment === 'Positive'
                                ? 'text-emerald-600'
                                : entry.sentiment === 'Caution'
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }
                          >
                            {entry.sentiment}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span>TRS {entry.trsScore ?? '—'}</span>
                          <span>Health {entry.health ?? '—'}</span>
                        </div>
                        {entry.notes ? <p className="mt-1 text-[10px] text-gray-500">{entry.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
