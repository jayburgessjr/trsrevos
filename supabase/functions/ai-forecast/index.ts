import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0?dts";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

type ForecastRequest = {
  organizationId?: string;
  history: number[];
  horizon?: number;
  notes?: string;
};

type ForecastResult = {
  forecast: number[];
  confidence: number;
  analysis: string;
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

function buildPrompt(input: ForecastRequest) {
  const history = input.history.map((value, index) => ({ period: index + 1, value }));
  const horizon = input.horizon ?? 4;
  const notes = input.notes?.trim() ?? "None";

  return [
    "You are the TRS revenue forecasting analyst.",
    "Generate a JSON object with keys forecast (number array), confidence (0-1), and analysis (short string).",
    `History: ${JSON.stringify(history)}`,
    `Forecast periods: ${horizon}`,
    `Context: ${notes}`,
    "Return only JSON with no additional commentary.",
  ].join("\n");
}

function fallbackForecast(input: ForecastRequest): ForecastResult {
  const history = input.history;
  const horizon = input.horizon ?? 4;
  if (history.length === 0) {
    return { forecast: new Array(horizon).fill(0), confidence: 0.25, analysis: "No historical data provided; baseline forecast is zero." };
  }

  const deltas = [] as number[];
  for (let i = 1; i < history.length; i += 1) {
    deltas.push(history[i] - history[i - 1]);
  }
  const avgDelta = deltas.length > 0 ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 0;
  const last = history[history.length - 1];
  const forecast: number[] = [];

  for (let i = 0; i < horizon; i += 1) {
    const next = (forecast[i - 1] ?? last) + avgDelta;
    forecast.push(Number(next.toFixed(2)));
  }

  return {
    forecast,
    confidence: 0.4,
    analysis: "Linear projection using recent trend due to unavailable AI provider.",
  };
}

function tryParseForecast(raw: string): ForecastResult | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ForecastResult>;
    if (!parsed.forecast || !Array.isArray(parsed.forecast)) return null;
    if (typeof parsed.confidence !== "number") return null;
    if (typeof parsed.analysis !== "string") return null;
    return {
      forecast: parsed.forecast.map((value) => Number(value)),
      confidence: Math.max(0, Math.min(parsed.confidence, 1)),
      analysis: parsed.analysis,
    };
  } catch (_error) {
    return null;
  }
}

async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        { role: "system", content: "You generate structured forecasts for TRS RevOS." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI forecast failed: ${response.status} ${errorBody}`);
  }

  const json = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response missing content");
  }

  return content.trim();
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        safetySettings: [
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini forecast failed: ${response.status} ${errorBody}`);
  }

  const json = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini response missing content");
  }

  return text.trim();
}

async function generateForecast(input: ForecastRequest): Promise<ForecastResult> {
  const prompt = buildPrompt(input);
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  const providers = [
    { name: "openai", key: openAiKey, fn: callOpenAI },
    { name: "gemini", key: geminiKey, fn: callGemini },
  ];

  for (const provider of providers) {
    if (!provider.key) continue;
    try {
      const raw = await provider.fn(prompt);
      const parsed = tryParseForecast(raw);
      if (parsed) {
        return parsed;
      }
    } catch (error) {
      console.error(`ai-forecast: provider ${provider.name} failed`, error);
    }
  }

  return fallbackForecast(input);
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

  let payload: ForecastRequest | null = null;
  try {
    payload = await req.json();
  } catch (_error) {
    // ignore
  }

  if (!payload || !Array.isArray(payload.history)) {
    return new Response(JSON.stringify({ error: "history array is required" }), {
      status: 400,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
    });
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

  const result = await generateForecast(payload);

  await supabase.from("analytics_events").insert({
    organization_id: payload.organizationId ?? null,
    event_type: "ai_forecast",
    entity_type: "forecast",
    entity_id: crypto.randomUUID(),
    metadata: {
      history: payload.history,
      horizon: payload.horizon ?? 4,
      notes: payload.notes ?? null,
      forecast: result.forecast,
      confidence: result.confidence,
      analysis: result.analysis,
    },
  });

  return new Response(JSON.stringify({ ok: true, result }), {
    status: 200,
    headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": "*" },
  });
});
