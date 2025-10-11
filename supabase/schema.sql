-- TRSREVOS Supabase schema rebuild
-- Generated to standardize core modules, analytics, integrations, and row-level security

BEGIN;

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- USERS
-- ================================================================
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'manager', 'executive', 'admin')),
  timezone TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON public.users;
CREATE TRIGGER trg_users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.users
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- AGENTS
-- ================================================================
DROP TABLE IF EXISTS public.agents CASCADE;
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);

DROP TRIGGER IF EXISTS trg_agents_set_updated_at ON public.agents;
CREATE TRIGGER trg_agents_set_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.agents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.agents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.agents
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- CLIENTS
-- ================================================================
DROP TABLE IF EXISTS public.clients CASCADE;
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  company_domain TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'prospect', 'inactive')),
  stage TEXT NOT NULL DEFAULT 'discovery' CHECK (stage IN ('discovery', 'proposal', 'negotiation', 'implementation', 'live')),
  industry TEXT,
  size_segment TEXT,
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),
  churn_risk INTEGER CHECK (churn_risk BETWEEN 0 AND 100),
  onboarding_date DATE,
  renewal_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON public.clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON public.clients(stage);

DROP TRIGGER IF EXISTS trg_clients_set_updated_at ON public.clients;
CREATE TRIGGER trg_clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.clients
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- PIPELINE
-- ================================================================
DROP TABLE IF EXISTS public.pipeline CASCADE;
CREATE TABLE public.pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'discovery' CHECK (stage IN ('discovery', 'qualified', 'proposal', 'contract', 'closed_won', 'closed_lost')),
  deal_value NUMERIC(14,2),
  probability INTEGER CHECK (probability BETWEEN 0 AND 100),
  expected_close_date DATE,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_pipeline_user_id ON public.pipeline(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_client_id ON public.pipeline(client_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON public.pipeline(stage);

DROP TRIGGER IF EXISTS trg_pipeline_set_updated_at ON public.pipeline;
CREATE TRIGGER trg_pipeline_set_updated_at
  BEFORE UPDATE ON public.pipeline
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.pipeline
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.pipeline
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.pipeline
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- PROJECTS
-- ================================================================
DROP TABLE IF EXISTS public.projects CASCADE;
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.pipeline(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  due_date DATE,
  completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

DROP TRIGGER IF EXISTS trg_projects_set_updated_at ON public.projects;
CREATE TRIGGER trg_projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.projects
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- FINANCE
-- ================================================================
DROP TABLE IF EXISTS public.finance CASCADE;
CREATE TABLE public.finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  quickbooks_id TEXT,
  record_type TEXT NOT NULL CHECK (record_type IN ('invoice', 'payment', 'expense', 'adjustment')),
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'void', 'overdue')),
  issued_date DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_finance_user_id ON public.finance(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_client_id ON public.finance(client_id);
CREATE INDEX IF NOT EXISTS idx_finance_project_id ON public.finance(project_id);
CREATE INDEX IF NOT EXISTS idx_finance_status ON public.finance(status);

DROP TRIGGER IF EXISTS trg_finance_set_updated_at ON public.finance;
CREATE TRIGGER trg_finance_set_updated_at
  BEFORE UPDATE ON public.finance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.finance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.finance
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.finance
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.finance
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- CONTENT
-- ================================================================
DROP TABLE IF EXISTS public.content CASCADE;
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'note' CHECK (content_type IN ('note', 'briefing', 'update', 'asset')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'client')),
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_content_user_id ON public.content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_client_id ON public.content(client_id);
CREATE INDEX IF NOT EXISTS idx_content_project_id ON public.content(project_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);

DROP TRIGGER IF EXISTS trg_content_set_updated_at ON public.content;
CREATE TRIGGER trg_content_set_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.content
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.content
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.content
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- ANALYTICS EVENTS
-- ================================================================
DROP TABLE IF EXISTS public.analytics_events CASCADE;
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id ON public.analytics_events(client_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);

DROP TRIGGER IF EXISTS trg_analytics_events_set_updated_at ON public.analytics_events;
CREATE TRIGGER trg_analytics_events_set_updated_at
  BEFORE UPDATE ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.analytics_events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- DASHBOARD SNAPSHOTS
-- ================================================================
DROP TABLE IF EXISTS public.dashboard_snapshots CASCADE;
CREATE TABLE public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_user_id ON public.dashboard_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_date ON public.dashboard_snapshots(snapshot_date);

DROP TRIGGER IF EXISTS trg_dashboard_snapshots_set_updated_at ON public.dashboard_snapshots;
CREATE TRIGGER trg_dashboard_snapshots_set_updated_at
  BEFORE UPDATE ON public.dashboard_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.dashboard_snapshots
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.dashboard_snapshots
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.dashboard_snapshots
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- FOCUS SESSIONS
-- ================================================================
DROP TABLE IF EXISTS public.focus_sessions CASCADE;
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  summary TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON public.focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_client_id ON public.focus_sessions(client_id);

DROP TRIGGER IF EXISTS trg_focus_sessions_set_updated_at ON public.focus_sessions;
CREATE TRIGGER trg_focus_sessions_set_updated_at
  BEFORE UPDATE ON public.focus_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.focus_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.focus_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.focus_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- CLIENT HEALTH HISTORY
-- ================================================================
DROP TABLE IF EXISTS public.client_health_history CASCADE;
CREATE TABLE public.client_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  trend TEXT CHECK (trend IN ('improving', 'steady', 'declining')),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_client_health_history_user_id ON public.client_health_history(user_id);
CREATE INDEX IF NOT EXISTS idx_client_health_history_client_id ON public.client_health_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_health_history_recorded_at ON public.client_health_history(recorded_at);

DROP TRIGGER IF EXISTS trg_client_health_history_set_updated_at ON public.client_health_history;
CREATE TRIGGER trg_client_health_history_set_updated_at
  BEFORE UPDATE ON public.client_health_history
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.client_health_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.client_health_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.client_health_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.client_health_history
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- AUDIT LOG
-- ================================================================
DROP TABLE IF EXISTS public.audit_log CASCADE;
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id TEXT,
  ip_address TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON public.audit_log(occurred_at DESC);

DROP TRIGGER IF EXISTS trg_audit_log_set_updated_at ON public.audit_log;
CREATE TRIGGER trg_audit_log_set_updated_at
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.audit_log
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.audit_log
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- INTEGRATIONS
-- ================================================================
DROP TABLE IF EXISTS public.integrations CASCADE;
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'quickbooks')),
  external_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'requires_action', 'disconnected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON public.integrations(provider);

DROP TRIGGER IF EXISTS trg_integrations_set_updated_at ON public.integrations;
CREATE TRIGGER trg_integrations_set_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.integrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.integrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.integrations
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- CALENDAR EVENTS
-- ================================================================
DROP TABLE IF EXISTS public.calendar_events CASCADE;
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  event_external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_integration_id ON public.calendar_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON public.calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON public.calendar_events(start_at, end_at);

DROP TRIGGER IF EXISTS trg_calendar_events_set_updated_at ON public.calendar_events;
CREATE TRIGGER trg_calendar_events_set_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.calendar_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.calendar_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.calendar_events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- COMMUNICATIONS
-- ================================================================
DROP TABLE IF EXISTS public.communications CASCADE;
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'call', 'meeting', 'note')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal')),
  subject TEXT,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_communications_user_id ON public.communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON public.communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_channel ON public.communications(channel);
CREATE INDEX IF NOT EXISTS idx_communications_occurred_at ON public.communications(occurred_at DESC);

DROP TRIGGER IF EXISTS trg_communications_set_updated_at ON public.communications;
CREATE TRIGGER trg_communications_set_updated_at
  BEFORE UPDATE ON public.communications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users"
ON public.communications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
ON public.communications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow update/delete for record owners"
ON public.communications
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;
