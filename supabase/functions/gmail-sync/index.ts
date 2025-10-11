import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh Google token: ${response.status} ${errorBody}`);
  }

  const json = await response.json();
  return {
    accessToken: json.access_token as string,
    expiresIn: json.expires_in as number | undefined,
    scope: json.scope as string | undefined,
    tokenType: json.token_type as string | undefined,
    refreshToken: (json.refresh_token as string | undefined) ?? refreshToken,
  };
}

async function fetchRecentMessages(accessToken: string, maxMessages: number) {
  const listResponse = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxMessages}&q=label:inbox`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!listResponse.ok) {
    const errorBody = await listResponse.text();
    throw new Error(`Failed to list Gmail messages: ${listResponse.status} ${errorBody}`);
  }

  const listJson = await listResponse.json() as { messages?: Array<{ id: string }> };
  const messages = listJson.messages ?? [];

  const results: Array<{
    id: string;
    snippet: string | null;
    historyId?: string;
    internalDate?: string;
    subject?: string;
    from?: string;
    receivedAt?: string;
  }> = [];

  for (const message of messages) {
    const detailResponse = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!detailResponse.ok) {
      console.warn(
        `gmail-sync: failed to fetch message ${message.id}: ${detailResponse.status} ${await detailResponse.text()}`,
      );
      continue;
    }

    const detailJson = await detailResponse.json() as {
      id: string;
      snippet?: string;
      historyId?: string;
      internalDate?: string;
      payload?: { headers?: Array<{ name: string; value: string }> };
    };

    const headers = new Map(
      (detailJson.payload?.headers ?? []).map((header) => [header.name.toLowerCase(), header.value]),
    );

    results.push({
      id: detailJson.id,
      snippet: detailJson.snippet ?? null,
      historyId: detailJson.historyId,
      internalDate: detailJson.internalDate,
      subject: headers.get("subject") ?? undefined,
      from: headers.get("from") ?? undefined,
      receivedAt: headers.get("date") ?? undefined,
    });
  }

  return results;
}

type GmailSyncRequest = {
  userId?: string;
  maxMessages?: number;
};

type IntegrationRecord = {
  id: string;
  user_id: string;
  provider: string;
  access_token: string | null;
  refresh_token: string | null;
  scope: string | null;
  token_type: string | null;
  expiry_date: string | null;
};

type UserRecord = {
  id: string;
  organization_id: string | null;
};

function needsRefresh(record: IntegrationRecord) {
  if (!record.refresh_token) return false;
  if (!record.access_token || !record.expiry_date) return true;
  const expiresAt = Date.parse(record.expiry_date);
  if (Number.isNaN(expiresAt)) return true;
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;
  return expiresAt - bufferMs <= now;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  let payload: GmailSyncRequest = {};
  try {
    payload = await req.json();
  } catch (_error) {
    // ignore and use defaults
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  const maxMessages = Math.max(1, Math.min(payload.maxMessages ?? 5, 50));

  const query = supabase
    .from("user_integrations")
    .select("id, user_id, provider, access_token, refresh_token, scope, token_type, expiry_date")
    .eq("provider", "gmail");

  if (payload.userId) {
    query.eq("user_id", payload.userId);
  }

  const { data: integrations, error: integrationsError } = await query;

  if (integrationsError) {
    console.error("gmail-sync: failed to load integrations", integrationsError);
    return new Response(JSON.stringify({ error: "Failed to load integrations" }), {
      status: 500,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  if (!integrations || integrations.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0, inserted: 0 }), {
      status: 200,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  const userIds = Array.from(new Set(integrations.map((item) => item.user_id)));
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, organization_id")
    .in("id", userIds);

  if (usersError) {
    console.error("gmail-sync: failed to load users", usersError);
    return new Response(JSON.stringify({ error: "Failed to load users" }), {
      status: 500,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  const userMap = new Map<string, UserRecord>();
  for (const user of users ?? []) {
    userMap.set(user.id, user as UserRecord);
  }

  let processed = 0;
  let totalMessages = 0;

  for (const integration of integrations as IntegrationRecord[]) {
    processed += 1;

    if (!integration.refresh_token) {
      console.warn(`gmail-sync: integration ${integration.id} missing refresh token`);
      continue;
    }

    let accessToken = integration.access_token ?? "";
    let expiryDate = integration.expiry_date ?? null;
    let scope = integration.scope ?? null;
    let tokenType = integration.token_type ?? null;

    if (needsRefresh(integration)) {
      try {
        const refreshed = await refreshGoogleAccessToken(integration.refresh_token);
        accessToken = refreshed.accessToken;
        scope = refreshed.scope ?? scope;
        tokenType = refreshed.tokenType ?? tokenType;
        expiryDate = refreshed.expiresIn
          ? new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
          : expiryDate;

        const { error: updateError } = await supabase
          .from("user_integrations")
          .update({
            access_token: accessToken,
            refresh_token: refreshed.refreshToken,
            scope,
            token_type: tokenType,
            expiry_date: expiryDate,
          })
          .eq("id", integration.id);

        if (updateError) {
          console.error("gmail-sync: failed to persist refreshed token", updateError);
        }
      } catch (error) {
        console.error(`gmail-sync: refresh failed for ${integration.id}`, error);
        const { error: markError } = await supabase
          .from("integrations")
          .upsert({
            organization_id: userMap.get(integration.user_id)?.organization_id ?? null,
            provider: "gmail",
            connection_scope: "user",
            status: "error",
            settings: { last_error: (error as Error).message },
            updated_at: new Date().toISOString(),
          }, { onConflict: "organization_id,provider" });

        if (markError) {
          console.error("gmail-sync: failed to mark integration error", markError);
        }
        continue;
      }
    }

    if (!accessToken) {
      console.warn(`gmail-sync: integration ${integration.id} missing access token`);
      continue;
    }

    let messages: Awaited<ReturnType<typeof fetchRecentMessages>> = [];
    try {
      messages = await fetchRecentMessages(accessToken, maxMessages);
    } catch (error) {
      console.error(`gmail-sync: message fetch failed for ${integration.id}`, error);
      const { error: markError } = await supabase
        .from("integrations")
        .upsert({
          organization_id: userMap.get(integration.user_id)?.organization_id ?? null,
          provider: "gmail",
          connection_scope: "user",
          status: "error",
          settings: { last_error: (error as Error).message },
          updated_at: new Date().toISOString(),
        }, { onConflict: "organization_id,provider" });

      if (markError) {
        console.error("gmail-sync: failed to mark integration error", markError);
      }
      continue;
    }

    totalMessages += messages.length;

    if (messages.length > 0) {
      const events = messages.map((message) => ({
        user_id: integration.user_id,
        organization_id: userMap.get(integration.user_id)?.organization_id ?? null,
        event_type: "gmail_sync",
        entity_type: "gmail_message",
        entity_id: message.id,
        metadata: {
          snippet: message.snippet,
          subject: message.subject,
          from: message.from,
          historyId: message.historyId,
          internalDate: message.internalDate,
          receivedAt: message.receivedAt,
        },
      }));

      const { error: insertError } = await supabase.from("analytics_events").upsert(events, {
        onConflict: "entity_id, entity_type",
      });

      if (insertError) {
        console.error("gmail-sync: failed to record analytics events", insertError);
      }
    }

    const { error: upsertError } = await supabase.from("integrations").upsert({
      organization_id: userMap.get(integration.user_id)?.organization_id ?? null,
      provider: "gmail",
      connection_scope: "user",
      status: "connected",
      last_synced_at: new Date().toISOString(),
      settings: {
        last_sync_user_id: integration.user_id,
        last_sync_count: messages.length,
        last_sync_scope: scope,
        token_type: tokenType,
        expiry_date: expiryDate,
      },
    }, { onConflict: "organization_id,provider" });

    if (upsertError) {
      console.error("gmail-sync: failed to upsert integration", upsertError);
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed, inserted: totalMessages }),
    {
      status: 200,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    },
  );
});
