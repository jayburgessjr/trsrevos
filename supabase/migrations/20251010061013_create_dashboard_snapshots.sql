-- Migration: create dashboard_snapshots table and policies

CREATE TABLE IF NOT EXISTS public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  time_scope TEXT NOT NULL,
  segment_filter JSONB DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_org_scope
  ON public.dashboard_snapshots(organization_id, time_scope, computed_at DESC);

ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "dashboard_snapshots_select"
  ON public.dashboard_snapshots
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() OR public.is_super_admin()
  );

CREATE POLICY IF NOT EXISTS "dashboard_snapshots_all"
  ON public.dashboard_snapshots
  FOR ALL
  USING (
    auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin())
  )
  WITH CHECK (
    auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin())
  );
