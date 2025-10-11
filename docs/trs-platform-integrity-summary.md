# TRS Platform Integrity Summary

## Schema audit

| Table | Status | Notes |
| --- | --- | --- |
| `users` | 🧩 | Added full-profile table linked to `auth.users` with RLS and update trigger. |
| `clients` | 🧩 | Restored primary client table with health, phase, and ownership metadata. |
| `deliverables` | 🧩 | New client deliverables table with owner + due date tracking. |
| `opportunity_activities` | 🧩 | Created activity log for opportunities, supporting assignments and status changes. |
| `client_financials` | 🧩 | Added finance snapshots backing revenue reporting actions. |
| `invoices` | 🧩 | Added invoice ledger used by finance views and QuickBooks sync. |
| `integrations` | 🧩 | Central registry for Gmail, Calendar, and QuickBooks connection state. |
| `analytics_events` | ✅ | Verified structure matches event logging flows. |
| `focus_sessions` | ✅ | Confirmed table + policies for deep work tracking. |
| Supporting tables (e.g., `opportunity_notes`, `client_health_history`, `agent_definitions`, `dashboard_snapshots`, `user_integrations`) | ✅ | Verified existing definitions and policies. |

**Referenced but defined via legacy migrations:** `organizations`, `contacts`, `opportunities`, `projects`, `discovery_questions`, `data_sources`, `kanban_items`, and `feature_flags` continue to resolve through migration files and remain available for runtime queries.

## Edge function audit

| Function | Status | Notes |
| --- | --- | --- |
| `gmail-sync` | 🧩 | New production handler refreshing OAuth tokens, ingesting messages, and logging analytics. |
| `calendar-sync` | 🧩 | Rebuilt to sync Google Calendar events using Supabase and Google tokens. |
| `quickbooks-sync` | 🧩 | Replaced placeholder with invoice ingestion pipeline powered by Supabase and QuickBooks REST. |
| `ai-forecast` | 🧩 | Added AI forecasting endpoint with OpenAI/Gemini fallback and analytics logging. |
| Existing functions (`agent-dispatch`, `content-recommend`, `exec-dashboard-refresh`, `morning-brief`, `share-space-publish`, `email-notify`, `docs-generate`) | ✅ | Inspected; no changes required. |

## Integration surface

| Component | Status | Notes |
| --- | --- | --- |
| `/app/settings/integrations` page | 🧩 | Rebuilt as server-driven OAuth wizard for Gmail (mail + calendar) and QuickBooks with Supabase-backed state. |
| Gmail + Calendar | 🧩 | OAuth flow leverages Supabase `user_integrations`, new edge sync functions, and analytics logging. |
| QuickBooks | 🧩 | Added server action + callback route to handle OAuth exchange, persist tokens in `integrations`, and trigger edge sync. |
| Legacy providers (Slack, HubSpot, Notion) | ✅ Removed | Eliminated code, dependencies, and references; Supabase is now the single data hub. |

## Environment keys

All sensitive credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `QUICKBOOKS_CLIENT_ID`, `QUICKBOOKS_CLIENT_SECRET`, `OPENAI_API_KEY`, `GEMINI_API_KEY`) are referenced via environment variables only; scripts relying on Supabase now read from env instead of hard-coded values.

## Outstanding gaps

- Historical tables defined exclusively in initial migrations (see above) should eventually be mirrored into `supabase/schema.sql` to keep a single canonical schema file.
- OAuth flows assume environment variables are populated; without them, server actions will surface explicit configuration errors.
- QuickBooks invoice ingestion expects an organization-level client mapping (`default_client_id` or `client_map`) to avoid skipped rows.

