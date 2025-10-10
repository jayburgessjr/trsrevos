-- Migration: create opportunity_notes table and policies

CREATE TABLE IF NOT EXISTS public.opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_opportunity_notes_opportunity_id
  ON public.opportunity_notes(opportunity_id);

ALTER TABLE public.opportunity_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "opportunity_notes_select"
    ON public.opportunity_notes
    FOR SELECT
    USING (
      opportunity_id IN (
        SELECT id FROM public.opportunities
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "opportunity_notes_all"
    ON public.opportunity_notes
    FOR ALL
    USING (
      opportunity_id IN (
        SELECT id FROM public.opportunities
      )
    )
    WITH CHECK (
      opportunity_id IN (
        SELECT id FROM public.opportunities
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
