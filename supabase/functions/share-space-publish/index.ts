const allowedOrigins = new Set([
  'https://trsrevos.vercel.app',
  'http://localhost:3000',
]);

type ShareSpacePublishInput = {
  share_id: string;
  include_watermark?: boolean;
};

type ShareSpacePublishResponse = {
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

function respond(body: ShareSpacePublishResponse, init: ResponseInit & { headers: Headers }) {
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

function isValidInput(payload: unknown): payload is ShareSpacePublishInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return typeof data.share_id === 'string';
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logRequest(req, 'share-space-publish');

  if (req.method !== 'POST') {
    return respond({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('share-space-publish:invalid-json', error);
    return respond({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidInput(payload)) {
    return respond({ ok: false, error: 'Missing required field: share_id' }, { status: 400, headers });
  }

  const { share_id, include_watermark } = payload;

  console.info(
    JSON.stringify({
      event: 'share-space-publish:payload-received',
      timestamp: new Date().toISOString(),
      share_id,
      include_watermark,
    }),
  );

  // TODO: assemble share space bundle and record audit trail.
  // Required tables: share_spaces, share_space_artifacts, dashboard_snapshots, content_items, projects.
  // Example workflow:
  // 1. Load share_space metadata and eligible artifacts.
  // 2. Generate signed URLs / apply watermark pipeline when include_watermark is true.
  // 3. Insert audit_log entry capturing publish action and resulting artifact manifest.

  const placeholderPublish = {
    share_id,
    include_watermark: include_watermark ?? false,
    referenced_tables: ['share_spaces', 'share_space_artifacts', 'dashboard_snapshots', 'content_items', 'projects', 'audit_log'],
  };

  return respond({ ok: true, data: placeholderPublish }, { status: 200, headers });
});
