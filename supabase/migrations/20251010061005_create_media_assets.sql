-- Migration: create media_assets table and policies

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.media_projects(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  uri TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_media_assets_project_id
  ON public.media_assets(project_id, created_at DESC);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "media_assets_select"
  ON public.media_assets
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.media_projects
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "media_assets_all"
  ON public.media_assets
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.media_projects
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.media_projects
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
