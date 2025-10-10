const EXEC_DASHBOARD_ALLOWED_ORIGINS = new Set([
  'https://trsrevos.vercel.app',
  'http://localhost:3000',
]);

type ExecDashboardRefreshInput = {
  organization_id: string;
  time_scope: string;
  segment_filter?: Record<string, unknown>;
};

type ExecDashboardRefreshResponse = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

function createExecDashboardCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && EXEC_DASHBOARD_ALLOWED_ORIGINS.has(origin)
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

function respondWithExecDashboard(
  body: ExecDashboardRefreshResponse,
  init: ResponseInit & { headers: Headers },
) {
  return new Response(JSON.stringify(body, null, 2), init);
}

function logExecDashboardRequest(req: Request, functionName: string) {
  console.info(
    JSON.stringify({
      event: `${functionName}:request`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }),
  );
}

function isValidExecDashboardInput(payload: unknown): payload is ExecDashboardRefreshInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return typeof data.organization_id === 'string' && typeof data.time_scope === 'string';
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = createExecDashboardCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logExecDashboardRequest(req, 'exec-dashboard-refresh');

  if (req.method !== 'POST') {
    return respondWithExecDashboard({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('exec-dashboard-refresh:invalid-json', error);
    return respondWithExecDashboard({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidExecDashboardInput(payload)) {
    return respondWithExecDashboard(
      { ok: false, error: 'Missing required fields: organization_id, time_scope' },
      { status: 400, headers },
    );
  }

  const { organization_id, time_scope, segment_filter } = payload;

  console.info(
    JSON.stringify({
      event: 'exec-dashboard-refresh:payload-received',
      timestamp: new Date().toISOString(),
      organization_id,
      time_scope,
      segment_filter,
    }),
  );

  // TODO: recompute metrics and persist snapshots.
  // Required tables: dashboard_snapshots, clients, opportunities, invoices, cash_flow_entries,
  // content_touches, ad_campaigns, projects, events.
  // Example workflow:
  // 1. Query analytics pipeline service for the latest metrics for the requested scope.
  // 2. Upsert into dashboard_snapshots with computed_at timestamp and metrics payload.
  // 3. Emit events/audit trail rows for traceability.

  const placeholderSnapshot = {
    organization_id,
    time_scope,
    segment_filter: segment_filter ?? {},
    referenced_tables: [
      'dashboard_snapshots',
      'clients',
      'opportunities',
      'invoices',
      'cash_flow_entries',
      'content_touches',
      'ad_campaigns',
      'projects',
      'events',
    ],
  };

  return respondWithExecDashboard({ ok: true, data: placeholderSnapshot }, { status: 200, headers });
});
