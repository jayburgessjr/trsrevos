import { google } from 'googleapis'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export const GMAIL_PROVIDER = 'gmail'
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
]

export type UserIntegrationRecord = {
  id: string
  user_id: string
  provider: string
  access_token: string | null
  refresh_token: string | null
  scope: string | null
  token_type: string | null
  expiry_date: string | null
  connected_at: string
}

type OAuthClient = InstanceType<(typeof google)['auth']['OAuth2']>

export type GmailContext = {
  supabase: SupabaseClient
  user: NonNullable<Awaited<ReturnType<typeof getSupabaseUser>>['user']>
  integration: UserIntegrationRecord
  oauthClient: OAuthClient
}

type SupabaseUserResult = {
  supabase: SupabaseClient
  user: Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']
}

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured')
  }
  return appUrl
}

export function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth environment variables are missing')
  }

  const redirectUri = new URL('/api/gmail/oauth/callback', getAppUrl()).toString()
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export async function getSupabaseUser(): Promise<SupabaseUserResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return { supabase, user }
}

export async function getGmailIntegration(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserIntegrationRecord | null> {
  const { data, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', GMAIL_PROVIDER)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return (data as UserIntegrationRecord | null) ?? null
}

export async function requireGmailContext(): Promise<GmailContext> {
  const { supabase, user } = await getSupabaseUser()

  if (!user) {
    throw new Error('User must be authenticated to access Gmail integration')
  }

  const integration = await getGmailIntegration(supabase, user.id)

  if (!integration || !integration.refresh_token) {
    throw new Error('Gmail is not connected for this user')
  }

  const oauthClient = createOAuthClient()
  oauthClient.setCredentials({
    refresh_token: integration.refresh_token ?? undefined,
    access_token: integration.access_token ?? undefined,
    expiry_date: integration.expiry_date ? new Date(integration.expiry_date).getTime() : undefined,
    scope: integration.scope ?? undefined,
    token_type: integration.token_type ?? undefined,
  })

  return { supabase, user, integration, oauthClient }
}

export function getGmailClient(oauthClient: OAuthClient) {
  return google.gmail({ version: 'v1', auth: oauthClient })
}

export async function persistOAuthCredentials(
  supabase: SupabaseClient,
  userId: string,
  previous: UserIntegrationRecord,
  oauthClient: OAuthClient,
) {
  const credentials = oauthClient.credentials
  if (!credentials) {
    return
  }

  const nextValues = {
    access_token: credentials.access_token ?? previous.access_token,
    refresh_token: credentials.refresh_token ?? previous.refresh_token,
    scope: typeof credentials.scope === 'string' ? credentials.scope : previous.scope,
    token_type: credentials.token_type ?? previous.token_type,
    expiry_date: credentials.expiry_date
      ? new Date(credentials.expiry_date).toISOString()
      : previous.expiry_date,
  }

  if (
    nextValues.access_token === previous.access_token &&
    nextValues.refresh_token === previous.refresh_token &&
    nextValues.scope === previous.scope &&
    nextValues.token_type === previous.token_type &&
    nextValues.expiry_date === previous.expiry_date
  ) {
    return
  }

  const { error } = await supabase
    .from('user_integrations')
    .update(nextValues)
    .eq('user_id', userId)
    .eq('provider', GMAIL_PROVIDER)

  if (error) {
    throw error
  }
}
