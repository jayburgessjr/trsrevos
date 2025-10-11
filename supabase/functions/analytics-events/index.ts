import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type AnalyticsPayload = {
  organization_id: string;
  user_id: string | null;
  event_key: string;
  payload?: Record<string, unknown>;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
} as const;

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function parseBody(body: unknown): AnalyticsPayload | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  if (typeof record.organization_id !== "string" || typeof record.event_key !== "string") {
    return null;
  }

  return {
    organization_id: record.organization_id,
    user_id: typeof record.user_id === "string" ? record.user_id : null,
    event_key: record.event_key,
    payload: (record.payload as Record<string, unknown>) ?? {},
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ ok: false, error: "method-not-allowed" }),
      { status: 405, headers: JSON_HEADERS },
    );
  }

  let payload: AnalyticsPayload | null = null;

  try {
    const body = await req.json();
    payload = parseBody(body);
  } catch (error) {
    console.error("analytics-events:invalid-json", error);
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  if (!payload) {
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-payload" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const supabase = createSupabaseClient();
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from("analytics_events")
    .insert({
      organization_id: payload.organization_id,
      user_id: payload.user_id,
      event_key: payload.event_key,
      payload: {
        ...payload.payload,
        received_at: timestamp,
      },
      occurred_at: timestamp,
    })
    .select("id")
    .single();

  if (error) {
    console.error("analytics-events:insert-error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "insert-failed" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, id: data?.id ?? null }),
    { status: 200, headers: JSON_HEADERS },
  );
});
