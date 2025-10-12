'use client'

import { ClientStrategy } from '@/core/clients/types'
import { StrategyBody } from '@/core/qra/engine'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'

const addDays = (days: number) => {
  const now = new Date()
  now.setUTCDate(now.getUTCDate() + days)
  return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type ArchitectureTabProps = {
  activeStrategy: ClientStrategy | null
}

export default function ArchitectureTab({ activeStrategy }: ArchitectureTabProps) {
  if (!activeStrategy) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[color:var(--color-outline)] px-6 py-12 text-center">
        <h3 className="text-base font-semibold text-[color:var(--color-text)]">No strategy selected yet</h3>
        <p className="max-w-md text-sm text-[color:var(--color-text-muted)]">
          Run the QRA engine, choose a strategy variant, and the execution architecture will render here with owners and due dates.
        </p>
      </div>
    )
  }

  const body = (activeStrategy.body ?? {}) as StrategyBody
  const checklist = body.checklist ?? []
  const plays = body.plays ?? []
  const metrics = body.metrics ?? []

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {body.title}
            <Badge variant="success">Active</Badge>
          </CardTitle>
          <CardDescription>{body.narrative}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold text-[color:var(--color-text)]">Key metrics</h4>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--color-text-muted)]">
              {metrics.map((metric) => (
                <li key={metric.label}>
                  <span className="font-medium text-[color:var(--color-text)]">{metric.label}</span>: {metric.baseline} → {metric.target}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[color:var(--color-text)]">Execution notes</h4>
            <ul className="mt-2 space-y-2 text-sm text-[color:var(--color-text-muted)]">
              {plays.map((play) => (
                <li key={play.id} className="rounded-lg border border-[color:var(--color-outline)] px-3 py-2">
                  <p className="font-medium text-[color:var(--color-text)]">{play.title}</p>
                  <p>{play.description}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">Owner {play.ownerHint} • Target {addDays(play.dueInDays)}</p>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Execution checklist</CardTitle>
          <CardDescription>Track the rollout owners and due dates for the active strategy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-[color:var(--color-outline)] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[color:var(--color-text)]">{item.label}</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Owner {item.ownerHint ?? 'TBD'} • Target {item.dueInDays != null ? addDays(item.dueInDays) : 'TBD'}
                </p>
              </div>
              <Badge variant="outline">Open</Badge>
            </div>
          ))}
          {!checklist.length ? (
            <p className="rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-6 text-center text-sm text-[color:var(--color-text-muted)]">
              Checklist will populate when a strategy is activated.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
