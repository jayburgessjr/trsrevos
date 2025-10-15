'use server'

import type { SupabaseClient } from '@supabase/supabase-js'

export type AgentGovernanceRecord = {
  agentKey: string
  definitionId: string
  lifecycleStatus: string
  autoRunnable: boolean
  displayName?: string | null
  description?: string | null
  definition?: Record<string, unknown> | null
  prompts: {
    id: string
    name: string
    role: string
    content: string
    lifecycleStatus: string
  }[]
  guardrails: {
    id: string
    rule: string
    severity: string
    remediation?: string | null
    lifecycleStatus: string
  }[]
}

export async function loadAgentGovernance(
  supabase: SupabaseClient,
  organizationId: string,
  agentKeys: string[],
): Promise<Map<string, AgentGovernanceRecord>> {
  if (!agentKeys.length) return new Map()

  const { data, error } = await supabase
    .from('agent_definitions')
    .select(
      `id, agent_key, lifecycle_status, auto_runnable, display_name, description, definition,
       prompts:agent_prompts(id, name, role, content, lifecycle_status),
       guardrails:agent_guardrails(id, rule, severity, remediation, lifecycle_status)`,
    )
    .eq('organization_id', organizationId)
    .in('agent_key', agentKeys)
    .order('version', { ascending: false })

  if (error) {
    console.error('agents:load-governance-failed', error)
    return new Map()
  }

  const records = new Map<string, AgentGovernanceRecord>()

  for (const row of data ?? []) {
    const key = row.agent_key as string
    if (!records.has(key)) {
      records.set(key, {
        agentKey: key,
        definitionId: row.id as string,
        lifecycleStatus: (row.lifecycle_status as string) ?? 'active',
        autoRunnable: Boolean(row.auto_runnable),
        displayName: row.display_name as string | null,
        description: row.description as string | null,
        definition: (row.definition as Record<string, unknown> | null) ?? null,
        prompts: ((row.prompts as any[]) ?? []).map((prompt) => ({
          id: prompt.id as string,
          name: prompt.name as string,
          role: prompt.role as string,
          content: prompt.content as string,
          lifecycleStatus: (prompt.lifecycle_status as string) ?? 'active',
        })),
        guardrails: ((row.guardrails as any[]) ?? []).map((rule) => ({
          id: rule.id as string,
          rule: rule.rule as string,
          severity: (rule.severity as string) ?? 'medium',
          remediation: rule.remediation as string | null,
          lifecycleStatus: (rule.lifecycle_status as string) ?? 'active',
        })),
      })
    }
  }

  return records
}

export async function persistAgentRunRecord(
  supabase: SupabaseClient,
  input: {
    agentKey: string
    organizationId: string
    userId: string
    runInput?: Record<string, unknown>
    runOutput?: Record<string, unknown>
    summary?: string
    guardrailViolations?: string[]
  },
) {
  const { error } = await supabase.from('agent_runs').insert({
    agent_key: input.agentKey,
    organization_id: input.organizationId,
    user_id: input.userId,
    input: input.runInput ?? {},
    output: input.runOutput ?? {},
    summary: input.summary ?? null,
    guardrail_violations: input.guardrailViolations ?? [],
  })

  if (error) {
    console.error('agents:persist-run-failed', error)
  }
}
