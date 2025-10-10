-- Migration: align analytics_events and dashboard_snapshots with application usage

-- Allow analytics_events.organization_id to be optional for development snapshots
ALTER TABLE public.analytics_events
  ALTER COLUMN organization_id DROP NOT NULL;

-- Rename legacy columns to match action payloads
ALTER TABLE public.analytics_events
  RENAME COLUMN event_key TO event_type;
ALTER TABLE public.analytics_events
  RENAME COLUMN payload TO metadata;

-- Ensure supporting columns exist for entity targeting
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS entity_id TEXT;

-- Remove unused occurred_at column if present
ALTER TABLE public.analytics_events
  DROP COLUMN IF EXISTS occurred_at;

-- Refresh indexes to reflect new shape
DROP INDEX IF EXISTS idx_analytics_events_event_key;
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
  ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity
  ON public.analytics_events(entity_type, entity_id);

-- Reset policies so anon/server components can read development data
DROP POLICY IF EXISTS "analytics_events_select" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert" ON public.analytics_events;

CREATE POLICY "analytics_events_select"
  ON public.analytics_events
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR public.is_admin()
    OR organization_id IS NULL
  );

CREATE POLICY "analytics_events_insert"
  ON public.analytics_events
  FOR INSERT TO public
  WITH CHECK (
    organization_id = public.user_organization_id()
    OR organization_id IS NULL
    OR auth.role() = 'service_role'
  );

-- Dashboard snapshots should be optional by organization for early development
ALTER TABLE public.dashboard_snapshots
  ALTER COLUMN organization_id DROP NOT NULL;

DROP POLICY IF EXISTS "dashboard_snapshots_select" ON public.dashboard_snapshots;
DROP POLICY IF EXISTS "dashboard_snapshots_all" ON public.dashboard_snapshots;

CREATE POLICY "dashboard_snapshots_select"
  ON public.dashboard_snapshots
  FOR SELECT
  USING (
    organization_id = public.user_organization_id()
    OR organization_id IS NULL
    OR public.is_super_admin()
  );

CREATE POLICY "dashboard_snapshots_all"
  ON public.dashboard_snapshots
  FOR ALL TO public
  USING (
    auth.role() = 'service_role'
    OR organization_id = public.user_organization_id()
    OR organization_id IS NULL
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR organization_id = public.user_organization_id()
    OR organization_id IS NULL
  );

-- Align invoices paid timestamp with application expectations
ALTER TABLE public.invoices
  RENAME COLUMN paid_date TO paid_at;
ALTER TABLE public.invoices
  ALTER COLUMN paid_at TYPE TIMESTAMPTZ USING paid_at::timestamptz;

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_status_check
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));
