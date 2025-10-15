-- Migration: create client_roi_reports table and policies

CREATE TABLE IF NOT EXISTS public.client_roi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  period_start DATE,
  period_end DATE,
  roi_percent NUMERIC(8,2),
  arr_impact NUMERIC(14,2),
  highlights TEXT[],
  survey_score INTEGER,
  sentiment TEXT,
  shared_with TEXT[],
  shared_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_client_roi_reports_client
  ON public.client_roi_reports(client_id, generated_at DESC);

ALTER TABLE public.client_roi_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "client_roi_reports_select"
  ON public.client_roi_reports
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "client_roi_reports_write"
  ON public.client_roi_reports
  FOR ALL
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid() OR public.is_admin()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid() OR public.is_admin()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
