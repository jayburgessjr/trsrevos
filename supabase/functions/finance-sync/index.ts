import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type FinanceSyncRequest = {
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
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

async function resolveOrganizationUserIds(
  supabase: ReturnType<typeof createSupabaseClient>,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("organization_id", organizationId);

  if (error) throw error;
  return data?.map((row) => row.id) ?? [];
}

async function resolveClientIds(
  supabase: ReturnType<typeof createSupabaseClient>,
  ownerIds: string[],
) {
  if (ownerIds.length === 0) return [] as string[];
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .in("owner_id", ownerIds);
  if (error) throw error;
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

  let payload: FinanceSyncRequest | null = null;
  try {
    payload = (await req.json()) as FinanceSyncRequest;
  } catch (error) {
    console.error("finance-sync:invalid-json", error);
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
    const userIds = await resolveOrganizationUserIds(supabase, payload.organization_id);
    const clientIds = await resolveClientIds(supabase, userIds);

    const invoiceQuery = supabase.from("invoices").select("status, total, amount, due_date, paid_date");
    if (clientIds.length > 0) {
      invoiceQuery.in("client_id", clientIds);
    }

    const { data: invoices, error: invoicesError } = await invoiceQuery;
    if (invoicesError) throw invoicesError;

    const { data: cashFlowEntries } = await supabase
      .from("cash_flow_entries")
      .select("type, amount")
      .order("date", { ascending: false })
      .limit(50);

    const outstanding = (invoices ?? []).filter((invoice) => invoice.status !== "Paid");
    const collected = (invoices ?? []).filter((invoice) => invoice.status === "Paid");

    const outstandingTotal = outstanding.reduce((sum, invoice) => sum + Number(invoice.total ?? invoice.amount ?? 0), 0);
    const collectedTotal = collected.reduce((sum, invoice) => sum + Number(invoice.total ?? invoice.amount ?? 0), 0);

    const inflows = (cashFlowEntries ?? [])
      .filter((entry) => entry.type === "Inflow")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
    const outflows = (cashFlowEntries ?? [])
      .filter((entry) => entry.type === "Outflow")
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);

    await supabase.from("analytics_events").insert({
      organization_id: payload.organization_id,
      user_id: payload.triggered_by ?? null,
      event_key: "finance.sync.completed",
      payload: {
        invoices_processed: invoices?.length ?? 0,
        outstanding_total: outstandingTotal,
        collected_total: collectedTotal,
        net_cash_flow: inflows - outflows,
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        invoices_processed: invoices?.length ?? 0,
        outstanding_total: outstandingTotal,
        collected_total: collectedTotal,
        net_cash_flow: inflows - outflows,
      }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (error) {
    console.error("finance-sync:error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "sync-failed" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
