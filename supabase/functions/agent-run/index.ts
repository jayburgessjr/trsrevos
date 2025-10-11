import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type AgentRunRequest = {
  agent_key: string;
  user_id: string;
  organization_id: string;
  payload?: Record<string, unknown>;
};

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
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

  let payload: AgentRunRequest | null = null;
  try {
    payload = (await req.json()) as AgentRunRequest;
  } catch (error) {
    console.error("agent-run:invalid-json", error);
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  if (!payload?.agent_key || !payload?.user_id || !payload?.organization_id) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing-required-fields" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const supabase = createSupabaseClient();

  try {
    const startedAt = new Date().toISOString();

    const { data: run, error: insertError } = await supabase
      .from("agent_runs")
      .insert({
        agent_key: payload.agent_key,
        user_id: payload.user_id,
        organization_id: payload.organization_id,
        payload: payload.payload ?? {},
        started_at: startedAt,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const completedAt = new Date().toISOString();
    const summary = `Agent ${payload.agent_key} executed via edge function stub.`;
    const result = {
      ok: true,
      summary,
      data: {
        notes: "Replace with real agent orchestration pipeline.",
      },
    };

    const { error: updateError } = await supabase
      .from("agent_runs")
      .update({
        result,
        completed_at: completedAt,
      })
      .eq("id", run?.id);

    if (updateError) throw updateError;

    await supabase.from("analytics_events").insert({
      organization_id: payload.organization_id,
      user_id: payload.user_id,
      event_key: "agent.run.completed",
      payload: {
        agent_key: payload.agent_key,
        run_id: run?.id ?? null,
      },
    });

    return new Response(
      JSON.stringify({ ok: true, run_id: run?.id ?? null, summary }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (error) {
    console.error("agent-run:error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "run-failed" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
