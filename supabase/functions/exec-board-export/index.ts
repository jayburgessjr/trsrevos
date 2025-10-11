import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

type ExportRequest = {
  organization_id: string;
  user_id?: string | null;
};

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
} as const;

const BUCKET_NAME = "board-exports";

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

async function ensureBucket(client: ReturnType<typeof createSupabaseClient>, bucket: string) {
  const { data } = await client.storage.getBucket(bucket);
  if (!data) {
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: false,
    });
    if (createError) {
      throw createError;
    }
  }
}

function composeDeckContent(payload: ExportRequest) {
  const now = new Date().toISOString();
  const summary = {
    generated_at: now,
    organization_id: payload.organization_id,
    sections: [
      {
        title: "Executive Summary",
        points: [
          "Pipeline coverage at 3.4x",
          "Gross margin steady at 68%",
          "Top risks: Enterprise renewals, partner sourced pipeline",
        ],
      },
      {
        title: "Financial Snapshot",
        metrics: {
          arr: "$8.4M",
          burn: "$420k/mo",
          runway_months: 9,
          net_retention: "112%",
        },
      },
    ],
  } as const;

  const encoder = new TextEncoder();
  const contents = encoder.encode(JSON.stringify(summary, null, 2));
  return contents;
}

function buildObjectPath(payload: ExportRequest) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${payload.organization_id}/exec-dashboard-${timestamp}.json`;
}

async function logAnalytics(
  client: ReturnType<typeof createSupabaseClient>,
  payload: ExportRequest,
  objectPath: string,
) {
  const { error } = await client.from("analytics_events").insert({
    organization_id: payload.organization_id,
    user_id: payload.user_id ?? null,
    event_key: "dashboard.export.edge.generated",
    payload: {
      object_path: objectPath,
      generated_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("exec-board-export:analytics-error", error);
  }
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

  let payload: ExportRequest | null = null;

  try {
    payload = (await req.json()) as ExportRequest;
  } catch (error) {
    console.error("exec-board-export:invalid-json", error);
    return new Response(
      JSON.stringify({ ok: false, error: "invalid-json" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  if (!payload || !payload.organization_id) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing-organization" }),
      { status: 400, headers: JSON_HEADERS },
    );
  }

  const supabase = createSupabaseClient();

  try {
    await ensureBucket(supabase, BUCKET_NAME);

    const objectPath = buildObjectPath(payload);
    const contents = composeDeckContent(payload);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(objectPath, contents, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: signedUrl, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(objectPath, 60 * 5);

    if (signedError || !signedUrl?.signedUrl) {
      throw signedError ?? new Error("missing-signed-url");
    }

    await logAnalytics(supabase, payload, objectPath);

    return new Response(
      JSON.stringify({ ok: true, url: signedUrl.signedUrl, path: objectPath }),
      { status: 200, headers: JSON_HEADERS },
    );
  } catch (error) {
    console.error("exec-board-export:error", error);
    return new Response(
      JSON.stringify({ ok: false, error: "export-failed" }),
      { status: 500, headers: JSON_HEADERS },
    );
  }
});
