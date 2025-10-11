import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type AnalyticsSyncRequest = {
  organization_id?: string;
  since_days?: number;
  limit?: number;
};

type AnalyticsEventRecord = {
  id: string;
  organization_id: string | null;
  event_type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
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
    console.error("analytics-sync:auth-error", error);
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  return { supabase, user: data.user };
}

function clampDays(value: number | undefined) {
  if (!value || Number.isNaN(value)) return 7;
  return Math.min(Math.max(Math.floor(value), 1), 30);
}

function safeMetadata(input: Record<string, unknown> | null) {
  return input ?? {};
}

function detectSeverity(metadata: Record<string, unknown>) {
  const severity = typeof metadata.severity === "string" ? metadata.severity.toLowerCase() : "";
  if (severity === "high" || severity === "critical") return severity;
  return null;
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

  let payload: AnalyticsSyncRequest;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("analytics-sync:invalid-json", error);
    return jsonResponse({ ok: false, error: "invalid-json" }, { status: 400, headers: corsHeaders });
  }

  const authContext = await authenticateRequest(req, corsHeaders);
  if (authContext instanceof Response) {
    return authContext;
  }

  const { supabase } = authContext;
  const sinceDays = clampDays(payload?.since_days);
  const limit = payload?.limit && payload.limit > 0 ? Math.min(payload.limit, 5000) : 2000;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - sinceDays);
  const sinceIso = since.toISOString();

  console.log(JSON.stringify({ event: "analytics-sync:start", payload: { ...payload, since_days: sinceDays, limit } }));

  let query = supabase
    .from("analytics_events")
    .select("id, organization_id, event_type, entity_type, entity_id, metadata, created_at")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (payload?.organization_id) {
    query = query.eq("organization_id", payload.organization_id);
  }

  const { data: events, error } = await query;

  if (error) {
    console.error("analytics-sync:query-error", error);
    return jsonResponse({ ok: false, error: "failed-to-load-events" }, { status: 500, headers: corsHeaders });
  }

  const records = (events ?? []) as AnalyticsEventRecord[];

  const entityMap = new Map<string, { entity_type: string; entity_id: string; count: number; last_event_at: string | null }>();
  const trendMap = new Map<string, Map<string, number>>();
  const anomalies: Array<{ event_type: string; entity_type: string | null; entity_id: string | null; created_at: string | null; reason: string }> = [];

  for (const record of records) {
    const eventType = record.event_type ?? "unknown";
    const entityType = record.entity_type ?? "unknown";
    const entityId = record.entity_id ?? "unknown";
    const key = `${entityType}:${entityId}`;
    const metadata = safeMetadata(record.metadata);

    const existing = entityMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.last_event_at = existing.last_event_at && record.created_at && existing.last_event_at > record.created_at
        ? existing.last_event_at
        : record.created_at;
    } else {
      entityMap.set(key, {
        entity_type: entityType,
        entity_id: entityId,
        count: 1,
        last_event_at: record.created_at,
      });
    }

    const dayKey = (record.created_at ?? "").slice(0, 10);
    if (dayKey) {
      if (!trendMap.has(eventType)) {
        trendMap.set(eventType, new Map<string, number>());
      }
      const eventTrend = trendMap.get(eventType)!;
      eventTrend.set(dayKey, (eventTrend.get(dayKey) ?? 0) + 1);
    }

    const severity = detectSeverity(metadata);
    const lowerType = eventType.toLowerCase();
    if (severity || lowerType.includes("error") || lowerType.includes("alert")) {
      anomalies.push({
        event_type: eventType,
        entity_type: record.entity_type,
        entity_id: record.entity_id,
        created_at: record.created_at,
        reason: severity ? `metadata:${severity}` : `event_type:${eventType}`,
      });
    }
  }

  const topEntities = Array.from(entityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const trends = Array.from(trendMap.entries()).map(([eventType, dateMap]) => ({
    event_type: eventType,
    points: Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1)),
  }));

  const response = {
    ok: true,
    since: sinceIso,
    total_events: records.length,
    top_entities: topEntities,
    trends,
    anomalies: anomalies.slice(0, 10),
  };

  console.log(JSON.stringify({ event: "analytics-sync:complete", totals: { events: records.length, top_entities: topEntities.length } }));

  return jsonResponse(response, { status: 200, headers: corsHeaders });
});
