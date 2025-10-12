import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch (error) {
    payload = null
  }

  const body = (payload && typeof payload === 'object' ? payload : {}) as {
    kind?: string
    entityType?: 'projects' | 'clients' | 'content'
    entityId?: string
    metadata?: Record<string, unknown>
  }

  const kind = typeof body.kind === 'string' && body.kind.trim() ? body.kind.trim() : 'unknown'
  const entityType = body.entityType ?? 'projects'
  const entityId =
    body.entityId ??
    (entityType === 'clients'
      ? 'client_workspace'
      : entityType === 'content'
        ? 'content_studio'
        : 'projects_hub')

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'agent_run',
      entity_type: entityType,
      entity_id: entityId,
      metadata: { kind, ...(body.metadata ?? {}) },
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
