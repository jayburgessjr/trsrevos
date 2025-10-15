-- Migration: create project_change_orders table and policies

CREATE TABLE IF NOT EXISTS public.project_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC(14,2),
  status TEXT DEFAULT 'Submitted',
  submitted_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  approved_at TIMESTAMPTZ,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_project_change_orders_project
  ON public.project_change_orders(project_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_change_orders_status
  ON public.project_change_orders(status);

ALTER TABLE public.project_change_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "project_change_orders_select"
  ON public.project_change_orders
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "project_change_orders_write"
  ON public.project_change_orders
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid() OR public.is_admin()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid() OR public.is_admin()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
