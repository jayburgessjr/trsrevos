-- Generated schema additions for new Supabase tables
-- Source: docs/supabase-architecture-plan.json

-- ================================================================
-- opportunity_notes
-- ================================================================
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

CREATE POLICY IF NOT EXISTS "opportunity_notes_select"
  ON public.opportunity_notes
  FOR SELECT
  USING (
    opportunity_id IN (
      SELECT id FROM public.opportunities
    )
  );

CREATE POLICY IF NOT EXISTS "opportunity_notes_all"
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

-- ================================================================
-- client_health_history
-- ================================================================
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

CREATE POLICY IF NOT EXISTS "client_health_history_select"
  ON public.client_health_history
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients
    )
  );

CREATE POLICY IF NOT EXISTS "client_health_history_write"
  ON public.client_health_history
  FOR INSERT TO authenticated, service_role
  WITH CHECK (
    auth.role() = 'service_role' OR public.is_admin()
  );

CREATE POLICY IF NOT EXISTS "client_health_history_update"
  ON public.client_health_history
  FOR UPDATE
  USING (auth.role() = 'service_role' OR public.is_admin())
  WITH CHECK (auth.role() = 'service_role' OR public.is_admin());

-- ================================================================
-- project_updates
-- ================================================================
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT,
  summary TEXT,
  risk_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id
  ON public.project_updates(project_id DESC, created_at DESC);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "project_updates_select"
  ON public.project_updates
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects
    )
  );

CREATE POLICY IF NOT EXISTS "project_updates_mutate"
  ON public.project_updates
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid() OR public.is_admin()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE owner_id = auth.uid() OR public.is_admin()
    )
  );

-- ================================================================
-- content_metrics
-- ================================================================
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

CREATE POLICY IF NOT EXISTS "content_metrics_select"
  ON public.content_metrics
  FOR SELECT
  USING (
    content_id IN (
      SELECT id FROM public.content_items
    )
  );

CREATE POLICY IF NOT EXISTS "content_metrics_insert"
  ON public.content_metrics
  FOR INSERT TO authenticated, service_role
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "content_metrics_update"
  ON public.content_metrics
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ================================================================
-- media_assets
-- ================================================================
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

CREATE POLICY IF NOT EXISTS "media_assets_select"
  ON public.media_assets
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.media_projects
    )
  );

CREATE POLICY IF NOT EXISTS "media_assets_all"
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

-- ================================================================
-- focus_sessions
-- ================================================================
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

-- ================================================================
-- analytics_events
-- ================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_org_time
  ON public.analytics_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
  ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity
  ON public.analytics_events(entity_type, entity_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "analytics_events_select"
  ON public.analytics_events
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR public.is_admin()
    OR organization_id IS NULL
  );

CREATE POLICY IF NOT EXISTS "analytics_events_insert"
  ON public.analytics_events
  FOR INSERT TO public
  WITH CHECK (
    organization_id = public.user_organization_id()
    OR organization_id IS NULL
    OR auth.role() = 'service_role'
  );

-- ================================================================
-- audit_log
-- ================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_time
  ON public.audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource
  ON public.audit_log(resource_type, resource_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "audit_log_select"
  ON public.audit_log
  FOR SELECT
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  );

CREATE POLICY IF NOT EXISTS "audit_log_insert"
  ON public.audit_log
  FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

-- ================================================================
-- agent_definitions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.agent_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  auto_runnable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_agent_definitions_org_key
  ON public.agent_definitions(organization_id, agent_key);

ALTER TABLE public.agent_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "agent_definitions_select"
  ON public.agent_definitions
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() OR public.is_super_admin()
  );

CREATE POLICY IF NOT EXISTS "agent_definitions_all"
  ON public.agent_definitions
  FOR ALL
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  )
  WITH CHECK (
    organization_id = public.user_organization_id() AND public.is_admin()
  );

-- ================================================================
-- agent_behaviors
-- ================================================================
CREATE TABLE IF NOT EXISTS public.agent_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT NOT NULL REFERENCES public.agent_definitions(agent_key) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  behavior JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_agent_behaviors_org_agent
  ON public.agent_behaviors(organization_id, agent_key);

ALTER TABLE public.agent_behaviors ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "agent_behaviors_select"
  ON public.agent_behaviors
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() OR public.is_super_admin()
  );

CREATE POLICY IF NOT EXISTS "agent_behaviors_all"
  ON public.agent_behaviors
  FOR ALL
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  )
  WITH CHECK (
    organization_id = public.user_organization_id() AND public.is_admin()
  );

-- ================================================================
-- integration_settings
-- ================================================================
CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_integration_settings_org
  ON public.integration_settings(organization_id);

ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "integration_settings_select"
  ON public.integration_settings
  FOR SELECT
  USING (
    organization_id = public.user_organization_id() AND public.is_admin()
  );

CREATE POLICY IF NOT EXISTS "integration_settings_all"
  ON public.integration_settings
  FOR ALL
  USING (auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin()))
  WITH CHECK (auth.role() = 'service_role' OR (organization_id = public.user_organization_id() AND public.is_admin()));

-- ================================================================
-- share_space_artifacts
-- ================================================================
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

CREATE POLICY IF NOT EXISTS "share_space_artifacts_select"
  ON public.share_space_artifacts
  FOR SELECT
  USING (
    share_id IN (
      SELECT id FROM public.share_spaces
    )
  );

CREATE POLICY IF NOT EXISTS "share_space_artifacts_all"
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

-- ================================================================
-- dashboard_snapshots
-- ================================================================
CREATE TABLE IF NOT EXISTS public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  time_scope TEXT NOT NULL,
  segment_filter JSONB DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_dashboard_snapshots_org_scope
  ON public.dashboard_snapshots(organization_id, time_scope, computed_at DESC);

ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "dashboard_snapshots_select"
  ON public.dashboard_snapshots
  FOR SELECT
  USING (
    organization_id = public.user_organization_id()
    OR organization_id IS NULL
    OR public.is_super_admin()
  );

CREATE POLICY IF NOT EXISTS "dashboard_snapshots_all"
  ON public.dashboard_snapshots
  FOR ALL TO public
  USING (
    auth.role() = 'service_role'
    OR organization_id = public.user_organization_id()
    OR organization_id IS NULL
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR organization_id = public.user_organization_id()
    OR organization_id IS NULL
  );

-- ================================================================
-- user_integrations
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  scope TEXT,
  token_type TEXT,
  expiry_date TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "user_integrations_manage"
  ON public.user_integrations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
