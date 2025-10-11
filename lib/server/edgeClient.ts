import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function callEdge<T>(name: string, body?: any): Promise<T> {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Edge call failed: ${name}`);
  return data;
}

export const edge = {
  async agentDispatch(params: {
    provider: 'openai' | 'anthropic' | 'gemini';
    model: string;
    prompt: string;
    context?: any;
    temperature?: number;
  }) {
    return await callEdge<{
      ok: boolean;
      data: { response: string };
    }>('agent-dispatch', params);
  },
  async qraRun(params: {
    clientId: string;
    metrics: Record<string, number>;
    mode: 'diagnostic' | 'forecast' | 'compare';
  }) {
    return await callEdge<{
      ok: boolean;
      strategies: Record<string, any[]>;
    }>('qra-run', params);
  },
  async morningBrief(params: { userId: string }) {
    return await callEdge<{
      ok: boolean;
      summary: string;
      priorities: any[];
    }>('morning-brief', params);
  },
  async clientHealth(params: { clientId: string }) {
    return await callEdge<{
      ok: boolean;
      data: Record<string, any>;
    }>('client-health', params);
  },
  async contentRecommender(params: {
    persona: string;
    stage: string;
    topic: string;
  }) {
    return await callEdge<{
      ok: boolean;
      recommendations: any[];
    }>('content-recommender', params);
  },
  async revenueForecast(params: { period: string; history: number[] }) {
    return await callEdge<{
      ok: boolean;
      forecast: number[];
      confidence: number;
    }>('revenue-forecast', params);
  },
  async gmailSync(params: { userId?: string; maxMessages?: number }) {
    return await callEdge<{
      ok: boolean;
      processed: number;
      inserted: number;
    }>('gmail-sync', params);
  },
  async calendarSync(params: { userId?: string; calendarId?: string; timeMin?: string; timeMax?: string; maxResults?: number }) {
    return await callEdge<{
      ok: boolean;
      processed: number;
      events: number;
    }>('calendar-sync', params);
  },
  async quickbooksSync(params: { organizationId?: string; maxInvoices?: number }) {
    return await callEdge<{
      ok: boolean;
      processed: number;
      invoices: number;
    }>('quickbooks-sync', params);
  },
  async aiForecast(params: { organizationId?: string; history: number[]; horizon?: number; notes?: string }) {
    return await callEdge<{
      ok: boolean;
      result: { forecast: number[]; confidence: number; analysis: string };
    }>('ai-forecast', params);
  },
  async auditLog(params: { event: string; actor: string; data?: any }) {
    return await callEdge<{ ok: boolean }>('audit-log', params);
  },
  async heartbeat() {
    return await callEdge<{
      ok: boolean;
      timestamp: string;
    }>('heartbeat');
  }
};
