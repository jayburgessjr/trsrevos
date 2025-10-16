-- =====================================================================
-- TRSREVOS DATABASE SCHEMA
-- Core automation triggers and dependencies for clients → pipeline → finance → dashboard
-- =====================================================================

SET search_path TO public, pg_temp;

-- Enable extensions used by the operational automation + knowledge layers
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  status text DEFAULT 'active',
  plan text DEFAULT 'growth',
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  type text DEFAULT 'standard',
  industry text,
  revenue_model text,
  monthly_recurring_revenue numeric(14,2) DEFAULT 0,
  profit_margin numeric(5,2) DEFAULT 0,
  target_growth numeric(5,2) DEFAULT 0,
  primary_goal text,
  phase text DEFAULT 'Discovery',
  status text DEFAULT 'active',
  mrr numeric,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  stage text DEFAULT 'Discovery',
  deal_value numeric(14,2) DEFAULT 0,
  probability numeric(4,2) DEFAULT 0.5,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

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

CREATE TABLE IF NOT EXISTS public.finance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  monthly_recurring_revenue numeric(14,2) DEFAULT 0,
  outstanding_invoices numeric(14,2) DEFAULT 0,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.dashboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metric text,
  value numeric(14,2),
  recorded_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  status text DEFAULT 'idle',
  last_run_at timestamptz,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  run_metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.agent_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  version integer DEFAULT 1,
  display_name text,
  description text,
  lifecycle_status text DEFAULT 'active',
  auto_runnable boolean DEFAULT false,
  definition jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  retired_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS agent_definitions_unique
  ON public.agent_definitions(organization_id, agent_key, version);

CREATE TABLE IF NOT EXISTS public.agent_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid REFERENCES public.agent_definitions(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text DEFAULT 'system',
  content text NOT NULL,
  lifecycle_status text DEFAULT 'active',
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.agent_guardrails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid REFERENCES public.agent_definitions(id) ON DELETE CASCADE,
  rule text NOT NULL,
  severity text DEFAULT 'medium',
  remediation text,
  lifecycle_status text DEFAULT 'active',
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  input jsonb DEFAULT '{}'::jsonb,
  output jsonb DEFAULT '{}'::jsonb,
  summary text,
  guardrail_violations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS agent_runs_agent_idx
  ON public.agent_runs(organization_id, agent_key, created_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  memory_type text DEFAULT 'observation',
  title text,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}',
  salience_score numeric(6,2) DEFAULT 0,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS agent_memories_search_idx
  ON public.agent_memories USING gin(search_vector);

CREATE INDEX IF NOT EXISTS agent_memories_agent_idx
  ON public.agent_memories(organization_id, agent_key, salience_score DESC);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text DEFAULT 'Active',
  phase text DEFAULT 'Discovery',
  health text DEFAULT 'Green',
  start_date date,
  end_date date,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  progress numeric(5,2) DEFAULT 0,
  budget numeric(14,2) DEFAULT 0,
  spent numeric(14,2) DEFAULT 0,
  project_type text DEFAULT 'Advisory',
  hubspot_deal_id text,
  quickbooks_invoice_url text,
  quickbooks_invoice_id text,
  kickoff_notes text,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS projects_client_idx
  ON public.projects(client_id, status);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'Advisory';

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS hubspot_deal_id text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS quickbooks_invoice_url text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS quickbooks_invoice_id text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS kickoff_notes text;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text DEFAULT 'contributor',
  allocation numeric(5,2) DEFAULT 1.0,
  joined_at timestamptz DEFAULT timezone('utc', now()),
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  link_type text NOT NULL,
  label text,
  url text NOT NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  resource_type text DEFAULT 'file',
  file_path text,
  external_url text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS resources_tags_idx
  ON public.resources USING gin(tags);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  document_type text,
  status text DEFAULT 'draft',
  tags text[] DEFAULT '{}',
  current_version_id uuid,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS documents_project_idx
  ON public.documents(project_id, document_type);

CREATE TABLE IF NOT EXISTS public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  file_path text NOT NULL,
  file_checksum text,
  file_size bigint,
  mime_type text,
  ai_summary text,
  ai_embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS document_versions_unique
  ON public.document_versions(document_id, version);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'documents_current_version_fk'
  ) THEN
    ALTER TABLE public.documents
      ADD CONSTRAINT documents_current_version_fk
      FOREIGN KEY (current_version_id)
      REFERENCES public.document_versions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.document_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES public.documents(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS document_tags_idx
  ON public.document_tags(tag, document_id);

CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  title text NOT NULL,
  content_type text NOT NULL,
  draft_text text,
  final_text text,
  status text DEFAULT 'Draft',
  generated_by_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS content_items_project_idx
  ON public.content_items(project_id, content_type, status);

CREATE TABLE IF NOT EXISTS public.project_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  linked_at timestamptz DEFAULT timezone('utc', now()),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.document_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  linked_at timestamptz DEFAULT timezone('utc', now()),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  UNIQUE(document_id, resource_id)
);

CREATE TABLE IF NOT EXISTS public.project_agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_key text NOT NULL,
  definition_id uuid REFERENCES public.agent_definitions(id) ON DELETE SET NULL,
  run_id uuid REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  input_payload jsonb DEFAULT '{}'::jsonb,
  output_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS project_agent_runs_project_idx
  ON public.project_agent_runs(project_id, agent_key, created_at DESC);

CREATE TABLE IF NOT EXISTS public.automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  source_system text NOT NULL,
  event_key text NOT NULL,
  status text DEFAULT 'pending',
  payload jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz DEFAULT timezone('utc', now()),
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS automation_events_project_idx
  ON public.automation_events(project_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.project_kickoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  kickoff_date date DEFAULT current_date,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  agenda jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.invoice_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

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

CREATE INDEX IF NOT EXISTS invoice_schedules_client_idx
  ON public.invoice_schedules(client_id, due_date);

CREATE TABLE IF NOT EXISTS public.automation_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  status text DEFAULT 'draft',
  configuration jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS automation_playbooks_trigger_idx
  ON public.automation_playbooks(organization_id, trigger_event, status);

CREATE TABLE IF NOT EXISTS public.automation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id uuid REFERENCES public.automation_playbooks(id) ON DELETE CASCADE,
  sort_order integer NOT NULL,
  workspace text NOT NULL,
  action text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS automation_steps_playbook_idx
  ON public.automation_steps(playbook_id, sort_order);

CREATE TABLE IF NOT EXISTS public.automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id uuid REFERENCES public.automation_playbooks(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  triggered_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  context jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'processing',
  created_at timestamptz DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS automation_runs_playbook_idx
  ON public.automation_runs(playbook_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.automation_run_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.automation_runs(id) ON DELETE CASCADE,
  step_id uuid REFERENCES public.automation_steps(id) ON DELETE SET NULL,
  workspace text,
  action text,
  status text DEFAULT 'pending',
  output jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS automation_run_steps_run_idx
  ON public.automation_run_steps(run_id, created_at);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event_key text NOT NULL,
  event_type text,
  category text,
  workflow text,
  entity text,
  entity_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  occurred_at timestamptz DEFAULT timezone('utc', now()),
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS analytics_events_org_idx
  ON public.analytics_events(organization_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_event_key_idx
  ON public.analytics_events(event_key);

CREATE TABLE IF NOT EXISTS public.client_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  form_id text,
  data jsonb,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.client_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  reference text,
  type text,
  status text,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- =====================================================================
-- AUTOMATION FUNCTIONS
-- =====================================================================

-- =====================================================================
-- UTILITY FUNCTIONS
-- =====================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CLIENT → PIPELINE
CREATE OR REPLACE FUNCTION public.auto_create_pipeline_on_new_client()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.pipeline WHERE client_id = NEW.id
  ) THEN
    INSERT INTO public.pipeline (client_id, stage, deal_value, probability, user_id)
    VALUES (NEW.id, 'Discovery', 0, 0.5, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PIPELINE → FINANCE
CREATE OR REPLACE FUNCTION public.auto_create_finance_on_closed_won()
RETURNS trigger AS $$
BEGIN
  IF NEW.stage = 'Closed Won' THEN
    INSERT INTO public.finance (client_id, monthly_recurring_revenue, outstanding_invoices, user_id)
    VALUES (NEW.client_id, NEW.deal_value, 0, NEW.user_id)
    ON CONFLICT (client_id)
    DO UPDATE SET monthly_recurring_revenue = EXCLUDED.monthly_recurring_revenue,
                  updated_at = timezone('utc', now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FINANCE → DASHBOARD
CREATE OR REPLACE FUNCTION public.update_dashboard_snapshots()
RETURNS trigger AS $$
DECLARE total_mrr NUMERIC;
BEGIN
  SELECT COALESCE(SUM(monthly_recurring_revenue), 0)
  INTO total_mrr FROM public.finance WHERE user_id = NEW.user_id;

  INSERT INTO public.dashboard_snapshots (user_id, metric, value, recorded_at)
  VALUES (NEW.user_id, 'total_mrr', total_mrr, timezone('utc', now()));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AGENTS → ANALYTICS LOG
CREATE OR REPLACE FUNCTION public.log_agent_run()
RETURNS trigger AS $$
DECLARE
  org_id uuid;
BEGIN
  SELECT organization_id INTO org_id FROM public.users WHERE id = NEW.user_id;

  INSERT INTO public.analytics_events (
    organization_id,
    user_id,
    event_key,
    event_type,
    category,
    entity,
    entity_id,
    payload,
    occurred_at
  )
  VALUES (
    org_id,
    NEW.user_id,
    'agent.run.recorded',
    'agent_run',
    'agents',
    'agents',
    NEW.id::text,
    COALESCE(NEW.run_metadata, '{}'::jsonb),
    timezone('utc', now())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.match_agent_memories(
  p_query text,
  p_agent_key text,
  p_organization uuid,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  agent_key text,
  title text,
  content text,
  metadata jsonb,
  salience_score numeric,
  created_at timestamptz
) AS $$
DECLARE
  search_query tsquery;
BEGIN
  IF p_query IS NULL OR trim(p_query) = '' THEN
    search_query := NULL;
  ELSE
    search_query := plainto_tsquery('english', p_query);
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.agent_key,
    m.title,
    m.content,
    m.metadata,
    m.salience_score,
    m.created_at
  FROM public.agent_memories m
  WHERE m.organization_id = p_organization
    AND (p_agent_key IS NULL OR m.agent_key = p_agent_key)
    AND (
      search_query IS NULL
      OR m.search_vector @@ search_query
    )
  ORDER BY
    GREATEST(m.salience_score, 0) DESC,
    CASE
      WHEN search_query IS NULL THEN 0
      ELSE ts_rank_cd(m.search_vector, search_query)
    END DESC,
    m.created_at DESC
  LIMIT COALESCE(p_limit, 5);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

DROP TRIGGER IF EXISTS trg_auto_pipeline ON public.clients;
CREATE TRIGGER trg_auto_pipeline
AFTER INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_pipeline_on_new_client();

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_agent_definitions_updated ON public.agent_definitions;
CREATE TRIGGER trg_agent_definitions_updated
BEFORE UPDATE ON public.agent_definitions
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_agent_prompts_updated ON public.agent_prompts;
CREATE TRIGGER trg_agent_prompts_updated
BEFORE UPDATE ON public.agent_prompts
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_agent_guardrails_updated ON public.agent_guardrails;
CREATE TRIGGER trg_agent_guardrails_updated
BEFORE UPDATE ON public.agent_guardrails
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_agent_memories_updated ON public.agent_memories;
CREATE TRIGGER trg_agent_memories_updated
BEFORE UPDATE ON public.agent_memories
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated ON public.projects;
CREATE TRIGGER trg_projects_updated
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_invoice_schedules_updated ON public.invoice_schedules;
CREATE TRIGGER trg_invoice_schedules_updated
BEFORE UPDATE ON public.invoice_schedules
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_automation_playbooks_updated ON public.automation_playbooks;
CREATE TRIGGER trg_automation_playbooks_updated
BEFORE UPDATE ON public.automation_playbooks
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_auto_finance ON public.pipeline;
CREATE TRIGGER trg_auto_finance
AFTER UPDATE ON public.pipeline
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_finance_on_closed_won();

DROP TRIGGER IF EXISTS trg_dashboard_update ON public.finance;
CREATE TRIGGER trg_dashboard_update
AFTER INSERT OR UPDATE ON public.finance
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_snapshots();

DROP TRIGGER IF EXISTS trg_agent_log ON public.agents;
CREATE TRIGGER trg_agent_log
AFTER INSERT OR UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.log_agent_run();

-- =====================================================================
-- MOCK SEED DATA
-- =====================================================================

INSERT INTO public.users (full_name, email) VALUES
('Jay Burgess', 'jay@revenuescientists.com'),
('Revenue Assistant', 'agent@trs.dev');

INSERT INTO public.clients (name, user_id, type)
SELECT 'Acme Corp', id, 'equity' FROM public.users LIMIT 1;

INSERT INTO public.pipeline (client_id, stage, deal_value, probability, user_id)
SELECT c.id, 'Closed Won', 5000, 0.9, u.id
FROM public.clients c
JOIN public.users u ON c.user_id = u.id
LIMIT 1;

INSERT INTO public.finance (client_id, monthly_recurring_revenue, outstanding_invoices, user_id)
SELECT c.id, 5000, 0, u.id
FROM public.clients c
JOIN public.users u ON c.user_id = u.id
LIMIT 1;

INSERT INTO public.agents (name, status, user_id)
SELECT 'Rosie', 'active', id FROM public.users LIMIT 1;

-- =====================================================================
-- END OF FILE
-- =====================================================================
