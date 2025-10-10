import { NextResponse } from 'next/server'

import { createOAuthClient, GMAIL_SCOPES, getAppUrl, getSupabaseUser } from '@/lib/gmail/server'

const STATE_COOKIE = 'gmail_oauth_state'
const STATE_TTL_SECONDS = 60 * 10

export async function GET() {
  try {
    const { user } = await getSupabaseUser()

    if (!user) {
      const redirect = new URL('/settings/integrations?error=auth', getAppUrl())
      return NextResponse.redirect(redirect)
    }

    const oauthClient = createOAuthClient()
    const state = crypto.randomUUID()

    const consentUrl = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: GMAIL_SCOPES,
      state,
    })

    const response = NextResponse.redirect(consentUrl)
    response.cookies.set({
      name: STATE_COOKIE,
      value: state,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: STATE_TTL_SECONDS,
    })

    return response
  } catch (error) {
    console.error('Failed to initiate Gmail OAuth flow', error)
    const redirect = new URL('/settings/integrations?error=oauth_start', getAppUrl())
    return NextResponse.redirect(redirect)
  }
}
