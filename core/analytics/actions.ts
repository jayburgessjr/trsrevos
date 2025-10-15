'use server'

import { getAuthContext } from '@/lib/server/auth'

type LogEventInput = {
  eventKey: string
  payload?: Record<string, unknown>
  organizationId?: string | null
  userId?: string | null
  entity?: string
  entityId?: string
}

export async function logAnalyticsEvent({
  eventKey,
  payload = {},
  organizationId,
  userId,
  entity,
  entityId,
}: LogEventInput) {
  if (!eventKey) {
    return { ok: false, error: 'missing-event-key' }
  }

  const context = await getAuthContext()
  const supabase = context.supabase
  const resolvedUserId = userId ?? context.user?.id ?? null
  const resolvedOrgId = organizationId ?? context.organizationId ?? null

  if (!resolvedUserId || !resolvedOrgId) {
    return { ok: false, error: 'not-authenticated' }
  }

  const { error } = await supabase.functions.invoke('analytics-events', {
    body: {
      organization_id: resolvedOrgId,
      user_id: resolvedUserId,
      event_key: eventKey,
      entity: entity ?? undefined,
      entity_id: entityId ?? undefined,
      payload: {
        ...payload,
        emitted_at: new Date().toISOString(),
      },
    },
  })

  if (error) {
    console.error('analytics:invoke-error', error)
    return { ok: false, error: error.message }
  }

  return { ok: true }
}
