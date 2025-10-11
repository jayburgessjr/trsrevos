import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type MorningBriefRequest = {
  user_id: string;
  organization_id: string;
  time_horizon?: string;
};

type MorningBriefSummary = {
  date: string;
  momentum: "accelerating" | "steady" | "rebuilding";
  summary: {
    pipeline_change: string;
    win_rate: string;
    invoices_sent: number;
    focus_sessions: number;
  };
  priorities: Array<{ title: string; type: string; context?: string }>;
};

type OpportunityRecord = {
  id: string;
  name: string;
  amount: number | null;
  stage: string | null;
  probability: number | null;
  updated_at: string | null;
  close_date?: string | null;
  client_id?: string | null;
};

type ClientRecord = {
  id: string;
  name: string;
  health: number | null;
  churn_risk: number | null;
};

type ProjectRecord = {
  id: string;
  name: string;
  progress: number | null;
  status: string | null;
  due_date: string | null;
  client_id: string | null;
};

type FocusSessionCount = {
  count: number | null;
};

type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: User;
};

const ALLOWED_ORIGINS = new Set([
  "https://trsrevos.vercel.app",
  "http://localhost:3000",
]);

const USD_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

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

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function formatCurrencyDelta(delta: number) {
  const sign = delta >= 0 ? "+" : "-";
  const absolute = Math.abs(delta);
  if (absolute === 0) {
    return "+$0";
  }
  const formatted = USD_COMPACT.format(absolute).replace("US$", "$");
  return `${sign}${formatted}`;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value * 100)}%`;
}

function sumAmounts(records: Array<{ amount: number | null | undefined }>) {
  return records.reduce((total, record) => total + (typeof record.amount === "number" ? record.amount : 0), 0);
}

function deriveMomentum(pipelineDelta: number, focusSessions: number, winRate: number) {
  if (pipelineDelta > 5000 && focusSessions >= 2 && winRate >= 0.6) {
    return "accelerating" as const;
  }
  if (pipelineDelta < -2500 || winRate < 0.4) {
    return "rebuilding" as const;
  }
  return "steady" as const;
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
  const { data: userResult, error } = await supabase.auth.getUser(accessToken);
  if (error || !userResult?.user) {
    console.error("morning-brief:auth-error", error);
    return jsonResponse({ ok: false, error: "unauthorized" }, { status: 401, headers: corsHeaders });
  }

  return { supabase, user: userResult.user };
}

function selectTopPriorities(options: {
  pipeline: OpportunityRecord[];
  clients: ClientRecord[];
  projects: ProjectRecord[];
}) {
  const priorities: Array<{ title: string; type: string; context?: string }> = [];

  const sortedPipeline = options.pipeline
    .filter((deal) => deal.stage && !["ClosedWon", "ClosedLost"].includes(deal.stage))
    .sort((a, b) => (Number(b.amount ?? 0) || 0) - (Number(a.amount ?? 0) || 0));
  if (sortedPipeline.length > 0) {
    const topDeal = sortedPipeline[0];
    const probability = typeof topDeal.probability === "number" ? `${topDeal.probability}%` : "";
    priorities.push({
      title: `Advance ${topDeal.name}`,
      type: "Pipeline",
      context: probability ? `Probability ${probability}` : undefined,
    });
  }

  const stressedClients = options.clients
    .filter((client) => typeof client.health === "number" || typeof client.churn_risk === "number")
    .map((client) => ({
      client,
      riskScore: Math.max(
        100 - (typeof client.health === "number" ? client.health : 100),
        typeof client.churn_risk === "number" ? client.churn_risk : 0,
      ),
    }))
    .filter((entry) => entry.riskScore >= 30)
    .sort((a, b) => b.riskScore - a.riskScore);
  if (stressedClients.length > 0) {
    const { client, riskScore } = stressedClients[0];
    priorities.push({
      title: `Stabilize ${client.name}`,
      type: "Client",
      context: `Risk score ${Math.round(riskScore)}`,
    });
  }

  const activeProjects = options.projects
    .filter((project) => project.status === "Active")
    .sort((a, b) => (Number(a.progress ?? 100) || 100) - (Number(b.progress ?? 100) || 100));
  if (activeProjects.length > 0) {
    const project = activeProjects[0];
    const dueContext = project.due_date ? `Due ${project.due_date}` : undefined;
    const progressContext = typeof project.progress === "number" ? `Progress ${project.progress}%` : undefined;
    priorities.push({
      title: `Unblock ${project.name}`,
      type: "Projects",
      context: dueContext ?? progressContext,
    });
  }

  return priorities.slice(0, 3);
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

  let payload: MorningBriefRequest;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("morning-brief:invalid-json", error);
    return jsonResponse({ ok: false, error: "invalid-json" }, { status: 400, headers: corsHeaders });
  }

  if (!payload || typeof payload.user_id !== "string" || typeof payload.organization_id !== "string") {
    return jsonResponse({ ok: false, error: "missing-fields" }, { status: 400, headers: corsHeaders });
  }

  const authContext = await authenticateRequest(req, corsHeaders);
  if (authContext instanceof Response) {
    return authContext;
  }

  const { supabase } = authContext;
  const today = startOfDay(new Date());
  const yesterday = addDays(today, -1);
  const thirtyDaysAgo = addDays(today, -30);
  const tomorrow = addDays(today, 1);

  const todayIso = today.toISOString();
  const yesterdayIso = yesterday.toISOString();
  const tomorrowIso = tomorrow.toISOString();
  const todayDate = todayIso.slice(0, 10);
  const tomorrowDate = tomorrowIso.slice(0, 10);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  console.log(JSON.stringify({ event: "morning-brief:start", payload }));

  const [{ data: clients, error: clientsError }, { data: pipelineDeals, error: pipelineError }, { data: openPipeline, error: openPipelineError }, { data: projects, error: projectsError }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id, name, health, churn_risk")
        .eq("owner_id", payload.user_id),
      supabase
        .from("opportunities")
        .select("id, name, amount, stage, probability, updated_at, client_id")
        .eq("owner_id", payload.user_id)
        .gte("updated_at", yesterdayIso),
      supabase
        .from("opportunities")
        .select("id, name, amount, stage, probability, updated_at, client_id")
        .eq("owner_id", payload.user_id)
        .not("stage", "in", "(ClosedWon,ClosedLost)"),
      supabase
        .from("projects")
        .select("id, name, progress, status, due_date, client_id")
        .eq("owner_id", payload.user_id),
    ]);

  if (clientsError || pipelineError || openPipelineError || projectsError) {
    console.error("morning-brief:query-error", { clientsError, pipelineError, openPipelineError, projectsError });
    return jsonResponse({ ok: false, error: "failed-to-load-data" }, { status: 500, headers: corsHeaders });
  }

  const clientIds = (clients ?? []).map((client) => client.id);

  const invoicesPromise = clientIds.length
    ? supabase
        .from("invoices")
        .select("id", { count: "exact", head: true })
        .in("client_id", clientIds)
        .eq("status", "sent")
        .gte("issue_date", todayDate)
        .lt("issue_date", tomorrowDate)
    : Promise.resolve({ count: 0, error: null } as FocusSessionCount & { error: null });

  const focusSessionsPromise = supabase
    .from("focus_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", payload.user_id)
    .gte("started_at", todayIso)
    .lt("started_at", tomorrowIso);

  const winRatePromise = supabase
    .from("opportunities")
    .select("id, stage, created_at, close_date")
    .eq("owner_id", payload.user_id)
    .gte("updated_at", thirtyDaysAgoIso)
    .in("stage", ["ClosedWon", "ClosedLost"]);

  const [{ count: invoicesSent = 0, error: invoicesError }, { count: focusSessions = 0, error: focusSessionsError }, { data: closedDeals, error: closedDealsError }] =
    await Promise.all([invoicesPromise, focusSessionsPromise, winRatePromise]);

  if (invoicesError || focusSessionsError || closedDealsError) {
    console.error("morning-brief:aggregate-error", { invoicesError, focusSessionsError, closedDealsError });
    return jsonResponse({ ok: false, error: "aggregate-failed" }, { status: 500, headers: corsHeaders });
  }

  const pipelineData = pipelineDeals ?? [];
  const openData = openPipeline ?? [];
  const projectsData = projects ?? [];
  const clientsData = clients ?? [];

  const todaysPipeline = pipelineData.filter((deal) => (deal.updated_at ?? "") >= todayIso);
  const yesterdaysPipeline = pipelineData.filter((deal) => (deal.updated_at ?? "") < todayIso);

  const pipelineDelta = sumAmounts(todaysPipeline) - sumAmounts(yesterdaysPipeline);
  const winRateData = closedDeals ?? [];
  const wins = winRateData.filter((deal) => deal.stage === "ClosedWon").length;
  const losses = winRateData.filter((deal) => deal.stage === "ClosedLost").length;
  const winRate = wins + losses === 0 ? 0 : wins / (wins + losses);

  const momentum = deriveMomentum(pipelineDelta, focusSessions ?? 0, winRate);
  let priorities = selectTopPriorities({ pipeline: openData, clients: clientsData, projects: projectsData });
  const fallbackPriorities = [
    { title: "Review pipeline commitments", type: "Pipeline" },
    { title: "Check finance run-rate", type: "Finance" },
    { title: "Plan focus blocks", type: "Projects" },
  ];
  for (const fallback of fallbackPriorities) {
    if (priorities.length >= 3) break;
    priorities.push({ title: fallback.title, type: fallback.type });
  }

  const response: MorningBriefSummary = {
    date: todayDate,
    momentum,
    summary: {
      pipeline_change: formatCurrencyDelta(pipelineDelta),
      win_rate: formatPercent(winRate),
      invoices_sent: invoicesSent ?? 0,
      focus_sessions: focusSessions ?? 0,
    },
    priorities,
  };

  console.log(JSON.stringify({ event: "morning-brief:complete", response }));

  return jsonResponse(response, { status: 200, headers: corsHeaders });
});
