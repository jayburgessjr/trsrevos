-- Migration: create agent_behaviors table and policies

CREATE TABLE IF NOT EXISTS public.agent_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT NOT NULL REFERENCES public.agent_definitions(agent_key) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  behavior JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_agent_behaviors_org_agent
  ON public.agent_behaviors(organization_id, agent_key);

ALTER TABLE public.agent_behaviors ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "agent_behaviors_select"
  ON public.agent_behaviors
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() OR public.is_super_admin()
  );

CREATE POLICY IF NOT EXISTS "agent_behaviors_all"
  ON public.agent_behaviors
  FOR ALL
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  )
  WITH CHECK (
    organization_id = public.user_organization_id() AND public.is_admin()
  );
