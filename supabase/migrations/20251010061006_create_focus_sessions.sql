-- Migration: create focus_sessions table and policies

CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_day
  ON public.focus_sessions(user_id, daily_plan_id, started_at);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "focus_sessions_select"
  ON public.focus_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY IF NOT EXISTS "focus_sessions_mutate"
  ON public.focus_sessions
  FOR ALL
  USING (
    user_id = auth.uid() OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
  );
