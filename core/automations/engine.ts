'use server'

import type { SupabaseClient } from '@supabase/supabase-js'

import type { AutomationPlaybook, AutomationRunResult, AutomationStep } from './types'

function normalizeSteps(steps: any[] | null | undefined): AutomationStep[] {
  return (steps ?? [])
    .map((step) => ({
      id: step.id as string,
      sortOrder: Number(step.sort_order ?? step.sortOrder ?? 0),
      workspace: (step.workspace as AutomationStep['workspace']) ?? 'ops',
      action: step.action as string,
      config: (step.config as Record<string, any>) ?? {},
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function loadAutomationPlaybooksForEvent(
  supabase: SupabaseClient,
  organizationId: string,
  triggerEvent: string,
): Promise<AutomationPlaybook[]> {
  const { data, error } = await supabase
    .from('automation_playbooks')
    .select('id, name, description, trigger_event, status, configuration, created_at, updated_at, steps:automation_steps(*)')
    .eq('organization_id', organizationId)
    .eq('trigger_event', triggerEvent)
    .neq('status', 'archived')

  if (error) {
    console.error('automation:load-for-event', error)
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
    steps: normalizeSteps(row.steps as any[]),
  }))
}

export async function loadAutomationPlaybook(
  supabase: SupabaseClient,
  organizationId: string,
  playbookId: string,
): Promise<AutomationPlaybook | null> {
  const { data, error } = await supabase
    .from('automation_playbooks')
    .select('id, name, description, trigger_event, status, configuration, created_at, updated_at, steps:automation_steps(*)')
    .eq('organization_id', organizationId)
    .eq('id', playbookId)
    .maybeSingle()

  if (error) {
    console.error('automation:load-playbook', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id as string,
    name: data.name as string,
    description: (data.description as string) ?? null,
    triggerEvent: data.trigger_event as string,
    status: (data.status as AutomationPlaybook['status']) ?? 'draft',
    configuration: (data.configuration as Record<string, unknown>) ?? {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string | null,
    steps: normalizeSteps(data.steps as any[]),
  }
}

type ExecuteParams = {
  supabase: SupabaseClient
  playbook: AutomationPlaybook
  organizationId: string
  userId: string
  context: Record<string, unknown>
}

type StepExecutionResult = {
  status: 'completed' | 'skipped' | 'failed'
  output?: Record<string, unknown>
}

export async function executeAutomationPlaybook({
  supabase,
  playbook,
  organizationId,
  userId,
  context,
}: ExecuteParams): Promise<AutomationRunResult> {
  const { data: run, error: runError } = await supabase
    .from('automation_runs')
    .insert({
      playbook_id: playbook.id,
      organization_id: organizationId,
      triggered_by: userId,
      context,
      status: 'processing',
    })
    .select('id')
    .single()

  if (runError || !run) {
    console.error('automation:create-run-failed', runError)
    throw runError ?? new Error('create-run-failed')
  }

  const stepResults: AutomationRunResult['stepResults'] = []

  for (const step of playbook.steps) {
    try {
      const result = await performStep(supabase, organizationId, userId, step, context)

      await supabase
        .from('automation_run_steps')
        .insert({
          run_id: run.id,
          step_id: step.id,
          workspace: step.workspace,
          action: step.action,
          status: result.status,
          output: result.output ?? {},
          completed_at: new Date().toISOString(),
        })

      stepResults.push({ stepId: step.id, status: result.status, output: result.output })

      if (result.status === 'failed') {
        await supabase
          .from('automation_runs')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', run.id)
        return { runId: run.id, status: 'failed', stepResults }
      }
    } catch (error) {
      console.error('automation:step-error', step.action, error)
      await supabase
        .from('automation_run_steps')
        .insert({
          run_id: run.id,
          step_id: step.id,
          workspace: step.workspace,
          action: step.action,
          status: 'failed',
          output: { error: error instanceof Error ? error.message : String(error) },
          completed_at: new Date().toISOString(),
        })

      stepResults.push({
        stepId: step.id,
        status: 'failed',
        output: { error: error instanceof Error ? error.message : String(error) },
      })

      await supabase
        .from('automation_runs')
        .update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('id', run.id)

      return { runId: run.id, status: 'failed', stepResults }
    }
  }

  await supabase
    .from('automation_runs')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', run.id)

  return { runId: run.id, status: 'completed', stepResults }
}

async function performStep(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  step: AutomationStep,
  context: Record<string, unknown>,
): Promise<StepExecutionResult> {
  switch (step.action) {
    case 'log_closed_won_context': {
      const payload = {
        organization_id: organizationId,
        user_id: userId,
        event_key: 'automation.closed_won.context',
        payload: { context },
      }

      const { error } = await supabase.functions.invoke('analytics-events', { body: payload })
      if (error) {
        throw error
      }

      return { status: 'completed', output: { analyticsEvent: 'automation.closed_won.context' } }
    }
    case 'create_project_kickoff': {
      const clientId = (context.clientId as string | undefined) ?? null
      const name = (context.projectName as string | undefined) ??
        (context.name as string | undefined) ??
        `Implementation for ${(context.opportunityName as string | undefined) ?? 'new win'}`
      const phase = (step.config.phase as string | undefined) ?? 'Discovery'
      const ownerId = (context.ownerId as string | undefined) ?? userId

      const today = new Date().toISOString().slice(0, 10)

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: clientId,
          name,
          status: 'Active',
          phase,
          health: 'Green',
          start_date: today,
          owner_id: ownerId,
          progress: 0,
        })
        .select('id')
        .single()

      if (projectError || !project) {
        throw projectError ?? new Error('project-create-failed')
      }

      const kickoffAgenda = {
        source: 'automation',
        trigger: step.action,
        checklist: [
          'Confirm project owner + roles',
          'Align on timeline + billing milestones',
        ],
        ...(step.config.agendaOverrides as Record<string, unknown> | undefined),
      }

      const { error: kickoffError } = await supabase.from('project_kickoffs').insert({
        project_id: project.id,
        client_id: clientId,
        owner_id: ownerId,
        kickoff_date: today,
        agenda: kickoffAgenda,
      })

      if (kickoffError) {
        throw kickoffError
      }

      return { status: 'completed', output: { projectId: project.id } }
    }
    case 'schedule_invoice_plan': {
      const clientId = (context.clientId as string | undefined) ?? null
      const projectId = (context.projectId as string | undefined) ?? null
      const amount = Number(context.amount ?? 0)
      const installments = Math.max(1, Number(step.config.installments ?? 3))
      const cadence = (step.config.cadence as string | undefined) ?? 'monthly'

      if (!clientId) {
        return { status: 'skipped', output: { reason: 'missing-client-id' } }
      }

      const entries = Array.from({ length: installments }).map((_, index) => {
        const dueDate = new Date()
        if (cadence === 'monthly') {
          dueDate.setMonth(dueDate.getMonth() + index)
        } else if (cadence === 'weekly') {
          dueDate.setDate(dueDate.getDate() + index * 7)
        }

        return {
          client_id: clientId,
          project_id: projectId,
          amount: installments > 0 ? Math.round((amount / installments) * 100) / 100 : amount,
          due_date: dueDate.toISOString().slice(0, 10),
          status: 'scheduled',
        }
      })

      const { error: invoiceError } = await supabase.from('invoice_schedules').insert(entries)
      if (invoiceError) {
        throw invoiceError
      }

      return { status: 'completed', output: { invoicesScheduled: entries.length } }
    }
    default:
      return { status: 'skipped', output: { action: step.action } }
  }
}
