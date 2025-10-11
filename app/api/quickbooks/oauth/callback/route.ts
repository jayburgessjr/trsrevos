import { Buffer } from 'node:buffer';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const QUICKBOOKS_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

function resolveAppUrl(requestUrl: string) {
  const requestOrigin = new URL(requestUrl).origin;
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.URL,
    requestOrigin,
  ].filter((value): value is string => Boolean(value));
  return candidates[0] ?? 'http://localhost:3000';
}

function getAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured to complete QuickBooks OAuth');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

async function exchangeAuthorizationCode(code: string, redirectUri: string) {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('QuickBooks client credentials are not configured');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(QUICKBOOKS_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`QuickBooks token exchange failed: ${response.status} ${errorBody}`);
  }

  const json = await response.json();
  return {
    accessToken: json.access_token as string,
    refreshToken: json.refresh_token as string,
    expiresAt: json.expires_in ? new Date(Date.now() + Number(json.expires_in) * 1000).toISOString() : undefined,
  };
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const realmId = url.searchParams.get('realmId');
  const appUrl = resolveAppUrl(request.url);

  if (!code || !state || !realmId) {
    const redirect = new URL('/settings/integrations?quickbooks=oauth_error', appUrl);
    return NextResponse.redirect(redirect);
  }

  try {
    const supabase = getAdminClient();

    const integrationQuery = supabase
      .from('integrations')
      .select('id, organization_id, settings')
      .eq('provider', 'quickbooks')
      .contains('settings', { oauth_state: state });

    const { data: integration, error } = await integrationQuery.maybeSingle();

    if (error || !integration) {
      throw new Error('Unable to locate pending QuickBooks integration');
    }

    const callbackUrl = new URL('/api/quickbooks/oauth/callback', appUrl).toString();
    const tokens = await exchangeAuthorizationCode(code, callbackUrl);

    const existingSettings = (integration.settings as Record<string, unknown> | undefined) ?? {};

    await supabase
      .from('integrations')
      .update({
        status: 'connected',
        last_synced_at: null,
        updated_at: new Date().toISOString(),
        settings: {
          ...existingSettings,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_at: tokens.expiresAt,
          realm_id: realmId,
          oauth_state: null,
          last_sync_count: 0,
        },
      })
      .eq('id', integration.id);

    const redirect = new URL('/settings/integrations?quickbooks=connected', appUrl);
    return NextResponse.redirect(redirect);
  } catch (error) {
    console.error('quickbooks oauth callback failed', error);
    const redirect = new URL('/settings/integrations?quickbooks=oauth_error', appUrl);
    return NextResponse.redirect(redirect);
  }
}
