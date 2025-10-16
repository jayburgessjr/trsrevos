# Revenue Clear Review & Recovery Plan

## Findings

### Design mismatch with `/resources`
- The `RevenueClearPage` builds a bespoke dark command-center layout directly in the route component instead of reusing the shared `PageTemplate`, `PageTabs`, and card primitives that drive the `/resources` experience. 【F:app/revenue-clear/page.tsx†L70-L156】【F:app/resources/page.tsx†L1-L120】
- The onboarding flow renders full-screen gradient panels that diverge from the light, card-based library aesthetic in `/resources`. 【F:modules/revenue-clear/components/RevenueClearOnboarding.tsx†L76-L159】

### Functional gaps
- All reads/writes expect Supabase tables (`clients`, `opportunities`, `intakes`, `audits`, `interventions`, `revboard_metrics`, `execution_tasks`, `weekly_summaries`, `results`, `next_steps`) and specific columns such as `owner_id`, `monthly_recurring_revenue`, `leak_severity`, etc., but only a simplified CRM schema is provisioned today. 【F:modules/revenue-clear/lib/queries.ts†L39-L169】【F:modules/revenue-clear/components/RevenueClearShell.tsx†L63-L210】【F:supabase/schema.sql†L24-L76】
- Required tables for the workflow (e.g., `intakes`, `audits`, `results`) are completely absent, so every autosave upsert or fetch call fails at runtime. 【F:modules/revenue-clear/components/RevenueClearShell.tsx†L88-L210】【F:supabase/schema.sql†L1-L160】
- Server actions assume authenticated access and revalidation of `/pipeline` and `/clients`, but neither pipeline helpers nor Supabase row-level policies exist yet to authorize those writes. 【F:modules/revenue-clear/lib/actions.ts†L34-L134】【F:supabase/schema.sql†L24-L76】

## Plan of record

1. **Match `/resources` shell**
   - Lift the `PageTemplate` + `PageTabs` framing from `/resources` and feed Revenue Clear–specific tab metadata so both pages share the same header, breadcrumbs, and tab styling.
   - Move the hero + metrics intro into reusable cards that respect the light theme tokens and typography used in `/resources`.
   - Break stage content into tabbed panels that align with the existing card grid system for consistency with other resource calculators.

2. **Define Supabase surface area**
   - Extend the schema with migrations that add the missing tables (`revenue_clear_intakes`, `revenue_clear_audits`, `revenue_clear_interventions`, `revenue_clear_metrics`, `revenue_clear_tasks`, `revenue_clear_weekly_summaries`, `revenue_clear_results`, `revenue_clear_next_steps`) and required foreign keys to `clients`.
   - Backfill or alter existing tables so the columns referenced in queries (`owner_id`, `phase`, `status`, `monthly_recurring_revenue`, etc.) exist with appropriate defaults.
   - Author row-level security policies + Supabase functions mirroring how `/resources` calculators persist data so autosave calls succeed client-side.

3. **Harden onboarding flows**
   - Normalize the actions to use the new schema helpers once tables/columns exist, including defensive handling when the pipeline is empty.
   - Add optimistic UI states and reuse shared form components to stay on-brand with `/resources` interactions.

4. **QA + docs**
   - Seed representative clients/opportunities in `supabase/seed.sql` so local/dev environments can exercise the workflow end-to-end.
   - Document required environment variables and launch steps in `docs/resources/revenue-clear.md` after the rebuild to reduce future drift.

## Next steps

- Prioritize schema migrations first to unblock all data access.
- Parallelize the UI refactor with design to ensure the rebuilt layout matches `/resources`.
- Follow up with integration tests covering intake autosave, audit scoring, and stage navigation once the above foundations land.
