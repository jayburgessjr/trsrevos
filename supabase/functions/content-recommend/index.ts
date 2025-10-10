const CONTENT_RECOMMEND_ALLOWED_ORIGINS = new Set([
  'https://trsrevos.vercel.app',
  'http://localhost:3000',
]);

type ContentRecommendInput = {
  organization_id: string;
  persona: string;
  stage: string;
};

type ContentRecommendResponse = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

function createContentRecommendCorsHeaders(origin: string | null) {
  const resolvedOrigin =
    origin && CONTENT_RECOMMEND_ALLOWED_ORIGINS.has(origin)
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

function respondWithContentRecommend(
  body: ContentRecommendResponse,
  init: ResponseInit & { headers: Headers },
) {
  return new Response(JSON.stringify(body, null, 2), init);
}

function logContentRecommendRequest(req: Request, functionName: string) {
  console.info(
    JSON.stringify({
      event: `${functionName}:request`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }),
  );
}

function isValidContentRecommendInput(payload: unknown): payload is ContentRecommendInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return (
    typeof data.organization_id === 'string' &&
    typeof data.persona === 'string' &&
    typeof data.stage === 'string'
  );
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = createContentRecommendCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logContentRecommendRequest(req, 'content-recommend');

  if (req.method !== 'POST') {
    return respondWithContentRecommend({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('content-recommend:invalid-json', error);
    return respondWithContentRecommend({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidContentRecommendInput(payload)) {
    return respondWithContentRecommend(
      { ok: false, error: 'Missing required fields: organization_id, persona, stage' },
      { status: 400, headers },
    );
  }

  const { organization_id, persona, stage } = payload;

  console.info(
    JSON.stringify({
      event: 'content-recommend:payload-received',
      timestamp: new Date().toISOString(),
      organization_id,
      persona,
      stage,
    }),
  );

  // TODO: rank candidate content from content_items, content_touches, content_metrics, media_projects.
  // Example workflow:
  // 1. Fetch engagement telemetry for persona/stage filter.
  // 2. Score assets using analytics pipeline and openai:gpt-4o-mini for summary generation.
  // 3. Return ordered recommendations with rationale and next-actions.

  const placeholderRecommendations = {
    requested_persona: persona,
    requested_stage: stage,
    organization_id,
    referenced_tables: ['content_items', 'content_touches', 'content_metrics', 'media_projects'],
    items: [],
  };

  return respondWithContentRecommend({ ok: true, data: placeholderRecommendations }, { status: 200, headers });
});
