const ALLOWED_ORIGINS = new Set([
  'https://trsrevos.vercel.app',
  'http://localhost:3000',
]);

type AgentDispatchInput = {
  agent_key: string;
  user_id: string;
  organization_id: string;
  payload: Record<string, unknown>;
};

type AgentDispatchResponse = {
  ok: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

function createAgentDispatchCorsHeaders(origin: string | null) {
  const resolvedOrigin = origin && ALLOWED_ORIGINS.has(origin)
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

function respondWithAgentDispatch(
  body: AgentDispatchResponse,
  init: ResponseInit & { headers: Headers },
) {
  return new Response(JSON.stringify(body, null, 2), init);
}

function logAgentDispatchRequest(req: Request, functionName: string) {
  console.info(
    JSON.stringify({
      event: `${functionName}:request`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    }),
  );
}

function isValidAgentDispatchInput(payload: unknown): payload is AgentDispatchInput {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload as Record<string, unknown>;
  return (
    typeof data.agent_key === 'string' &&
    typeof data.user_id === 'string' &&
    typeof data.organization_id === 'string' &&
    typeof data.payload === 'object'
  );
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = createAgentDispatchCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  logAgentDispatchRequest(req, 'agent-dispatch');

  if (req.method !== 'POST') {
    return respondWithAgentDispatch({ ok: false, error: 'Method not allowed' }, { status: 405, headers });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error('agent-dispatch:invalid-json', error);
    return respondWithAgentDispatch({ ok: false, error: 'Invalid JSON payload' }, { status: 400, headers });
  }

  if (!isValidAgentDispatchInput(payload)) {
    return respondWithAgentDispatch(
      { ok: false, error: 'Missing required fields: agent_key, user_id, organization_id, payload' },
      { status: 400, headers },
    );
  }

  const { agent_key, user_id, organization_id, payload: agentPayload } = payload;

  console.info(
    JSON.stringify({
      event: 'agent-dispatch:payload-received',
      timestamp: new Date().toISOString(),
      agent_key,
      user_id,
      organization_id,
    }),
  );

  // TODO: look up agent configuration from agent_definitions & agent_behaviors tables.
  // Example workflow:
  // 1. Fetch agent definition: select * from agent_definitions where agent_key = $1 and organization_id = $2.
  // 2. Persist new run in agent_runs table with payload & status placeholder.
  // 3. Dispatch to downstream providers (openai:gpt-4o-mini, service_webhooks) based on behaviors.

  const placeholderRun = {
    agent_key,
    organization_id,
    status: 'queued',
    referenced_tables: ['agent_runs', 'agent_definitions', 'agent_behaviors', 'clients', 'projects', 'content_items', 'events'],
    payload: agentPayload,
  };

  return respondWithAgentDispatch({ ok: true, data: placeholderRun }, { status: 200, headers });
});
