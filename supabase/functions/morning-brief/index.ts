const allowedOrigins = new Set([
  'https://trsrevos.vercel.app',
  'http://localhost:3000',
]);

type MorningBriefInput = {
  user_id: string;
  organization_id: string;
  time_horizon?: string;
};

type MorningBriefResponse = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

function corsHeaders(origin: string | null) {
  const resolvedOrigin = origin && allowedOrigins.has(origin)
    ? origin
    : 'https://trsrevos.vercel.app';

  return new Headers({
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, x-client-info',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  });
}

function respond(body: MorningBriefResponse, init: ResponseInit & { headers: Headers }) {
  return new Response(JSON.stringify(body, null, 2), init);
}

function logRequest(req: Request, functionName: string) {
  console.info(
    JSON.stringify({
      event: `${functionName}:request`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }),
  );
}

function isValidInput(payload: unknown): payload is MorningBriefInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return typeof data.user_id === 'string' && typeof data.organization_id === 'string';
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logRequest(req, 'morning-brief');

  if (req.method !== 'POST') {
    return respond({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('morning-brief:invalid-json', error);
    return respond({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidInput(payload)) {
    return respond({ ok: false, error: 'Missing required fields: user_id, organization_id' }, {
      status: 400,
      headers,
    });
  }

  const { user_id, organization_id, time_horizon } = payload;

  console.info(
    JSON.stringify({
      event: 'morning-brief:payload-received',
      timestamp: new Date().toISOString(),
      user_id,
      organization_id,
      time_horizon,
    }),
  );

  // TODO: assemble prioritized focus plan.
  // Required tables: daily_plans, priority_items, focus_sessions, events, clients, opportunities,
  // cash_flow_entries, projects.
  // Example workflow:
  // 1. Load latest daily_plan for user & organization.
  // 2. Compute ROI/effort scoring referencing opportunities & cash_flow_entries.
  // 3. Persist focus_sessions skeleton entries for the returned plan.

  const placeholderBrief = {
    schedule: [],
    diagnostics: {
      referenced_tables: [
        'daily_plans',
        'priority_items',
        'focus_sessions',
        'events',
        'clients',
        'opportunities',
        'cash_flow_entries',
        'projects',
      ],
    },
  };

  return respond({ ok: true, data: placeholderBrief }, { status: 200, headers });
});
