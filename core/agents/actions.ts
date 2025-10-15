'use server'

import './registry'

import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'

import { listAgents, runAgent, logsFor, setEnabled, getAgent } from './bus'
import { loadAgentGovernance, persistAgentRunRecord } from './governance'
import { AgentKey } from './types'

export async function actionListAgents() {
  const context = await requireAuth({ redirectTo: '/login?next=/agents' })

  const agents = listAgents()

  if (!context.organizationId) {
    return agents
  }

  const governance = await loadAgentGovernance(
    context.supabase,
    context.organizationId,
    agents.map((agent) => agent.meta.key),
  )

  return agents.map((agent) => {
    const record = governance.get(agent.meta.key)
    const status = { ...agent.status }

    if (record) {
      const lifecycle = record.lifecycleStatus.toLowerCase()
      const enabled = lifecycle !== 'disabled' && lifecycle !== 'retired'
      status.enabled = enabled
      ;(status as any).lifecycle = record.lifecycleStatus
      ;(status as any).autoRunnable = record.autoRunnable
    }

    return {
      ...agent,
      status,
      governance: record,
    }
  })
}

export async function actionRunAgent(key: AgentKey, payload?: any) {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/agents' })

  if (!organizationId) {
    throw new Error('Organization context is required to run agents')
  }

  const { data, error } = await supabase.functions.invoke('agent-run', {
    body: {
      agent_key: key,
      user_id: user.id,
      organization_id: organizationId,
      payload: payload ?? {},
    },
  })

  if (error) {
    console.error('agents:run-failed', error)
  }

  const local = await runAgent(key, { userId: user.id, orgId: organizationId, payload })

  await persistAgentRunRecord(supabase, {
    agentKey: key,
    organizationId,
    userId: user.id,
    runInput: payload ?? {},
    runOutput: {
      ok: local.ok,
      summary: local.summary ?? null,
      data: local.data ?? null,
      warnings: local.warnings ?? [],
    },
    summary: local.summary,
    guardrailViolations: local.warnings ?? [],
  })

  await logAnalyticsEvent({
    eventKey: 'agent.run.triggered',
    payload: {
      agentKey: key,
      supabaseRunId: (data as any)?.run_id ?? null,
      ok: local.ok,
      warnings: local.warnings ?? [],
    },
    entity: 'agent',
    entityId: key,
  })

  return { ...local, supabaseRunId: (data as any)?.run_id ?? null }
}

export async function actionLogs(key: AgentKey) {
  return logsFor(key)
}

export async function actionToggleAgent(key: AgentKey, enabled: boolean) {
  const context = await requireAuth({ redirectTo: '/login?next=/agents' })

  await logAnalyticsEvent({
    eventKey: 'agent.toggle',
    payload: { agentKey: key, enabled },
    entity: 'agent',
    entityId: key,
  })

  if (!context.organizationId) {
    console.error('agents:toggle-missing-organization')
    return setEnabled(key, enabled)
  }

  try {
    const { data: existing, error: fetchError } = await context.supabase
      .from('agent_definitions')
      .select('id, definition, organization_id, display_name, description')
      .eq('agent_key', key)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    const definition = {
      ...(existing?.definition as Record<string, unknown> | undefined),
      enabled,
    }

    const lifecycleStatus = enabled ? 'active' : 'disabled'
    const agent = getAgent(key)

    if (existing?.id) {
      const { error: updateError } = await context.supabase
        .from('agent_definitions')
        .update({
          definition,
          auto_runnable: enabled,
          organization_id: existing.organization_id ?? context.organizationId,
          lifecycle_status: lifecycleStatus,
          display_name: existing.display_name ?? agent.meta.name,
          description: existing.description ?? agent.meta.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        throw updateError
      }
    } else {
      const { error: insertError } = await context.supabase
        .from('agent_definitions')
        .upsert({
          agent_key: key,
          organization_id: context.organizationId,
          definition,
          auto_runnable: enabled,
          lifecycle_status: lifecycleStatus,
          display_name: agent.meta.name,
          description: agent.meta.description,
        })

      if (insertError) {
        throw insertError
      }
    }
  } catch (error) {
    console.error('agents:toggle-persist-failed', error)
  }

  return setEnabled(key, enabled)
}
