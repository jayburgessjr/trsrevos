import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type NotifyAgentRequest = {
  agent_id: string;
  message: string;
  context?: Record<string, unknown>;
  channel?: string;
  organization_id?: string;
};

type IntegrationRecord = {
  id: string;
  provider: string | null;
  status: string | null;
  settings: Record<string, unknown> | null;
  organization_id: string | null;
};

type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
};

const ALLOWED_ORIGINS = new Set([
  "https://trsrevos.vercel.app",
  "http://localhost:3000",
]);

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://trsrevos.vercel.app";
  return new Headers({
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json",
  });
}

function jsonResponse<T>(body: T, init: ResponseInit & { headers: Headers }) {
  return new Response(JSON.stringify(body, null, 2), init);
}

async function authenticateRequest(req: Request, corsHeaders: Headers): Promise<AuthenticatedContext | Response> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return jsonResponse({ ok: false, error: "missing-token" }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const accessToken = authHeader.slice("bearer ".length).trim();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    console.error("notify-agent:auth-error", error);
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  return { supabase, user: data.user };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function resolveWebhook(
  integration: IntegrationRecord,
  agentId: string,
  preferredChannel?: string,
): { webhookUrl: string; channel: string } | null {
  const settings = asRecord(integration.settings) ?? {};

  const channels = asRecord(settings.channels) as Record<string, unknown> | null;
  if (preferredChannel && channels) {
    const target = channels[preferredChannel];
    if (typeof target === "string") {
      return { webhookUrl: target, channel: preferredChannel };
    }
    const targetRecord = asRecord(target);
    const targetUrl = targetRecord && typeof targetRecord.webhook_url === "string" ? targetRecord.webhook_url : null;
    if (targetUrl) {
      const channelName = typeof targetRecord?.channel === "string" ? targetRecord.channel : preferredChannel;
      return { webhookUrl: targetUrl, channel: channelName };
    }
  }

  const agentRoutes = (asRecord(settings.agent_routes) ?? asRecord(settings.webhooks)) as Record<string, unknown> | null;
  if (agentRoutes) {
    const route = agentRoutes[agentId];
    if (typeof route === "string") {
      return { webhookUrl: route, channel: preferredChannel ?? integration.provider ?? "webhook" };
    }
    const routeRecord = asRecord(route);
    if (routeRecord) {
      const url = typeof routeRecord.webhook_url === "string" ? routeRecord.webhook_url : typeof routeRecord.url === "string"
        ? routeRecord.url
        : null;
      if (url) {
        const channelName = typeof routeRecord.channel === "string"
          ? routeRecord.channel
          : preferredChannel ?? integration.provider ?? "webhook";
        return { webhookUrl: url, channel: channelName };
      }
    }
  }

  const directUrl = typeof settings.webhook_url === "string" ? settings.webhook_url : null;
  if (directUrl) {
    return { webhookUrl: directUrl, channel: preferredChannel ?? integration.provider ?? "webhook" };
  }

  return null;
}

async function resolveOrganizationId(
  supabase: SupabaseClient,
  fallbackUserId: string,
  explicitOrganizationId?: string,
  context?: Record<string, unknown>,
) {
  if (explicitOrganizationId && explicitOrganizationId.length > 0) {
    return explicitOrganizationId;
  }
  const contextOrg = context && typeof context["organization_id"] === "string"
    ? (context["organization_id"] as string)
    : null;
  if (contextOrg) {
    return contextOrg;
  }
  const { data, error } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", fallbackUserId)
    .maybeSingle();

  if (error) {
    console.error("notify-agent:user-lookup-error", error);
    return null;
  }

  return data?.organization_id ?? null;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = createCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method-not-allowed" }, { status: 405, headers: corsHeaders });
  }

  let payload: NotifyAgentRequest;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("notify-agent:invalid-json", error);
    return jsonResponse({ ok: false, error: "invalid-json" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload.agent_id !== "string" || typeof payload.message !== "string") {
    return jsonResponse({ ok: false, error: "missing-fields" }, { status: 400, headers: corsHeaders });
  }

  const authContext = await authenticateRequest(req, corsHeaders);
  if (authContext instanceof Response) {
    return authContext;
  }

  const { supabase, user } = authContext;
  const organizationId = await resolveOrganizationId(supabase, user.id, payload.organization_id, payload.context);

  if (!organizationId) {
    return jsonResponse({ ok: false, error: "missing-organization" }, { status: 400, headers: corsHeaders });
  }

  console.log(JSON.stringify({ event: "notify-agent:start", payload: { ...payload, organization_id: organizationId } }));

  const { data: integrations, error: integrationsError } = await supabase
    .from("integrations")
    .select("id, provider, status, settings, organization_id")
    .eq("status", "connected")
    .or(`organization_id.eq.${organizationId},organization_id.is.null`);

  if (integrationsError) {
    console.error("notify-agent:integration-error", integrationsError);
    return jsonResponse({ ok: false, error: "failed-to-load-integrations" }, { status: 500, headers: corsHeaders });
  }

  const integrationRecords = (integrations ?? []) as IntegrationRecord[];

  let selected: { integration: IntegrationRecord; webhookUrl: string; channel: string } | null = null;
  for (const integration of integrationRecords) {
    const resolved = resolveWebhook(integration, payload.agent_id, payload.channel);
    if (resolved) {
      selected = { integration, ...resolved };
      break;
    }
  }

  let deliveryStatus: "sent" | "failed" | "skipped" = "skipped";
  let httpStatus: number | null = null;
  let deliveryError: string | null = null;

  if (selected) {
    try {
      const response = await fetch(selected.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: payload.agent_id,
          message: payload.message,
          context: payload.context ?? {},
          channel: selected.channel,
        }),
      });
      httpStatus = response.status;
      deliveryStatus = response.ok ? "sent" : "failed";
      if (!response.ok) {
        deliveryError = await response.text();
      }
    } catch (error) {
      deliveryStatus = "failed";
      deliveryError = (error as Error).message;
    }
  }

  const analyticsInsert = await supabase.from("analytics_events").insert({
    organization_id: organizationId,
    user_id: user.id,
    event_type: "agent_notification",
    entity_type: "agent",
    entity_id: payload.agent_id,
    metadata: {
      message: payload.message,
      channel: payload.channel ?? selected?.channel ?? null,
      delivered: deliveryStatus === "sent",
      delivery_status: deliveryStatus,
      http_status: httpStatus,
      integration_id: selected?.integration.id ?? null,
      error: deliveryError,
      context: payload.context ?? {},
    },
  });

  if (analyticsInsert.error) {
    console.error("notify-agent:analytics-error", analyticsInsert.error);
  }

  console.log(JSON.stringify({
    event: "notify-agent:complete",
    delivery_status: deliveryStatus,
    integration_id: selected?.integration.id ?? null,
    http_status: httpStatus,
  }));

  const statusCode = deliveryStatus === "failed" ? 502 : 200;
  return jsonResponse(
    {
      ok: deliveryStatus !== "failed",
      delivery_status: deliveryStatus,
      http_status: httpStatus,
      integration_id: selected?.integration.id ?? null,
      error: deliveryError,
    },
    { status: statusCode, headers: corsHeaders },
  );
});
