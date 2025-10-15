'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { StatCard } from '@/components/kit/StatCard'
import type { TelemetrySnapshot } from '@/core/analytics/telemetry'
import { cn } from '@/lib/utils'

const LOOKBACK_OPTIONS = [7, 30, 90]

type TelemetryDashboardClientProps = {
  snapshot: TelemetrySnapshot
}

export default function TelemetryDashboardClient({ snapshot }: TelemetryDashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const maxTimeline = useMemo(() => {
    return snapshot.timeline.reduce((max, point) => Math.max(max, point.count), 0)
  }, [snapshot.timeline])

  const handleLookbackChange = (value: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lookback', String(value))
    router.replace(`/dashboard/telemetry?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Operational Telemetry</h1>
          <p className="mt-1 text-sm text-gray-600">
            Unified adoption, performance, and compliance signals across sales, delivery, and finance workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {LOOKBACK_OPTIONS.map((option) => {
            const active = snapshot.lookbackDays === option
            return (
              <button
                key={option}
                onClick={() => handleLookbackChange(option)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  active
                    ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                )}
              >
                Last {option}d
              </button>
            )
          })}
        </div>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Adoption</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active users"
            value={snapshot.adoption.activeUsers.toString()}
            delta={`${snapshot.adoption.agentRuns} agent runs recorded`}
            trend={snapshot.adoption.agentRuns > 0 ? 'up' : 'flat'}
          />
          <StatCard
            label="Automation executions"
            value={snapshot.adoption.automationExecutions.toString()}
            delta={`${snapshot.adoption.activePlaybooks} active playbooks`}
            trend={snapshot.adoption.automationExecutions > 0 ? 'up' : 'flat'}
          />
          <StatCard
            label="Total events"
            value={snapshot.adoption.totalEvents.toString()}
            delta={`${snapshot.lookbackDays}-day window`}
            trend={snapshot.adoption.totalEvents > 20 ? 'up' : 'flat'}
          />
          <StatCard
            label="Throughput"
            value={`${snapshot.performance.automationThroughput}`}
            delta={`Automation signals emitted`}
            trend={snapshot.performance.automationThroughput > snapshot.adoption.agentRuns ? 'up' : 'flat'}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Event timeline</h3>
              <p className="text-xs text-gray-500">Daily signal volume across the selected window.</p>
            </div>
            <span className="text-xs text-gray-500">Max {maxTimeline}</span>
          </div>
          <div className="mt-4 flex h-40 items-end gap-2">
            {snapshot.timeline.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                No telemetry events in this window.
              </div>
            ) : (
              snapshot.timeline.map((point) => {
                const height = maxTimeline ? Math.max(4, Math.round((point.count / maxTimeline) * 100)) : 4
                return (
                  <div key={point.date} className="flex-1">
                    <div
                      className="mx-auto w-full rounded-t-md bg-gray-900"
                      style={{ height: `${height}%`, minHeight: '0.75rem' }}
                      title={`${point.count} events on ${point.date}`}
                    />
                    <div className="mt-2 text-center text-[10px] text-gray-500">{point.date.slice(5)}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900">Top workflows</h3>
          <p className="text-xs text-gray-500">Most active automations and reviews.</p>
          <ul className="mt-3 space-y-2">
            {snapshot.topWorkflows.length === 0 ? (
              <li className="rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                No workflow activity recorded.
              </li>
            ) : (
              snapshot.topWorkflows.map((item) => (
                <li key={item.workflow} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.workflow}</div>
                    <div className="text-xs text-gray-500">Workflow signals</div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-base font-semibold text-gray-900">Automation performance</h3>
          <p className="text-xs text-gray-500">Delivery speed and success of cross-workspace automations.</p>
          <dl className="mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <dt>Success rate</dt>
              <dd className="font-medium text-gray-900">{snapshot.performance.automationSuccessRate}%</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Average events / day</dt>
              <dd className="font-medium text-gray-900">{snapshot.performance.avgEventsPerDay}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Automation throughput</dt>
              <dd className="font-medium text-gray-900">{snapshot.performance.automationThroughput}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900">Compliance & guardrails</h3>
          <p className="text-xs text-gray-500">Track guardrail breaches and escalations triggered by agents.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Guardrail breaches</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{snapshot.compliance.guardrailBreaches}</div>
              <div className="text-[11px] text-gray-500">Agent runs requiring escalation</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Flagged runs</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{snapshot.compliance.flaggedRuns}</div>
              <div className="text-[11px] text-gray-500">Runs with policy annotations</div>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">Compliance events</div>
              <div className="mt-1 text-xl font-semibold text-gray-900">{snapshot.compliance.complianceEvents}</div>
              <div className="text-[11px] text-gray-500">Audit + guardrail signals</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
