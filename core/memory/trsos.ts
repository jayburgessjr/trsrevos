'use server'

import type { SupabaseClient } from '@supabase/supabase-js'

export type MemoryResult = {
  id: string
  agentKey: string
  title: string | null
  content: string
  metadata: Record<string, unknown> | null
  salienceScore: number
  createdAt: string
}

export async function searchAgentMemories(
  supabase: SupabaseClient,
  params: {
    query: string
    organizationId: string
    agentKey?: string
    limit?: number
  },
): Promise<MemoryResult[]> {
  if (!params.organizationId) return []

  const { data, error } = await supabase.rpc('match_agent_memories', {
    p_query: params.query,
    p_agent_key: params.agentKey ?? null,
    p_organization: params.organizationId,
    p_limit: params.limit ?? 5,
  })

  if (error) {
    console.error('trsos:memory-search-failed', error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    agentKey: (row.agent_key as string) ?? params.agentKey ?? 'unknown',
    title: (row.title as string) ?? null,
    content: (row.content as string) ?? '',
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    salienceScore: typeof row.salience_score === 'number' ? row.salience_score : Number(row.salience_score ?? 0),
    createdAt: row.created_at as string,
  }))
}
