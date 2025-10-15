-- Migration: create project_delivery_updates table and policies

CREATE TABLE IF NOT EXISTS public.project_delivery_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT,
  blockers TEXT,
  decisions TEXT,
  reminder_cadence TEXT,
  next_review_at DATE,
  approval_state TEXT,
  approver_chain JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_project_delivery_updates_project
  ON public.project_delivery_updates(project_id, created_at DESC);

ALTER TABLE public.project_delivery_updates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "project_delivery_updates_select"
  ON public.project_delivery_updates
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
  CREATE POLICY "project_delivery_updates_write"
  ON public.project_delivery_updates
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
