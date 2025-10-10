-- Migration: create project_updates table and policies

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT,
  summary TEXT,
  risk_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id
  ON public.project_updates(project_id DESC, created_at DESC);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "project_updates_select"
  ON public.project_updates
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
  CREATE POLICY "project_updates_mutate"
  ON public.project_updates
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
