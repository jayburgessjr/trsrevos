import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type ClientHealthRequest = {
  organization_id: string;
  triggered_by?: string | null;
};

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function createSupabaseClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

async function resolveOrganizationUsers(supabase: ReturnType<typeof createSupabaseClient>, organizationId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("organization_id", organizationId);

  if (error) {
    throw error;
  }

  return data?.map((row) => row.id) ?? [];
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

  let payload: ClientHealthRequest | null = null;

  try {
    payload = (await req.json()) as ClientHealthRequest;
  } catch (error) {
    console.error("client-health-sync:invalid-json", error);
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  if (!payload?.organization_id) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing-organization" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const supabase = createSupabaseClient();

  try {
    const userIds = await resolveOrganizationUsers(supabase, payload.organization_id);
    if (userIds.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, processed: 0, message: "no-users" }),
        { status: 200, headers: JSON_HEADERS },
      );
    }

    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, health, churn_risk")
      .in("owner_id", userIds);

    if (clientsError) {
      throw clientsError;
    }

    const snapshotDate = new Date().toISOString().slice(0, 10);

    const rows = (clients ?? []).map((client) => {
      const health = typeof client.health === "number" ? client.health : null;
      const churn = typeof client.churn_risk === "number" ? client.churn_risk : null;
      const trsScore = health != null && churn != null ? Math.round((health + (100 - churn)) / 2) : null;

      return {
        client_id: client.id,
        snapshot_date: snapshotDate,
        health,
        churn_risk: churn,
        trs_score: trsScore,
        notes: "Synced via client-health-sync edge function",
      };
    });

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("client_health_history")
        .insert(rows);

      if (insertError) {
        throw insertError;
      }
    }

    await supabase.from("analytics_events").insert({
      organization_id: payload.organization_id,
      user_id: payload.triggered_by ?? null,
      event_key: "client.health.synced",
      payload: {
        processed: rows.length,
        snapshot_date: snapshotDate,
      },
    });

    return new Response(
      JSON.stringify({ ok: true, processed: rows.length }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (error) {
    console.error("client-health-sync:error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "sync-failed" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
