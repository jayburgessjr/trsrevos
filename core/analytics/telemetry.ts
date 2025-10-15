'use server'

import { requireAuth } from '@/lib/server/auth'

export type TelemetrySnapshot = {
  lookbackDays: number
  adoption: {
    activeUsers: number
    agentRuns: number
    automationExecutions: number
    totalEvents: number
    activePlaybooks: number
  }
  performance: {
    automationSuccessRate: number
    avgEventsPerDay: number
    automationThroughput: number
  }
  compliance: {
    guardrailBreaches: number
    flaggedRuns: number
    complianceEvents: number
  }
  timeline: { date: string; count: number }[]
  topWorkflows: { workflow: string; count: number }[]
}

export async function getTelemetrySnapshot(lookbackDays = 30): Promise<TelemetrySnapshot> {
  const { supabase, organizationId } = await requireAuth({ redirectTo: '/login?next=/dashboard/telemetry' })

  if (!organizationId) {
    return {
      lookbackDays,
      adoption: { activeUsers: 0, agentRuns: 0, automationExecutions: 0, totalEvents: 0, activePlaybooks: 0 },
      performance: { automationSuccessRate: 0, avgEventsPerDay: 0, automationThroughput: 0 },
      compliance: { guardrailBreaches: 0, flaggedRuns: 0, complianceEvents: 0 },
      timeline: [],
      topWorkflows: [],
    }
  }

  const since = new Date()
  since.setDate(since.getDate() - lookbackDays)
  const sinceIso = since.toISOString()

  const [eventsRes, agentRunsRes, automationRunsRes, playbooksRes] = await Promise.all([
    supabase
      .from('analytics_events')
      .select('event_key, occurred_at, user_id, workflow, payload')
      .eq('organization_id', organizationId)
      .gte('occurred_at', sinceIso),
    supabase
      .from('agent_runs')
      .select('id, guardrail_violations, created_at, agent_key')
      .eq('organization_id', organizationId)
      .gte('created_at', sinceIso),
    supabase
      .from('automation_runs')
      .select('id, status, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', sinceIso),
    supabase.from('automation_playbooks').select('id, status').eq('organization_id', organizationId),
  ])

  if (eventsRes.error) console.error('telemetry:events-error', eventsRes.error)
  if (agentRunsRes.error) console.error('telemetry:agent-runs-error', agentRunsRes.error)
  if (automationRunsRes.error) console.error('telemetry:automation-runs-error', automationRunsRes.error)
  if (playbooksRes.error) console.error('telemetry:playbooks-error', playbooksRes.error)

  const events = eventsRes.data ?? []
  const agentRuns = agentRunsRes.data ?? []
  const automationRuns = automationRunsRes.data ?? []
  const playbooks = playbooksRes.data ?? []

  const adoptionUsers = new Set<string>()
  const timelineMap = new Map<string, number>()
  const workflowMap = new Map<string, number>()

  for (const event of events) {
    const userId = event.user_id as string | null
    if (userId) adoptionUsers.add(userId)

    const day = typeof event.occurred_at === 'string' ? event.occurred_at.slice(0, 10) : null
    if (day) {
      timelineMap.set(day, (timelineMap.get(day) ?? 0) + 1)
    }

    const workflow = (event.workflow as string | null) ??
      (typeof event.event_key === 'string' ? event.event_key.split('.').slice(0, 2).join('.') : 'other')
    workflowMap.set(workflow, (workflowMap.get(workflow) ?? 0) + 1)
  }

  const agentRunEvents = events.filter((event) => typeof event.event_key === 'string' && event.event_key.startsWith('agent.'))
  const automationEvents = events.filter((event) => typeof event.event_key === 'string' && event.event_key.startsWith('automation.'))
  const complianceEvents = events.filter((event) => {
    if (typeof event.event_key !== 'string') return false
    return event.event_key.includes('guardrail') || event.event_key.includes('compliance')
  })

  const automationExecutions = automationRuns.length
  const automationCompleted = automationRuns.filter((run) => run.status === 'completed').length
  const automationSuccessRate = automationExecutions
    ? Math.round((automationCompleted / automationExecutions) * 100)
    : 0

  const guardrailBreaches = agentRuns.filter((run) => (run.guardrail_violations as string[] | null)?.length).length

  const timeline = Array.from(timelineMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const topWorkflows = Array.from(workflowMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([workflow, count]) => ({ workflow, count }))

  const avgEventsPerDay = timeline.length
    ? Number((events.length / timeline.length).toFixed(2))
    : 0

  const flaggedRuns = guardrailBreaches
  const activePlaybooks = playbooks.filter((playbook) => playbook.status === 'active').length

  return {
    lookbackDays,
    adoption: {
      activeUsers: adoptionUsers.size,
      agentRuns: agentRunEvents.length,
      automationExecutions,
      totalEvents: events.length,
      activePlaybooks,
    },
    performance: {
      automationSuccessRate,
      avgEventsPerDay,
      automationThroughput: automationEvents.length,
    },
    compliance: {
      guardrailBreaches,
      flaggedRuns,
      complianceEvents: complianceEvents.length,
    },
    timeline,
    topWorkflows,
  }
}
