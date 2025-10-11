'use server'

import { logAnalyticsEvent } from '@/core/analytics/actions'
import { requireAuth } from '@/lib/server/auth'

type SyncFinanceDataResult =
  | { ok: true; invoices_processed?: number }
  | { ok: false; error: string };

export async function syncFinanceData(): Promise<SyncFinanceDataResult> {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: '/login?next=/finance' })

  if (!organizationId) {
    return { ok: false, error: 'missing-organization' }
  }

  const { data, error } = await supabase.functions.invoke('finance-sync', {
    body: { organization_id: organizationId, triggered_by: user.id },
  })

  if (error) {
    console.error('finance:sync-failed', error)
    return { ok: false, error: error.message }
  }

  await logAnalyticsEvent({
    eventKey: 'finance.sync.triggered',
    payload: data as Record<string, unknown>,
  })

  const invoicesProcessed = (data as Record<string, unknown> | null | undefined)?.invoices_processed
  return {
    ok: true,
    invoices_processed: typeof invoicesProcessed === 'number' ? invoicesProcessed : undefined,
  }
}
