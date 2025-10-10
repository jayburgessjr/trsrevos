-- Migration: create analytics_events table and policies

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_key TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org_time
  ON public.analytics_events(organization_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_key
  ON public.analytics_events(event_key);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "analytics_events_select"
  ON public.analytics_events
  FOR SELECT
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  );

CREATE POLICY IF NOT EXISTS "analytics_events_insert"
  ON public.analytics_events
  FOR INSERT TO authenticated, service_role
  WITH CHECK (
    organization_id = public.user_organization_id() OR auth.role() = 'service_role'
  );
