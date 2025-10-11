'use server'

import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'

export async function syncFinanceData() {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/finance' })

  if (!organizationId) {
    return { ok: false, error: 'missing-organization' } as const
  }

  const { data, error } = await supabase.functions.invoke('finance-sync', {
    body: { organization_id: organizationId, triggered_by: user.id },
  })

  if (error) {
    console.error('finance:sync-failed', error)
    return { ok: false, error: error.message } as const
  }

  await logAnalyticsEvent({
    eventKey: 'finance.sync.triggered',
    payload: data as Record<string, unknown>,
  })

  return { ok: true, ...(data as Record<string, unknown>) } as const
}
