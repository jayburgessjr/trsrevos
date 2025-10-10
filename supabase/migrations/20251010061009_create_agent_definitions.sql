-- Migration: create agent_definitions table and policies

CREATE TABLE IF NOT EXISTS public.agent_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_runnable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_agent_definitions_org_key
  ON public.agent_definitions(organization_id, agent_key);

ALTER TABLE public.agent_definitions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "agent_definitions_select"
  ON public.agent_definitions
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() OR public.is_super_admin()
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "agent_definitions_all"
  ON public.agent_definitions
  FOR ALL
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  )
  WITH CHECK (
    organization_id = public.user_organization_id() AND public.is_admin()
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
