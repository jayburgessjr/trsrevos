import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type DashboardRefreshRequest = {
  organization_id: string;
  time_scope?: string;
  segment_filter?: Record<string, unknown>;
};

type DashboardMetrics = {
  total_mrr: number;
  deal_velocity_days: number;
  average_project_progress: number;
};

type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
};

type ClientRecord = {
  arr: number | null;
  owner_id: string | null;
};

type OpportunityRecord = {
  created_at: string | null;
  close_date: string | null;
  stage: string | null;
  owner_id: string | null;
};

type ProjectRecord = {
  progress: number | null;
  status: string | null;
  owner_id: string | null;
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
    console.error("dashboard-refresh:auth-error", error);
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  return { supabase, user: data.user };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function daysBetween(start: string | null, end: string | null) {
  if (!start || !end) return null;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
  const diffMs = endMs - startMs;
  return diffMs > 0 ? diffMs / (1000 * 60 * 60 * 24) : null;
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

  let payload: DashboardRefreshRequest;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("dashboard-refresh:invalid-json", error);
    return jsonResponse({ ok: false, error: "invalid-json" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload.organization_id !== "string") {
    return jsonResponse({ ok: false, error: "missing-organization" }, { status: 400, headers: corsHeaders });
  }

  const authContext = await authenticateRequest(req, corsHeaders);
  if (authContext instanceof Response) {
    return authContext;
  }

  const { supabase } = authContext;
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 90);
  const ninetyDaysAgoIso = ninetyDaysAgo.toISOString();

  console.log(JSON.stringify({ event: "dashboard-refresh:start", payload }));

  const { data: orgUsers, error: orgUsersError } = await supabase
    .from("users")
    .select("id")
    .eq("organization_id", payload.organization_id);

  if (orgUsersError) {
    console.error("dashboard-refresh:users-error", orgUsersError);
    return jsonResponse({ ok: false, error: "failed-to-load-users" }, { status: 500, headers: corsHeaders });
  }

  const userIds = (orgUsers ?? []).map((user) => user.id);

  const clientsPromise = userIds.length
    ? supabase
        .from("clients")
        .select("arr, owner_id")
        .in("owner_id", userIds)
    : supabase
        .from("clients")
        .select("arr, owner_id")
        .eq("owner_id", "00000000-0000-0000-0000-000000000000")
        .limit(0);

  const opportunitiesPromise = userIds.length
    ? supabase
        .from("opportunities")
        .select("created_at, close_date, stage, owner_id")
        .in("owner_id", userIds)
        .gte("close_date", ninetyDaysAgoIso.slice(0, 10))
        .in("stage", ["ClosedWon"])
    : supabase
        .from("opportunities")
        .select("created_at, close_date, stage, owner_id")
        .eq("owner_id", "00000000-0000-0000-0000-000000000000")
        .limit(0);

  const projectsPromise = userIds.length
    ? supabase
        .from("projects")
        .select("progress, status, owner_id")
        .in("owner_id", userIds)
        .eq("status", "Active")
    : supabase
        .from("projects")
        .select("progress, status, owner_id")
        .eq("owner_id", "00000000-0000-0000-0000-000000000000")
        .limit(0);

  const [{ data: clients, error: clientsError }, { data: opportunities, error: opportunitiesError }, { data: projects, error: projectsError }] =
    await Promise.all([clientsPromise, opportunitiesPromise, projectsPromise]);

  if (clientsError || opportunitiesError || projectsError) {
    console.error("dashboard-refresh:data-error", { clientsError, opportunitiesError, projectsError });
    return jsonResponse({ ok: false, error: "failed-to-load-metrics" }, { status: 500, headers: corsHeaders });
  }

  const clientData = (clients ?? []) as ClientRecord[];
  const totalArr = clientData.reduce((sum, client) => sum + (typeof client.arr === "number" ? client.arr : 0), 0);
  const totalMrr = Number((totalArr / 12).toFixed(2));

  const opportunityData = (opportunities ?? []) as OpportunityRecord[];
  const velocitySamples = opportunityData
    .map((deal) => daysBetween(deal.created_at, deal.close_date))
    .filter((value): value is number => value !== null);
  const averageVelocity = Number(average(velocitySamples).toFixed(1));

  const projectData = (projects ?? []) as ProjectRecord[];
  const progressSamples = projectData
    .map((project) => (typeof project.progress === "number" ? project.progress : null))
    .filter((value): value is number => value !== null);
  const averageProgress = Number(average(progressSamples).toFixed(1));

  const metrics: DashboardMetrics = {
    total_mrr: totalMrr,
    deal_velocity_days: averageVelocity,
    average_project_progress: averageProgress,
  };

  const insertPayload = {
    organization_id: payload.organization_id,
    time_scope: payload.time_scope ?? "real_time",
    segment_filter: payload.segment_filter ?? {},
    metrics,
  };

  const { data: snapshot, error: snapshotError } = await supabase
    .from("dashboard_snapshots")
    .insert(insertPayload)
    .select("id, computed_at")
    .single();

  if (snapshotError) {
    console.error("dashboard-refresh:insert-error", snapshotError);
    return jsonResponse({ ok: false, error: "failed-to-write-snapshot" }, { status: 500, headers: corsHeaders });
  }

  console.log(JSON.stringify({ event: "dashboard-refresh:complete", metrics, snapshot }));

  return jsonResponse(
    {
      ok: true,
      metrics,
      snapshot,
    },
    { status: 200, headers: corsHeaders },
  );
});
