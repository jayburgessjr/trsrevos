-- Migration: create content_metrics table and policies

CREATE TABLE IF NOT EXISTS public.content_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  influenced NUMERIC(12,2),
  advanced NUMERIC(12,2),
  closed_won NUMERIC(12,2),
  usage_rate NUMERIC(12,2),
  views INTEGER,
  ctr NUMERIC(6,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_content_metrics_content_date
  ON public.content_metrics(content_id, metric_date DESC);

ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "content_metrics_select"
  ON public.content_metrics
  FOR SELECT
  USING (
    content_id IN (
      SELECT id FROM public.content_items
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "content_metrics_insert"
  ON public.content_metrics
  FOR INSERT TO authenticated, service_role
  WITH CHECK (auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "content_metrics_update"
  ON public.content_metrics
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
