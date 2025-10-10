import { NextRequest, NextResponse } from 'next/server'

import {
  createOAuthClient,
  getAppUrl,
  getGmailIntegration,
  getSupabaseUser,
  GMAIL_PROVIDER,
} from '@/lib/gmail/server'

const STATE_COOKIE = 'gmail_oauth_state'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin)
  const url = new URL(request.url)
  const storedState = request.cookies.get(STATE_COOKIE)?.value
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  const oauthError = url.searchParams.get('error')

  if (oauthError) {
    const redirect = new URL('/settings/integrations', appUrl)
    redirect.searchParams.set('error', oauthError)
    const response = NextResponse.redirect(redirect)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  if (!state || !storedState || storedState !== state) {
    const redirect = new URL('/settings/integrations', appUrl)
    redirect.searchParams.set('error', 'state_mismatch')
    const response = NextResponse.redirect(redirect)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  if (!code) {
    const redirect = new URL('/settings/integrations', appUrl)
    redirect.searchParams.set('error', 'missing_code')
    const response = NextResponse.redirect(redirect)
    response.cookies.delete(STATE_COOKIE)
    return response
  }

  try {
    const { supabase, user } = await getSupabaseUser()

    if (!user) {
      const redirect = new URL('/settings/integrations', appUrl)
      redirect.searchParams.set('error', 'auth')
      const response = NextResponse.redirect(redirect)
      response.cookies.delete(STATE_COOKIE)
      return response
    }

    const oauthClient = createOAuthClient()
    const { tokens } = await oauthClient.getToken(code)
    const existingIntegration = await getGmailIntegration(supabase, user.id)

    const refreshToken = tokens.refresh_token ?? existingIntegration?.refresh_token ?? null

    if (!refreshToken) {
      throw new Error('Google did not return a refresh token for this authorization request')
    }

    const payload = {
      user_id: user.id,
      provider: GMAIL_PROVIDER,
      access_token: tokens.access_token ?? existingIntegration?.access_token ?? null,
      refresh_token: refreshToken,
      scope: typeof tokens.scope === 'string' ? tokens.scope : existingIntegration?.scope ?? null,
      token_type: tokens.token_type ?? existingIntegration?.token_type ?? null,
      expiry_date: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : existingIntegration?.expiry_date ?? null,
      connected_at: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from('user_integrations')
      .upsert(payload, { onConflict: 'user_id,provider' })

    if (upsertError) {
      throw upsertError
    }

    const redirect = new URL('/settings/integrations', appUrl)
    redirect.searchParams.set('connected', GMAIL_PROVIDER)
    const response = NextResponse.redirect(redirect)
    response.cookies.delete(STATE_COOKIE)
    return response
  } catch (error) {
    console.error('Failed to complete Gmail OAuth callback', error)
    const redirect = new URL('/settings/integrations', appUrl)
    redirect.searchParams.set('error', 'oauth_callback')
    const response = NextResponse.redirect(redirect)
    response.cookies.delete(STATE_COOKIE)
    return response
  }
}
