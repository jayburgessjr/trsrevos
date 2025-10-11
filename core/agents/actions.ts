'use server'

import './registry'

import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'

import { listAgents, runAgent, logsFor, setEnabled } from './bus'
import { AgentKey } from './types'

export async function actionListAgents() {
  return listAgents()
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

  await logAnalyticsEvent({
    eventKey: 'agent.run.triggered',
    payload: { agentKey: key, supabaseRunId: (data as any)?.run_id ?? null },
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
  })

  if (!context.organizationId) {
    console.error('agents:toggle-missing-organization')
    return setEnabled(key, enabled)
  }

  try {
    const { data: existing, error: fetchError } = await context.supabase
      .from('agent_definitions')
      .select('id, definition, organization_id')
      .eq('agent_key', key)
      .maybeSingle()

    if (fetchError) {
      throw fetchError
    }

    const definition = {
      ...(existing?.definition as Record<string, unknown> | undefined),
      enabled,
    }

    if (existing?.id) {
      const { error: updateError } = await context.supabase
        .from('agent_definitions')
        .update({
          definition,
          auto_runnable: enabled,
          organization_id: existing.organization_id ?? context.organizationId,
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
        }, { onConflict: 'agent_key' })

      if (insertError) {
        throw insertError
      }
    }
  } catch (error) {
    console.error('agents:toggle-persist-failed', error)
  }

  return setEnabled(key, enabled)
}
