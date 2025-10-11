import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const QUICKBOOKS_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QUICKBOOKS_BASE_URL = Deno.env.get("QUICKBOOKS_BASE_URL") ?? "https://sandbox-quickbooks.api.intuit.com";

type QuickBooksSyncRequest = {
  organizationId?: string;
  maxInvoices?: number;
};

type IntegrationRecord = {
  id: string;
  organization_id: string | null;
  status: string;
  settings: Record<string, unknown>;
};

type QuickBooksSettings = {
  refresh_token?: string;
  access_token?: string;
  expires_at?: string;
  realm_id?: string;
  default_client_id?: string;
  client_map?: Record<string, string>;
};

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

function needsRefresh(settings: QuickBooksSettings) {
  if (!settings.refresh_token) return false;
  if (!settings.access_token || !settings.expires_at) return true;
  const expiresAt = Date.parse(settings.expires_at);
  if (Number.isNaN(expiresAt)) return true;
  const now = Date.now();
  const bufferMs = 5 * 60 * 1000;
  return expiresAt - bufferMs <= now;
}

async function refreshQuickBooksAccessToken(refreshToken: string) {
  const clientId = getRequiredEnv("QUICKBOOKS_CLIENT_ID");
  const clientSecret = getRequiredEnv("QUICKBOOKS_CLIENT_SECRET");
  const basic = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(QUICKBOOKS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to refresh QuickBooks token: ${response.status} ${errorBody}`);
  }

  const json = await response.json();
  return {
    accessToken: json.access_token as string,
    refreshToken: (json.refresh_token as string | undefined) ?? refreshToken,
    expiresAt: json.expires_in
      ? new Date(Date.now() + Number(json.expires_in) * 1000).toISOString()
      : undefined,
  };
}

function mapPaymentTerm(term?: string) {
  if (!term) return null;
  const normalized = term.toLowerCase();
  if (normalized.includes("net 15")) return "Net 15";
  if (normalized.includes("net 30")) return "Net 30";
  if (normalized.includes("net 60")) return "Net 60";
  if (normalized.includes("net 90")) return "Net 90";
  if (normalized.includes("receipt")) return "Due on Receipt";
  return null;
}

function mapStatus(balance: number | null | undefined, dueDate: string | undefined, total: number | null | undefined) {
  if (typeof total === "number" && total <= 0) {
    return "Draft";
  }
  if (typeof balance === "number" && balance <= 0) {
    return "Paid";
  }
  if (dueDate) {
    const due = Date.parse(dueDate);
    if (!Number.isNaN(due) && due < Date.now()) {
      return "Overdue";
    }
  }
  return "Sent";
}

async function fetchInvoices(accessToken: string, realmId: string, limit: number) {
  const query = encodeURIComponent(`select * from Invoice maxresults ${limit}`);
  const response = await fetch(
    `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/query?query=${query}&minorversion=70`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch QuickBooks invoices: ${response.status} ${errorBody}`);
  }

  const json = await response.json() as {
    QueryResponse?: {
      Invoice?: Array<Record<string, unknown>>;
    };
  };

  return json.QueryResponse?.Invoice ?? [];
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

  let payload: QuickBooksSyncRequest = {};
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

  const filter = supabase
    .from("integrations")
    .select("id, organization_id, status, settings")
    .eq("provider", "quickbooks");

  if (payload.organizationId) {
    filter.eq("organization_id", payload.organizationId);
  }

  const { data: integrations, error: integrationsError } = await filter;

  if (integrationsError) {
    console.error("quickbooks-sync: failed to load integrations", integrationsError);
    return new Response(JSON.stringify({ error: "Failed to load integrations" }), {
      status: 500,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  if (!integrations || integrations.length === 0) {
    return new Response(JSON.stringify({ ok: true, processed: 0, invoices: 0 }), {
      status: 200,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
  }

  let processed = 0;
  let inserted = 0;

  for (const integration of integrations as IntegrationRecord[]) {
    processed += 1;
    const settings = (integration.settings ?? {}) as QuickBooksSettings;

    if (!settings.refresh_token || !settings.realm_id) {
      console.warn(`quickbooks-sync: integration ${integration.id} missing refresh_token or realm_id`);
      continue;
    }

    let accessToken = settings.access_token ?? "";
    let expiresAt = settings.expires_at ?? null;

    if (needsRefresh(settings)) {
      try {
        const refreshed = await refreshQuickBooksAccessToken(settings.refresh_token);
        accessToken = refreshed.accessToken;
        expiresAt = refreshed.expiresAt ?? expiresAt;

        const { error: updateError } = await supabase
          .from("integrations")
          .update({
            settings: {
              ...settings,
              access_token: accessToken,
              refresh_token: refreshed.refreshToken,
              expires_at: expiresAt,
            },
          })
          .eq("id", integration.id);

        if (updateError) {
          console.error("quickbooks-sync: failed to persist refreshed token", updateError);
        } else {
          settings.access_token = accessToken;
          settings.refresh_token = refreshed.refreshToken;
          settings.expires_at = expiresAt ?? undefined;
        }
      } catch (error) {
        console.error(`quickbooks-sync: refresh failed for ${integration.id}`, error);
        await supabase
          .from("integrations")
          .update({
            status: "error",
            settings: { ...settings, last_error: (error as Error).message },
            updated_at: new Date().toISOString(),
          })
          .eq("id", integration.id);
        continue;
      }
    }

    if (!accessToken) {
      console.warn(`quickbooks-sync: integration ${integration.id} missing access token`);
      continue;
    }

    let invoices: Array<Record<string, unknown>> = [];
    try {
      invoices = await fetchInvoices(accessToken, settings.realm_id, Math.min(payload.maxInvoices ?? 50, 1000));
    } catch (error) {
      console.error(`quickbooks-sync: invoice fetch failed for ${integration.id}`, error);
      await supabase
        .from("integrations")
        .update({
          status: "error",
          settings: { ...settings, last_error: (error as Error).message },
          updated_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
      continue;
    }

    if (invoices.length === 0) {
      await supabase
        .from("integrations")
        .update({
          status: "connected",
          last_synced_at: new Date().toISOString(),
          settings: { ...settings, last_sync_count: 0 },
        })
        .eq("id", integration.id);
      continue;
    }

    const defaultClientId = settings.default_client_id ?? null;
    const clientMap = settings.client_map ?? {};

    const records = invoices
      .map((invoice) => {
        const qb = invoice as Record<string, unknown>;
        const customerRef = (qb.CustomerRef as { value?: string } | undefined)?.value ?? null;
        const mappedClientId = (customerRef && clientMap[customerRef]) || defaultClientId;
        if (!mappedClientId) {
          return null;
        }

        const docNumber = (qb.DocNumber as string | undefined) ?? (qb.Id as string | undefined) ?? crypto.randomUUID();
        const txnDate = qb.TxnDate as string | undefined;
        const dueDate = (qb.DueDate as string | undefined) ?? txnDate;
        const total = typeof qb.TotalAmt === "number" ? qb.TotalAmt : Number(qb.TotalAmt ?? 0);
        const balance = typeof qb.Balance === "number" ? qb.Balance : Number(qb.Balance ?? 0);
        const taxDetail = qb.TxnTaxDetail as { TotalTax?: number } | undefined;
        const privateNote = qb.PrivateNote as string | undefined;
        const salesTerm = (qb.SalesTermRef as { name?: string } | undefined)?.name;

        return {
          invoice_number: docNumber,
          client_id: mappedClientId,
          status: mapStatus(balance, dueDate, total),
          issue_date: txnDate ?? null,
          due_date: dueDate ?? null,
          paid_date: balance <= 0 ? (qb.LastPaymentDate as string | undefined) ?? null : null,
          amount: total,
          tax: taxDetail?.TotalTax ?? 0,
          total: total,
          payment_term: mapPaymentTerm(salesTerm),
          notes: privateNote ?? null,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
      })
      .filter((record): record is {
        invoice_number: string;
        client_id: string;
        status: string;
        issue_date: string | null;
        due_date: string | null;
        paid_date: string | null;
        amount: number;
        tax: number;
        total: number;
        payment_term: string | null;
        notes: string | null;
        updated_at: string;
        created_at: string;
      } => Boolean(record));

    if (records.length === 0) {
      console.warn(`quickbooks-sync: no mappable invoices for integration ${integration.id}`);
    } else {
      const { error: upsertError } = await supabase.from("invoices").upsert(records, {
        onConflict: "invoice_number",
        ignoreDuplicates: false,
      });

      if (upsertError) {
        console.error("quickbooks-sync: failed to upsert invoices", upsertError);
      } else {
        inserted += records.length;
      }
    }

    await supabase
      .from("integrations")
      .update({
        status: "connected",
        last_synced_at: new Date().toISOString(),
        settings: {
          ...settings,
          access_token: accessToken,
          expires_at: expiresAt,
          last_sync_count: records.length,
        },
      })
      .eq("id", integration.id);

    if (records.length > 0) {
      const analytics = records.map((record) => ({
        organization_id: integration.organization_id,
        event_type: "quickbooks_sync",
        entity_type: "invoice",
        entity_id: record.invoice_number,
        metadata: {
          amount: record.amount,
          status: record.status,
          due_date: record.due_date,
        },
      }));

      const { error: analyticsError } = await supabase
        .from("analytics_events")
        .upsert(analytics, { onConflict: "entity_id, entity_type" });

      if (analyticsError) {
        console.error("quickbooks-sync: failed to insert analytics events", analyticsError);
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, processed, invoices: inserted }),
    {
      status: 200,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    },
  );
});
