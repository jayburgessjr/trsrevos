'use server'

import { revalidatePath } from 'next/cache'

import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'

import {
  executeAutomationPlaybook,
  loadAutomationPlaybook,
  loadAutomationPlaybooksForEvent,
} from './engine'
import type { AutomationPlaybook } from './types'

type PlaybookInput = {
  id?: string
  name: string
  description?: string
  triggerEvent: string
  status?: 'draft' | 'active' | 'archived'
  configuration?: Record<string, unknown>
  steps: {
    id?: string
    sortOrder: number
    workspace: 'sales' | 'delivery' | 'finance' | 'ops'
    action: string
    config?: Record<string, unknown>
  }[]
}

export async function listAutomationPlaybooks(): Promise<AutomationPlaybook[]> {
  const { supabase, organizationId } = await requireAuth({ redirectTo: '/login?next=/ops/playbooks' })

  if (!organizationId) {
    return []
  }

  const { data, error } = await supabase
    .from('automation_playbooks')
    .select('id, name, description, trigger_event, status, configuration, created_at, updated_at, steps:automation_steps(*)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('automation:list-playbooks', error)
    return []
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    triggerEvent: row.trigger_event as string,
    status: (row.status as AutomationPlaybook['status']) ?? 'draft',
    configuration: (row.configuration as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | null,
    steps: Array.isArray(row.steps)
      ? (row.steps as any[]).map((step) => ({
          id: step.id as string,
          sortOrder: Number(step.sort_order ?? 0),
          workspace: (step.workspace as 'sales' | 'delivery' | 'finance' | 'ops') ?? 'ops',
          action: step.action as string,
          config: (step.config as Record<string, unknown>) ?? {},
        }))
      : [],
  }))
}

export async function upsertAutomationPlaybook(input: PlaybookInput) {
  const { supabase, organizationId, user } = await requireAuth({ redirectTo: '/login?next=/ops/playbooks' })

  if (!organizationId) {
    throw new Error('Organization context required')
  }

  const base = {
    name: input.name,
    description: input.description ?? null,
    trigger_event: input.triggerEvent,
    status: input.status ?? 'draft',
    configuration: input.configuration ?? {},
    organization_id: organizationId,
    created_by: user.id,
  }

  if (input.id) {
    const { error } = await supabase
      .from('automation_playbooks')
      .update({ ...base, updated_at: new Date().toISOString() })
      .eq('id', input.id)

    if (error) {
      throw error
    }

    await supabase.from('automation_steps').delete().eq('playbook_id', input.id)
    const records = input.steps.map((step) => ({
      ...(step.id ? { id: step.id } : {}),
      playbook_id: input.id,
      sort_order: step.sortOrder,
      workspace: step.workspace,
      action: step.action,
      config: step.config ?? {},
    }))

    if (records.length) {
      await supabase.from('automation_steps').insert(records)
    }
  } else {
    const { data, error } = await supabase
      .from('automation_playbooks')
      .insert(base)
      .select('id')
      .single()

    if (error || !data) {
      throw error ?? new Error('Failed to create playbook')
    }

    if (input.steps.length) {
      const records = input.steps.map((step) => ({
        ...(step.id ? { id: step.id } : {}),
        playbook_id: data.id,
        sort_order: step.sortOrder,
        workspace: step.workspace,
        action: step.action,
        config: step.config ?? {},
      }))

      await supabase.from('automation_steps').insert(records)
    }

    input.id = data.id as string
  }

  await logAnalyticsEvent({
    eventKey: 'automation.playbook.upserted',
    payload: { playbookId: input.id ?? 'new', triggerEvent: input.triggerEvent, status: input.status ?? 'draft' },
  })

  revalidatePath('/ops/playbooks')
}

export async function updateAutomationPlaybookStatus(id: string, status: 'draft' | 'active' | 'archived') {
  const { supabase, organizationId } = await requireAuth({ redirectTo: '/login?next=/ops/playbooks' })

  if (!organizationId) {
    throw new Error('Organization context required')
  }

  const { error } = await supabase
    .from('automation_playbooks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    throw error
  }

  await logAnalyticsEvent({ eventKey: 'automation.playbook.status_changed', payload: { playbookId: id, status } })
  revalidatePath('/ops/playbooks')
}

export async function runAutomationPlaybook(playbookId: string, context: Record<string, unknown>) {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/ops/playbooks' })

  if (!organizationId) {
    throw new Error('Organization context required')
  }

  const playbook = await loadAutomationPlaybook(supabase, organizationId, playbookId)

  if (!playbook) {
    throw new Error('playbook-not-found')
  }

  const result = await executeAutomationPlaybook({
    supabase,
    playbook,
    organizationId,
    userId: user.id,
    context,
  })

  await logAnalyticsEvent({
    eventKey: 'automation.run.completed',
    payload: { playbookId, runId: result.runId, status: result.status },
  })

  revalidatePath('/ops/playbooks')
  return result
}

export async function triggerClosedWonAutomation(
  params: { opportunityId: string; clientId?: string; amount?: number; name?: string },
) {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/pipeline' })

  if (!organizationId) {
    return { ok: false, error: 'missing-organization' } as const
  }

  const playbooks = await loadAutomationPlaybooksForEvent(supabase, organizationId, 'pipeline.closed_won')
  const executions = []

  for (const playbook of playbooks) {
    const result = await executeAutomationPlaybook({
      supabase,
      playbook,
      organizationId,
      userId: user.id,
      context: {
        opportunityId: params.opportunityId,
        clientId: params.clientId,
        amount: params.amount,
        opportunityName: params.name,
      },
    })

    executions.push({ playbookId: playbook.id, runId: result.runId, status: result.status })
  }

  if (executions.length) {
    await logAnalyticsEvent({
      eventKey: 'automation.closed_won.triggered',
      payload: { opportunityId: params.opportunityId, runs: executions },
    })
  }

  return { ok: true, runs: executions } as const
}
