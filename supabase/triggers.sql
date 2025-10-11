-- ================================================================
-- Automation triggers and helper functions for TRS RevOS
-- ================================================================

-- Ensure functions execute within the public schema
SET search_path TO public;

-- ================================================================
-- Function: auto_create_pipeline_on_new_client()
-- Creates a default pipeline record whenever a new client is inserted
-- ================================================================
CREATE OR REPLACE FUNCTION public.auto_create_pipeline_on_new_client()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.pipeline (client_id, stage, deal_value, probability, user_id)
  VALUES (NEW.id, 'Discovery', 0, 0.5, NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ================================================================
-- Function: auto_create_finance_on_closed_won()
-- Inserts or updates finance records when pipeline deals close
-- ================================================================
CREATE OR REPLACE FUNCTION public.auto_create_finance_on_closed_won()
RETURNS trigger AS $$
BEGIN
  IF NEW.stage = 'Closed Won' AND (OLD.stage IS DISTINCT FROM 'Closed Won') THEN
    INSERT INTO public.finance (client_id, monthly_recurring_revenue, outstanding_invoices, user_id)
    VALUES (NEW.client_id, NEW.deal_value, 0, NEW.user_id)
    ON CONFLICT (client_id) DO UPDATE
      SET monthly_recurring_revenue = EXCLUDED.monthly_recurring_revenue,
          outstanding_invoices      = EXCLUDED.outstanding_invoices,
          user_id                   = EXCLUDED.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ================================================================
-- Function: update_dashboard_snapshots()
-- Adds a finance snapshot when revenue figures change
-- ================================================================
CREATE OR REPLACE FUNCTION public.update_dashboard_snapshots()
RETURNS trigger AS $$
DECLARE
  total_mrr NUMERIC(14,2);
  org_id UUID;
BEGIN
  SELECT COALESCE(SUM(monthly_recurring_revenue), 0)
    INTO total_mrr
    FROM public.finance
   WHERE user_id = NEW.user_id;

  SELECT organization_id
    INTO org_id
    FROM public.users
   WHERE id = NEW.user_id;

  INSERT INTO public.dashboard_snapshots (
    organization_id,
    time_scope,
    segment_filter,
    metrics,
    computed_at
  )
  VALUES (
    org_id,
    'finance_realtime',
    jsonb_build_object('user_id', NEW.user_id),
    jsonb_build_object('total_mrr', COALESCE(total_mrr, 0)),
    timezone('utc', NOW())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ================================================================
-- Function: log_agent_run()
-- Writes agent run events to analytics_events for observability
-- ================================================================
CREATE OR REPLACE FUNCTION public.log_agent_run()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.analytics_events (
    organization_id,
    user_id,
    event_type,
    entity_type,
    entity_id,
    metadata,
    created_at
  )
  VALUES (
    NEW.organization_id,
    NEW.user_id,
    'agent_run',
    'agents',
    NEW.id::TEXT,
    COALESCE(NEW.run_metadata, '{}'::jsonb),
    timezone('utc', NOW())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ================================================================
-- Trigger wiring
-- ================================================================

-- Client → Pipeline
DROP TRIGGER IF EXISTS trg_auto_pipeline ON public.clients;
CREATE TRIGGER trg_auto_pipeline
AFTER INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_pipeline_on_new_client();

-- Pipeline → Finance
DROP TRIGGER IF EXISTS trg_auto_finance ON public.pipeline;
CREATE TRIGGER trg_auto_finance
AFTER UPDATE ON public.pipeline
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_finance_on_closed_won();

-- Finance → Dashboard
DROP TRIGGER IF EXISTS trg_dashboard_update ON public.finance;
CREATE TRIGGER trg_dashboard_update
AFTER INSERT OR UPDATE ON public.finance
FOR EACH ROW
EXECUTE FUNCTION public.update_dashboard_snapshots();

-- Agents → Analytics
DROP TRIGGER IF EXISTS trg_agent_log ON public.agents;
CREATE TRIGGER trg_agent_log
AFTER INSERT OR UPDATE ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.log_agent_run();
