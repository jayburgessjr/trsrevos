# rosie-chat (Supabase Edge Function)

Streams TRS-aware answers from the Rosie copilot using OpenAI + Supabase context.

## Env
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY

## Deploy
```bash
supabase functions deploy rosie-chat
# local serve:
supabase functions serve rosie-chat
```

## Call (curl)

```bash
curl -N -X POST "$SUPABASE_URL/functions/v1/rosie-chat" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "message":"What are today's top revenue priorities?",
    "organizationId":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  }'
```

The response is an SSE stream (`data: ...` lines) ending with `data: [DONE]`.
