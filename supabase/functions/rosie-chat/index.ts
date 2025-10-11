// supabase/functions/rosie-chat/index.ts
// Edge Function: Rosie copilot — streams contextual answers from TRS data.
// ENV required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
// NOTE: We perform read-only queries against public views/tables.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"

type ReqBody = {
  message: string
  userId?: string | null
  organizationId?: string | null
  maxContext?: number
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env vars for rosie-chat")
}

function supabaseForRequest(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.split(" ")[1] : null
  const key = token || SUPABASE_SERVICE_ROLE_KEY!
  return createClient(SUPABASE_URL!, key, { auth: { persistSession: false } })
}

function sanitize(value: unknown, max = 500): string {
  try {
    const str = typeof value === "string" ? value : JSON.stringify(value)
    return str.length > max ? str.slice(0, max) + "…" : str
  } catch {
    return ""
  }
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  }
}

async function fetchContext(req: Request, body: ReqBody) {
  const supabase = supabaseForRequest(req)

  const [{ data: topClientsRaw }, { data: forecastRaw }, { data: eventsRaw }] = await Promise.all([
    supabase
      .from("vw_client_overview")
      .select("client_name, client_type, pipeline_stage, mrr, ar_outstanding, weighted_value")
      .order("mrr", { ascending: false })
      .limit(12),
    supabase
      .from("vw_pipeline_forecast")
      .select(
        "stage, deals, total_value, weighted_value, all_total_value, all_weighted_value",
      ),
    supabase
      .from("analytics_events")
      .select("event_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(30),
  ])

  let mentionClientsRaw: any[] = []
  const tokens = body.message.split(/\s+/).filter((t) => t.length > 2)
  for (const token of tokens.slice(0, 4)) {
    const { data } = await supabase
      .from("vw_client_overview")
      .select("client_name, client_type, pipeline_stage, mrr, ar_outstanding, weighted_value")
      .ilike("client_name", `%${token}%`)
      .limit(6)
    if (data?.length) {
      mentionClientsRaw = data
      break
    }
  }

  const topClients = (topClientsRaw ?? []).map((row) => ({
    name: sanitize(row.client_name, 64),
    type: sanitize(row.client_type, 24),
    stage: sanitize(row.pipeline_stage, 24),
    mrr: Number(row.mrr ?? 0),
    ar: Number(row.ar_outstanding ?? 0),
    weighted: Number(row.weighted_value ?? 0),
  }))

  const forecast = (forecastRaw ?? []).map((row) => ({
    stage: sanitize(row.stage, 24),
    deals: Number(row.deals ?? 0),
    total: Number(row.total_value ?? 0),
    weighted: Number(row.weighted_value ?? 0),
  }))

  const totals = forecastRaw?.[0]
    ? {
        all_total: Number(forecastRaw[0].all_total_value ?? 0),
        all_weighted: Number(forecastRaw[0].all_weighted_value ?? 0),
      }
    : { all_total: 0, all_weighted: 0 }

  const events = (eventsRaw ?? []).map((event) => ({
    type: sanitize(event.event_type, 24),
    entity: sanitize(event.entity_id, 48),
    at: sanitize(event.created_at, 32),
    meta: sanitize(event.metadata, 120),
  }))

  const mentions = (mentionClientsRaw ?? []).map((row) => ({
    name: sanitize(row.client_name, 64),
    stage: sanitize(row.pipeline_stage, 24),
    mrr: Number(row.mrr ?? 0),
    ar: Number(row.ar_outstanding ?? 0),
    weighted: Number(row.weighted_value ?? 0),
  }))

  return { topClients, forecast, totals, events, mentions }
}

function buildContextPayload(
  body: ReqBody,
  context: Awaited<ReturnType<typeof fetchContext>>,
  maxContext: number,
) {
  const payload = {
    org: body.organizationId ?? "unknown",
    user: body.userId ?? "unknown",
    kpis: { totals: context.totals },
    forecast: context.forecast,
    topClients: context.topClients,
    mentions: context.mentions,
    recentEvents: context.events,
  }

  let json = JSON.stringify(payload)
  if (json.length > maxContext) {
    json = JSON.stringify({
      ...payload,
      topClients: payload.topClients.slice(0, 8),
      forecast: payload.forecast.slice(0, 6),
      recentEvents: payload.recentEvents.slice(0, 10),
    })
    if (json.length > maxContext) {
      json = json.slice(0, maxContext - 1) + "}"
    }
  }

  return json
}

function openaiHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  }
}

async function streamOpenAIResponse(systemPrompt: string, userPrompt: string, controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder()
  const model = "gpt-4o-mini"
  const payload = {
    model,
    temperature: 0.2,
    max_tokens: 900,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: openaiHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok || !response.body) {
    const fallbackDetail = await response.text().catch(() => "")
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ error: "openai_error", detail: sanitize(fallbackDetail, 400) })}\n\n`),
    )
    controller.enqueue(encoder.encode("data: [DONE]\n\n"))
    controller.close()
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      if (!value) continue
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith("data:")) continue
        controller.enqueue(encoder.encode(`${trimmed}\n\n`))
      }
    }
  } catch (error) {
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ error: "stream_error", detail: sanitize(error, 200) })}\n\n`),
    )
  } finally {
    controller.enqueue(encoder.encode("data: [DONE]\n\n"))
    controller.close()
  }
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 })
    }

    const body = (await req.json().catch(() => null)) as ReqBody | null
    if (!body || typeof body.message !== "string" || !body.message.trim()) {
      return new Response(JSON.stringify({ error: "Missing 'message' string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const maxContext = Math.min(Math.max(body.maxContext ?? 8000, 3000), 16000)

    const context = await fetchContext(req, body)
    const contextStr = buildContextPayload(body, context, maxContext)

    const systemPrompt = [
      "You are Rosie, the TRS Revenue OS copilot.",
      "Be concise, practical, and action-oriented.",
      "Ground answers in the provided TRS context when relevant.",
      "If insufficient data is available, state what is missing and outline next steps.",
      "Use numbered checklists for plans or multi-step actions.",
    ].join(" ")

    const userPrompt = `Context(JSON, trimmed): ${contextStr}\n\nUser: ${body.message}\nRespond with TRS best practices and next steps.`

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        streamOpenAIResponse(systemPrompt, userPrompt, controller).catch((error) => {
          const encoder = new TextEncoder()
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "exception", detail: sanitize(error, 200) })}\n\n`),
          )
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        })
      },
    })

    return new Response(stream, { headers: sseHeaders() })
  } catch (error) {
    return new Response(JSON.stringify({ error: "internal_error", detail: sanitize(error, 200) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
