# Phase 1 — Data Foundation & Plumbing

These working notes capture the current Supabase surface area, the UI/worker
flows that need to migrate off seeded stores, and the security plumbing required
for a production-ready Phase 1 cutover.

## 1. Supabase Integration Audit

### Table & View Inventory

| Domain Object | Tables / Views | Purpose & Key Columns | Current Consumers |
| --- | --- | --- | --- |
| Clients & Portfolio Health | `clients`, `client_commercials`, `contacts`, `client_health_history`, `vw_client_overview` | Stores RevOS customer metadata, commercial terms, point-in-time health, and derived portfolio rollups for dashboards.【F:supabase/migrations/20241009000000_initial_schema.sql†L32-L173】【F:supabase/migrations/20251010061002_create_client_health_history.sql†L1-L34】【F:supabase/sql/clients/003_views_clients.sql†L1-L42】 | `app/clients/page.tsx`, `components/clients/*`, `core/clients/actions.ts`, `core/projects/queries.ts` |
| Opportunities & Pipeline | `opportunities`, `pipeline`, `vw_client_overview` | Tracks deal flow, probability, and stage progression for executive and pipeline views.【F:supabase/migrations/20241009000000_initial_schema.sql†L94-L156】【F:supabase/schema.sql†L24-L112】 | `core/pipeline/actions.ts`, `app/pipeline/page.tsx`, `lib/queries.ts` |
| Invoices & Finance | `invoices`, `finance`, `dashboard_snapshots` | Supports AR tracking, MRR snapshots, and finance workspace rollups.【F:supabase/migrations/20241009000000_initial_schema.sql†L180-L263】【F:supabase/schema.sql†L40-L112】 | `app/finance/page.tsx`, `core/finance/actions.ts`, `lib/queries.ts` |
| Focus Sessions | `focus_sessions` | Logs deep work sessions tied to daily plans for productivity telemetry.【F:supabase/migrations/20251010061006_create_focus_sessions.sql†L1-L34】 | `core/dailyPlan/actions.ts`, upcoming focus UI |
| Analytics & Telemetry | `analytics_events`, `agent_runs`, `agent_behaviors`, `agent_definitions` | Captures product analytics, agent invocations, and governance metadata.【F:supabase/schema.sql†L120-L187】【F:supabase/migrations/20241009000000_initial_schema.sql†L633-L675】【F:supabase/migrations/20251010061009_create_agent_definitions.sql†L1-L34】【F:supabase/migrations/20251010061010_create_agent_behaviors.sql†L1-L31】 | `core/events/emit.ts`, `hooks/useAnalyticsStream.ts`, Supabase Edge functions |
| TRS Scores | `client_health_history` (`trs_score` column) | Records historical TRS scores to power health trendlines and audits.【F:supabase/migrations/20251010061002_create_client_health_history.sql†L1-L34】 | `components/clients/HealthPanel.tsx`, future executive analytics |

### CRUD & Workflow Mapping

- **Client list & detail** — Reads occur in `app/clients/page.tsx` (SSR Supabase
  query) and client dashboards; writes are handled inside
  `core/clients/actions.ts` server actions for discovery notes, data sources, and
  kanban syncs.【F:app/clients/page.tsx†L31-L211】【F:core/clients/actions.ts†L28-L411】
- **Pipeline updates** — Server actions in `core/pipeline/actions.ts` mutate
  `opportunities` and related automation triggers, while client widgets in the
  pipeline workspace still depend on in-memory fallbacks.【F:core/pipeline/actions.ts†L40-L505】
- **Finance dashboards** — `core/finance/store.ts` remains seeded; finance UI
  needs to swap to `finance` and `invoices` tables for true balances.【F:core/finance/store.ts†L12-L160】
- **Focus sessions & analytics** — API handlers ingest Gmail and calendar data
  and should enqueue retries when Supabase is unavailable; telemetry currently
  accumulates in local stores via `core/events/emit.ts`.【F:app/api/gmail/messages/route.ts†L12-L55】【F:core/events/emit.ts†L1-L5】

## 2. Replace Seeded Stores with Live Queries

- Introduced `useWorkspaceClients` as a shared hook that pulls live client
  records via Supabase with automatic retry and fallback to seeded data when
  credentials are missing or outages occur.【F:hooks/useWorkspaceClients.ts†L1-L145】
- Updated the client workspace panels (`ChurnPanel`, `HealthPanel`, `QBRPanel`)
  to consume the shared hook, display loading states, and communicate fallback
  conditions to the operator.【F:components/clients/ChurnPanel.tsx†L1-L83】【F:components/clients/HealthPanel.tsx†L1-L83】【F:components/clients/QBRPanel.tsx†L1-L87】
- Remaining migrations off seeded stores:
  - Finance metrics (`core/finance/store.ts` → Supabase `finance`/`invoices`).
  - Executive overview widgets using `core/exec/actions.ts`.
  - Agent activity feeds using `core/events/store.ts`.

## 3. Background Sync & Error Handling

- The hook performs interval refreshes (default 60 seconds) to keep the client
  dashboard in sync without manual reloads. Errors trigger structured telemetry
  (`reportClientError`) and automatically fall back to the last good snapshot or
  seeded data.【F:hooks/useWorkspaceClients.ts†L72-L133】【F:lib/telemetry.ts†L1-L61】
- UI surfaces now render explicit loading states and outage banners, satisfying
  the requirement to surface reliability issues to operators.【F:components/clients/ChurnPanel.tsx†L37-L69】【F:components/clients/HealthPanel.tsx†L27-L60】【F:components/clients/QBRPanel.tsx†L33-L73】
- Follow-up: connect `reportClientError` to the tracing stack (e.g. Honeycomb) by
  wiring a lightweight `/api/telemetry` endpoint once observability credentials
  are available.

## 4. Security & Governance Baseline

- Supabase migrations already enable RLS across core tables (clients, pipeline,
  invoices, focus sessions, agent runs) with policies tied to workspace role or
  admin functions.【F:supabase/migrations/20241009000001_rls_policies.sql†L1-L360】
- Next steps before launch:
  1. Bind the shared data hooks to workspace/org context so each request scopes
     to `organization_id` and respects persona-based RLS filters.
  2. Centralize audit logging by replacing `core/events/emit.ts` with Supabase
     inserts into `analytics_events`/`agent_runs` for every material mutation.
  3. Ensure service-role background jobs (QuickBooks, Gmail ingest) fall back to
     queued retries when Supabase RPCs fail, matching the retryable job exit
     criterion.【F:app/api/gmail/messages/[id]/route.ts†L12-L60】

---

**Exit Criteria Tracker**

- [x] Client dashboards now hydrate from Supabase-backed data with resilient
  fallbacks.
- [ ] Finance, executive, and agent workspaces still need to migrate off seeded
  stores.
- [ ] Telemetry endpoint and audit log wiring remain outstanding for full Phase
  1 completion.
