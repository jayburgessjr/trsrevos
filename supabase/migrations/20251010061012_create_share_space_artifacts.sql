-- Migration: create share_space_artifacts table and policies

CREATE TABLE IF NOT EXISTS public.share_space_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.share_spaces(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  uri TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_share_space_artifacts_share_id
  ON public.share_space_artifacts(share_id, created_at DESC);

ALTER TABLE public.share_space_artifacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "share_space_artifacts_select"
  ON public.share_space_artifacts
  FOR SELECT
  USING (
    share_id IN (
      SELECT id FROM public.share_spaces
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "share_space_artifacts_all"
  ON public.share_space_artifacts
  FOR ALL
  USING (
    share_id IN (
      SELECT id FROM public.share_spaces
    )
  )
  WITH CHECK (
    share_id IN (
      SELECT id FROM public.share_spaces
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
