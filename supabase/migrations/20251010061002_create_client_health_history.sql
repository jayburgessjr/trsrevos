-- Migration: create client_health_history table and policies

CREATE TABLE IF NOT EXISTS public.client_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  health INTEGER,
  churn_risk INTEGER,
  trs_score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_client_health_history_client_date
  ON public.client_health_history(client_id, snapshot_date DESC);

ALTER TABLE public.client_health_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "client_health_history_select"
  ON public.client_health_history
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
  CREATE POLICY "client_health_history_write"
  ON public.client_health_history
  FOR INSERT TO authenticated, service_role
  WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "client_health_history_update"
  ON public.client_health_history
  FOR UPDATE
  USING (auth.role() = 'service_role' OR public.is_admin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
