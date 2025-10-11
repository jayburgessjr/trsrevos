-- Migration: create project_milestones table and policies

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planned', 'In Progress', 'Complete', 'Blocked')),
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  due_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id
  ON public.project_milestones(project_id, due_date);

ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "project_milestones_select"
  ON public.project_milestones
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "project_milestones_mutate"
  ON public.project_milestones
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
