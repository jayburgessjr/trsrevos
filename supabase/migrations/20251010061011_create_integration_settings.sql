-- Migration: create integration_settings table and policies

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_integration_settings_org
  ON public.integration_settings(organization_id);

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "integration_settings_select"
  ON public.integration_settings
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  );

CREATE POLICY IF NOT EXISTS "integration_settings_all"
  ON public.integration_settings
  FOR ALL
  USING (auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin()))
  WITH CHECK (auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin()));
