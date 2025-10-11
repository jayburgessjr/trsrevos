# Projects Page Functionalization Plan

## Objectives
- Replace placeholder data on the Projects control center with live Supabase-backed content.
- Surface actionable delivery insights across Overview, Active, Forecast, and Agent tabs.
- Maintain a graceful fallback for local environments without Supabase credentials.

## Workstreams
1. **Data plumbing**
   - [x] Introduce a `project_milestones` table with RLS aligned to `project_updates`.
   - [x] Expand server-side project actions to pull from Supabase (projects, updates, milestones) with in-memory fallback.
   - [x] Shape aggregate helpers for stats, activity, and forecast insights to keep UI components lean.

2. **Projects page integration**
   - [x] Update the `/projects` route to fetch real data via the new actions.
   - [x] Render a live overview table with client navigation, health, and progress sourced from Supabase.
   - [x] Replace placeholder Active and Forecast tab content with updates, milestones, and derived budget/progress metrics.
   - [x] Introduce a functional agent request form wired to analytics logging for future automation.

3. **Quality and resilience**
   - [ ] Seed example projects, updates, and milestones for local/dev use.
   - [ ] Add unit coverage around the projection helpers.
   - [ ] Document Supabase dependencies and fallback behavior.

## Delivery Notes
- The initial milestone will focus on workstreams 1 & 2 bullet points up to a usable agent submission stub. Quality workstream items will be scheduled in a follow-up once live data proves stable.
- Supabase joins will return owner and client metadata to satisfy existing `Project` typings without forcing a breaking UI refactor.
