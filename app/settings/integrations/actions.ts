'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { edge } from '@/lib/server/edgeClient'
import { createClient } from '@/lib/supabase/server'

const SETTINGS_PATH = '/settings/integrations'

function resolveAppUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.URL,
    process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ].filter((value): value is string => Boolean(value))
  return candidates[0] ?? 'http://localhost:3000'
}

async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    redirect('/login?next=/settings/integrations')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  return { supabase, user, organizationId: profile?.organization_id ?? null }
}

export async function disconnectGmail() {
  const { supabase, user, organizationId } = await requireAuth()

  await supabase
    .from('user_integrations')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', 'gmail')

  const integrationUpdate = {
    status: 'disconnected',
    last_synced_at: null,
    settings: {},
    updated_at: new Date().toISOString(),
  }

  const gmailQuery = supabase
    .from('integrations')
    .update(integrationUpdate)
    .eq('provider', 'gmail')

  if (organizationId) {
    gmailQuery.eq('organization_id', organizationId)
  } else {
    gmailQuery.is('organization_id', null)
  }

  await gmailQuery

  const calendarQuery = supabase
    .from('integrations')
    .update(integrationUpdate)
    .eq('provider', 'google_calendar')

  if (organizationId) {
    calendarQuery.eq('organization_id', organizationId)
  } else {
    calendarQuery.is('organization_id', null)
  }

  await calendarQuery

  revalidatePath(SETTINGS_PATH)
}

export async function syncGmail() {
  const { user } = await requireAuth()
  await edge.gmailSync({ userId: user.id })
  revalidatePath(SETTINGS_PATH)
}

export async function syncCalendar() {
  const { user } = await requireAuth()
  await edge.calendarSync({ userId: user.id })
  revalidatePath(SETTINGS_PATH)
}

export async function startQuickBooksOAuth() {
  const { supabase, organizationId } = await requireAuth()

  const clientId = process.env.QUICKBOOKS_CLIENT_ID
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('QuickBooks client credentials are not configured')
  }

  const callbackUrl = new URL('/api/quickbooks/oauth/callback', resolveAppUrl()).toString()
  const state = crypto.randomUUID()

  const existingQuery = supabase
    .from('integrations')
    .select('id, settings')
    .eq('provider', 'quickbooks')

  if (organizationId) {
    existingQuery.eq('organization_id', organizationId)
  } else {
    existingQuery.is('organization_id', null)
  }

  const { data: existing } = await existingQuery.maybeSingle()
  const settings = {
    ...(existing?.settings ?? {}),
    oauth_state: state,
  }

  await supabase.from('integrations').upsert(
    {
      organization_id: organizationId,
      provider: 'quickbooks',
      connection_scope: 'organization',
      status: 'pending',
      settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'organization_id,provider' },
  )

  const scope = encodeURIComponent('com.intuit.quickbooks.accounting openid profile email')
  const authorizeUrl =
    `https://appcenter.intuit.com/connect/oauth2?client_id=${encodeURIComponent(clientId)}` +
    `&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`

  redirect(authorizeUrl)
}

export async function disconnectQuickBooks() {
  const { supabase, organizationId } = await requireAuth()

  const query = supabase
    .from('integrations')
    .update({
      status: 'disconnected',
      last_synced_at: null,
      settings: {},
      updated_at: new Date().toISOString(),
    })
    .eq('provider', 'quickbooks')

  if (organizationId) {
    query.eq('organization_id', organizationId)
  } else {
    query.is('organization_id', null)
  }

  await query
  revalidatePath(SETTINGS_PATH)
}

export async function syncQuickBooks() {
  const { organizationId } = await requireAuth()
  await edge.quickbooksSync({ organizationId: organizationId ?? undefined })
  revalidatePath(SETTINGS_PATH)
}
