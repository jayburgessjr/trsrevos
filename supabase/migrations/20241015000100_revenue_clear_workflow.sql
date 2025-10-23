-- Revenue Clear workflow schema expansion
-- Adds pipeline + revenue clear domain tables and extends clients profile data

BEGIN;

-- Ensure clients have the metadata referenced by the Revenue Clear workflow
-- Note: owner_id, phase, status, updated_at already exist in base schema
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS revenue_model text,
  ADD COLUMN IF NOT EXISTS profit_margin numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_growth numeric(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS primary_goal text;

-- No need to promote legacy mrr - schema uses 'arr' (Annual Recurring Revenue)
-- monthly_recurring_revenue column was never added as it conflicts with existing 'arr' column

-- Core revenue pipeline table surfaced in onboarding flows
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  stage text DEFAULT 'Prospect',
  amount numeric(14,2) DEFAULT 0,
  probability numeric(5,2) DEFAULT 0,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  next_step text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS opportunities_client_idx
  ON public.opportunities(client_id, created_at DESC);

-- Revenue Clear intake information persists the guided workflow baseline
CREATE TABLE IF NOT EXISTS public.revenue_clear_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  financials jsonb NOT NULL DEFAULT '{}'::jsonb,
  goals jsonb NOT NULL DEFAULT '{}'::jsonb,
  clarity_summary_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS revenue_clear_intakes_client_idx
  ON public.revenue_clear_intakes(client_id);

-- Audit leaks by growth pillar
CREATE TABLE IF NOT EXISTS public.revenue_clear_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  pillar text NOT NULL,
  leak_severity numeric(4,1) DEFAULT 0,
  leak_description text,
  estimated_loss numeric(14,2) DEFAULT 0,
  score numeric(5,2) DEFAULT 0,
  leak_map_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  CONSTRAINT revenue_clear_audits_unique_pillar UNIQUE (client_id, pillar)
);

-- Blueprint interventions and ROI projections
CREATE TABLE IF NOT EXISTS public.revenue_clear_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  intervention_name text NOT NULL,
  diagnosis text,
  fix text,
  projected_lift numeric(5,2) DEFAULT 0,
  effort_score numeric(5,2) DEFAULT 0,
  roi_index numeric(6,2) DEFAULT 0,
  blueprint_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS revenue_clear_interventions_client_roi_idx
  ON public.revenue_clear_interventions(client_id, roi_index DESC);

-- RevBoard metrics tracked across the engagement
CREATE TABLE IF NOT EXISTS public.revenue_clear_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  kpi_name text NOT NULL,
  baseline_value numeric(14,2) DEFAULT 0,
  current_value numeric(14,2) DEFAULT 0,
  delta numeric(14,2) DEFAULT 0,
  intervention_id uuid REFERENCES public.revenue_clear_interventions(id) ON DELETE SET NULL,
  recorded_on date DEFAULT current_date,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS revenue_clear_metrics_client_idx
  ON public.revenue_clear_metrics(client_id, recorded_on);

-- Execution tasks and weekly accountability
CREATE TABLE IF NOT EXISTS public.revenue_clear_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  status text DEFAULT 'todo',
  assigned_to text,
  start_date date DEFAULT current_date,
  end_date date,
  progress_notes text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS revenue_clear_tasks_client_idx
  ON public.revenue_clear_tasks(client_id, start_date);

CREATE TABLE IF NOT EXISTS public.revenue_clear_weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  notes text,
  advisor_summary text,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS revenue_clear_weekly_summaries_client_idx
  ON public.revenue_clear_weekly_summaries(client_id);

-- Results and proposal next steps
CREATE TABLE IF NOT EXISTS public.revenue_clear_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  before_mrr numeric(14,2) DEFAULT 0,
  after_mrr numeric(14,2) DEFAULT 0,
  before_profit numeric(14,2) DEFAULT 0,
  after_profit numeric(14,2) DEFAULT 0,
  total_gain numeric(14,2) DEFAULT 0,
  payback_period numeric(6,2) DEFAULT 0,
  report_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS revenue_clear_results_client_idx
  ON public.revenue_clear_results(client_id);

CREATE TABLE IF NOT EXISTS public.revenue_clear_next_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  next_offer text DEFAULT 'Advisory',
  rationale text,
  projected_outcome numeric(14,2) DEFAULT 0,
  proposal_doc text,
  proposal_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS revenue_clear_next_steps_client_idx
  ON public.revenue_clear_next_steps(client_id);

-- -------------------------------------------------------------------
-- Row level security: lock Revenue Clear tables to client visibility
-- -------------------------------------------------------------------

ALTER TABLE public.revenue_clear_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_clear_next_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY revenue_clear_intakes_select
  ON public.revenue_clear_intakes FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_intakes_all
  ON public.revenue_clear_intakes FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_audits_select
  ON public.revenue_clear_audits FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_audits_all
  ON public.revenue_clear_audits FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_interventions_select
  ON public.revenue_clear_interventions FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_interventions_all
  ON public.revenue_clear_interventions FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_metrics_select
  ON public.revenue_clear_metrics FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_metrics_all
  ON public.revenue_clear_metrics FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_tasks_select
  ON public.revenue_clear_tasks FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_tasks_all
  ON public.revenue_clear_tasks FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_weekly_summaries_select
  ON public.revenue_clear_weekly_summaries FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_weekly_summaries_all
  ON public.revenue_clear_weekly_summaries FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_results_select
  ON public.revenue_clear_results FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_results_all
  ON public.revenue_clear_results FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_next_steps_select
  ON public.revenue_clear_next_steps FOR SELECT
  USING (client_id IN (SELECT id FROM public.clients));

CREATE POLICY revenue_clear_next_steps_all
  ON public.revenue_clear_next_steps FOR ALL
  USING (client_id IN (SELECT id FROM public.clients))
  WITH CHECK (client_id IN (SELECT id FROM public.clients));

COMMIT;

