-- Migration: create audit_log table and policies

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_time
  ON public.audit_log(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_resource
  ON public.audit_log(resource_type, resource_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "audit_log_select"
  ON public.audit_log
  FOR SELECT
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "audit_log_insert"
  ON public.audit_log
  FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
