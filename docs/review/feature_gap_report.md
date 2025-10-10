# TRS Feature Gap Report

## 1. Overview
- **Product readiness score:** **54 / 100** — strong scaffolding exists across core workspaces, but revenue intelligence, automation, and Supabase-backed data flows remain largely stubbed or disconnected.
- **Highlights:** Executive, pipeline, client, partner, and finance surfaces are visually aligned yet driven by seeded data and placeholder actions. Edge functions and database tables are provisioned without production wiring, leaving forecasting, collections, agent automation, and analytics unrealized.

## 2. Functional Gaps
### Executive Dashboard (`/dashboard`)
- Analytics, Reports, and Notifications tabs render "coming soon" states with no data model, preventing board, investor, or alert workflows.【F:app/dashboard/DashboardClient.tsx†L160-L189】
- Server actions only proxy to an in-memory store and return canned responses; there is no persistence or integration with Supabase snapshots, commits, or exports.【F:core/exec/actions.ts†L5-L13】
- Edge function meant to recompute snapshots is stubbed and never called from the UI, so dashboard refreshes cannot occur.【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】

### Pipeline (`/pipeline`)
- Entire deal pipeline relies on a hard-coded array; stage changes, note creation, and prospect adds never leave the client, blocking CRM sync and forecasting accuracy.【F:app/pipeline/page.tsx†L16-L199】【F:core/events/emit.ts†L1-L4】
- Commit, Forecast, and Health tabs surface placeholders rather than real scenario planning or velocity intelligence, undercutting forecast governance.【F:app/pipeline/page.tsx†L479-L520】
- Opportunity note tables exist in Supabase but the UI never writes or reads them, preventing collaboration on deals.【F:supabase/schema.sql†L1-L36】

### Morning Operating System (`/`)
- Plan computation, focus blocks, recap, and iCal export are mocked; no scheduling, scoring, or analytics are persisted, so the morning briefing cannot shape the day’s execution.【F:core/morning/actions.ts†L5-L41】
- The morning edge function documents desired tables yet returns an empty payload, leaving orchestration and diagnostics unimplemented.【F:supabase/functions/morning-brief/index.ts†L97-L121】

### Clients (`/clients` and detail views)
- Client portfolio, health history, and expansion metrics are seeded in memory; without Supabase reads/writes, ARR, QBR, and risk scores never reflect reality.【F:core/clients/store.ts†L3-L200】
- Client detail tabs (Data, Strategy, Results) route via `resolveTabs` but have no dedicated components, so critical telemetry such as data coverage or compounding results stay hidden.【F:app/clients/[id]/ClientDetailView.tsx†L19-L188】【F:lib/tabs.ts†L13-L16】
- `client_health_history` table is provisioned yet unused, preventing longitudinal health and churn analytics.【F:supabase/schema.sql†L37-L78】

### Projects (`/projects`)
- Forecast and Agent tabs show static cards and placeholders, leaving capacity modeling, burn-down charts, and agent-driven risk mitigation absent.【F:app/projects/ProjectsPageClient.tsx†L202-L254】
- Project update storage exists in Supabase but the UI never surfaces logs or risk narratives.【F:supabase/schema.sql†L79-L134】

### Content & Advertising (`/content`)
- Content inventory, ad campaigns, and KPIs are seeded in `core/content/store` with no ingestion from Supabase’s `content_metrics` or media asset tables, eliminating closed-loop attribution.【F:core/content/store.ts†L17-L193】【F:supabase/schema.sql†L135-L204】
- AI campaign generation mutates local state only; there is no queueing, approval, or routing to publishing infrastructure.【F:app/content/page.tsx†L18-L73】

### Partners (`/partners`)
- Relationship tracking, opportunity syncing, and warm intro logging work off of static arrays; partner influence on pipeline cannot be measured or automated.【F:app/partners/page.tsx†L30-L118】
- `share_space_artifacts` and partner-specific resources defined in Supabase remain disconnected from partner detail tabs, hindering co-selling workflows.【F:supabase/schema.sql†L400-L432】【F:lib/tabs.ts†L15-L16】

### Finance (`/finance`)
- Cash, billing, subscriptions, and expenses are drawn from mock stores; there is no linkage to invoices, collections actions, or ARR movements in Supabase.【F:core/finance/store.ts†L12-L160】【F:app/finance/page.tsx†L33-L120】
- Forecasting, scenario planning, and compliance views are absent despite Supabase structures for `analytics_events` and `audit_log` that could support them.【F:supabase/schema.sql†L206-L306】

### Agents (`/agents`)
- Agent registry holds definitions in memory, so enabling/disabling or logging runs never touches the Supabase `agent_definitions` / `agent_behaviors` tables meant for governance.【F:core/agents/bus.ts†L3-L48】【F:supabase/schema.sql†L309-L360】
- Rosie assistant lacks any enterprise memory, embeddings, or retrieval against TRS data; it relies on local storage and a generic `/api/rosie` endpoint, preventing contextual responses.【F:components/assistant/Rosie.tsx†L15-L200】

## 3. Experience Gaps
- Layout inconsistency: App shell expects tabbed navigation with a "Pick a date" control, but pages like Pipeline and Finance switch to a centered `max-w-7xl` layout, breaking continuity and wasting lateral space.【F:components/layout/AppShell.tsx†L35-L46】【F:app/pipeline/page.tsx†L228-L236】【F:app/finance/page.tsx†L45-L92】
- Navigation metadata includes routes (`/morning`, `/resources`) that have no dedicated pages or align with the current `/` implementation, creating dead tabs and confusing navigation breadcrumbs.【F:lib/tabs.ts†L1-L17】
- Agent directory filters and toggles reset on refresh because state is never persisted, and GPT listings open external links rather than embedded experiences, fragmenting the workflow.【F:app/agents/AgentsDirectory.tsx†L32-L124】
- Placeholder cards (e.g., Project Agent prompt workspace, Pipeline Commit forecast) occupy prime real estate without indicating timeline or next steps, eroding user trust.【F:app/projects/ProjectsPageClient.tsx†L228-L253】【F:app/pipeline/page.tsx†L479-L495】
- Header search and notification affordances are present but unhooked, missing a chance to deliver global search, alert triage, and time controls from the masthead.【F:components/nav/GlobalHeader.tsx†L6-L23】【F:components/layout/AppShell.tsx†L35-L44】

## 4. Intelligence Gaps
- All KPI surfaces (exec, pipeline, clients, finance) are derived from hard-coded stores, so no predictive modeling, anomaly detection, or trend analysis can run on live data.【F:core/exec/actions.ts†L5-L13】【F:core/clients/store.ts†L3-L200】【F:core/finance/store.ts†L12-L160】
- AI surfaces are thin shells: Rosie lacks access to Supabase memories; Pipeline "AI-powered" copy references analytics that do not exist; Projects Agent is a placeholder, and content AI generation cannot learn from performance data.【F:components/assistant/Rosie.tsx†L45-L158】【F:app/pipeline/page.tsx†L280-L344】【F:app/projects/ProjectsPageClient.tsx†L202-L254】【F:core/content/store.ts†L165-L193】
- Supabase tables for analytics events, dashboard snapshots, and focus sessions are idle, so no telemetry feeds forecasting cones, agent impact measurement, or focus efficiency loops.【F:supabase/schema.sql†L206-L360】

## 5. Operational Gaps
- Edge functions for exec dashboard refresh and morning brief include TODO comments outlining required tables, but no orchestration, queueing, or security hardening is implemented; without invocation wiring, they cannot run in production.【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】【F:supabase/functions/morning-brief/index.ts†L97-L121】
- Event emission stays in-memory (`core/events/emit`), so audit logging, Supabase `analytics_events`, and downstream automations never fire.【F:core/events/emit.ts†L1-L4】【F:supabase/schema.sql†L242-L305】
- Agent enablement ignores Supabase policies (`agent_definitions`, `agent_behaviors`), blocking multi-tenant governance, RLS, and auto-run controls.【F:core/agents/bus.ts†L3-L48】【F:supabase/schema.sql†L309-L360】
- Media, share-space, and integration settings tables are provisioned but unused, leaving content delivery, partner enablement, and integration management manual.【F:supabase/schema.sql†L135-L204】【F:supabase/schema.sql†L400-L432】【F:supabase/schema.sql†L361-L399】

## 6. Strategic Additions
- **Predictive analytics:** Backfill `dashboard_snapshots` with probabilistic forecasts and anomaly scoring streamed from Supabase, and surface credible visualizations in Dashboard Analytics and Pipeline Commit tabs.【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】【F:app/dashboard/DashboardClient.tsx†L160-L177】【F:app/pipeline/page.tsx†L479-L495】
- **Autonomous agent triggers:** Persist agent definitions/behaviors in Supabase, emit events for completions, and let agents auto-run when RLS policies allow, enabling hands-off interventions on pipeline, collections, and projects.【F:core/agents/bus.ts†L3-L48】【F:supabase/schema.sql†L309-L360】
- **Client ROI intelligence dashboards:** Combine `client_health_history`, invoices, and project updates into a longitudinal ROI panel inside client detail tabs, surfacing TRS score, churn risk, and compounding impact trends.【F:supabase/schema.sql†L37-L134】【F:app/clients/[id]/ClientDetailView.tsx†L41-L188】
- **Smart goal forecasting:** Replace placeholder OKR, forecast, and burn-down widgets with Monte Carlo simulations and milestone tracking fed by pipeline velocity and project execution data.【F:app/pipeline/page.tsx†L298-L344】【F:app/projects/ProjectsPageClient.tsx†L202-L224】
- **Integrated knowledge management (TRSOS memory layer):** Augment Rosie with embeddings backed by Supabase tables (content metrics, analytics events, agent logs) so assistants recall institutional knowledge and deliver contextual recommendations.【F:components/assistant/Rosie.tsx†L45-L200】【F:supabase/schema.sql†L206-L360】
- **Revenue simulation sandbox:** Activate Dashboard Analytics tab with scenario toggles (pricing, win rate, DSO) that call a Supabase function to simulate outcomes and feed board-ready exports.【F:app/dashboard/DashboardClient.tsx†L160-L177】【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】

## 7. Prioritized Roadmap (Q1–Q4)
- **Q1 – Data foundation & instrumentation**
  - Wire Supabase tables (clients, opportunities, invoices, focus sessions, analytics events) into stores and server actions; retire seeded data in favor of live fetches.【F:core/clients/store.ts†L3-L200】【F:core/finance/store.ts†L12-L160】【F:core/events/emit.ts†L1-L4】
  - Connect edge functions to scheduled jobs and mutate `dashboard_snapshots` / `daily_plans`, enabling automated morning briefs and exec refreshes.【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】【F:supabase/functions/morning-brief/index.ts†L97-L121】

- **Q2 – Forecasting & revenue controls**
  - Deliver predictive analytics in Dashboard Analytics and Pipeline Commit tabs, leveraging velocity data, pipeline weighting, and dashboard snapshots.【F:app/dashboard/DashboardClient.tsx†L160-L177】【F:app/pipeline/page.tsx†L479-L495】
  - Launch collections acceleration and cash governance by binding finance UI to invoices, DSO calculations, and audit logs.【F:app/finance/page.tsx†L95-L120】【F:supabase/schema.sql†L242-L306】

- **Q3 – Agent automation & client intelligence**
  - Persist agent definitions/behaviors, expose run history in UI, and allow event-driven execution tied to revenue thresholds.【F:core/agents/bus.ts†L3-L48】【F:supabase/schema.sql†L309-L360】
  - Build client ROI dashboards and health timelines using `client_health_history`, project updates, and content influence data.【F:supabase/schema.sql†L37-L134】【F:app/clients/[id]/ClientDetailView.tsx†L41-L188】

- **Q4 – Simulation & knowledge management**
  - Introduce revenue simulation sandbox with scenario toggles (pricing, win-rate, spend) and board deck exports powered by Supabase functions.【F:app/dashboard/DashboardClient.tsx†L160-L176】【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】
  - Implement TRSOS memory layer feeding Rosie and project agents with embeddings from analytics events, content metrics, and agent logs for contextual recommendations.【F:components/assistant/Rosie.tsx†L45-L200】【F:supabase/schema.sql†L206-L360】

## Summary Table
| Category | Item | File/Module | Priority | Type | Recommendation |
|-----------|------|--------------|-----------|-------|----------------|
| Functional | Predictive Forecast | /app/dashboard & edge function | High | New Feature | Implement Supabase-backed analytics service to populate Dashboard Analytics and Pipeline Commit tabs with Monte Carlo scenarios and update `dashboard_snapshots`.【F:app/dashboard/DashboardClient.tsx†L160-L177】【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】|
| Functional | Pipeline Persistence | /app/pipeline/page.tsx | High | Data Integration | Replace seeded deals with Supabase opportunities, write notes to `opportunity_notes`, and emit events into `analytics_events`.【F:app/pipeline/page.tsx†L16-L199】【F:supabase/schema.sql†L1-L36】【F:supabase/schema.sql†L242-L273】|
| Experience | Nav alignment | App shell & workspace pages | Medium | UI Fix | Standardize all workspaces on the grid layout, add a functional time filter, and remove dead tabs like `/morning` to keep navigation consistent.【F:components/layout/AppShell.tsx†L35-L46】【F:app/pipeline/page.tsx†L228-L236】【F:lib/tabs.ts†L1-L17】|
| Intelligence | Agent Memory Layer | /components/assistant/Rosie.tsx | High | Enhancement | Connect Rosie to Supabase knowledge tables (analytics events, content metrics, agent logs) for contextual responses and action suggestions.【F:components/assistant/Rosie.tsx†L45-L200】【F:supabase/schema.sql†L206-L360】|
| Operational | Event Pipeline | /core/events/emit.ts | High | Infra | Persist emitted events into Supabase `analytics_events` and `audit_log`, enabling downstream automation and compliance tracking.【F:core/events/emit.ts†L1-L4】【F:supabase/schema.sql†L242-L305】|
| Strategic | Revenue Simulation Sandbox | /app/dashboard | Medium | New Feature | Activate analytics tab with scenario controls and exportable board decks driven by Supabase computations.【F:app/dashboard/DashboardClient.tsx†L160-L176】【F:supabase/functions/exec-dashboard-refresh/index.ts†L97-L122】|
