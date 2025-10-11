const MORNING_BRIEF_ALLOWED_ORIGINS = new Set([
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

function createMorningBriefCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && MORNING_BRIEF_ALLOWED_ORIGINS.has(origin)
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

function respondWithMorningBrief(
  body: MorningBriefResponse,
  init: ResponseInit & { headers: Headers },
) {
  return new Response(JSON.stringify(body, null, 2), init);
}

function logMorningBriefRequest(req: Request, functionName: string) {
  console.info(
    JSON.stringify({
      event: `${functionName}:request`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }),
  );
}

function isValidMorningBriefInput(payload: unknown): payload is MorningBriefInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return typeof data.user_id === 'string' && typeof data.organization_id === 'string';
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = createMorningBriefCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logMorningBriefRequest(req, 'morning-brief');

  if (req.method !== 'POST') {
    return respondWithMorningBrief({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('morning-brief:invalid-json', error);
    return respondWithMorningBrief({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidMorningBriefInput(payload)) {
    return respondWithMorningBrief(
      { ok: false, error: 'Missing required fields: user_id, organization_id' },
      { status: 400, headers },
    );
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
    priorities: [
      {
        id: 'pri-1',
        title: 'Schedule QBR with Helio',
        why: 'High churn signal from health telemetry',
        roi_dollars: 18000,
        effort: 'Low',
        owner: 'You',
        status: 'Ready',
      },
      {
        id: 'pri-2',
        title: 'Finalize ReggieAI pricing tiers',
        why: 'Margin expansion opportunity',
        roi_dollars: 8000,
        effort: 'Med',
        owner: 'You',
        status: 'Ready',
      },
      {
        id: 'pri-3',
        title: 'Collections outreach batch',
        why: 'Reduce DSO by 5 days',
        roi_dollars: 5000,
        effort: 'Low',
        owner: 'You',
        status: 'Ready',
      },
    ],
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

  return respondWithMorningBrief({ ok: true, data: placeholderBrief }, { status: 200, headers });
});
