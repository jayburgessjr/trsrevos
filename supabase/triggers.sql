-- ================================================================
-- Automation triggers and helper functions for TRS RevOS
-- ================================================================

SET search_path TO public, pg_temp;

DROP FUNCTION IF EXISTS public.auto_create_pipeline_on_new_client() CASCADE;
CREATE OR REPLACE FUNCTION public.auto_create_pipeline_on_new_client()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.pipeline p
    WHERE p.client_id = NEW.id
  ) THEN
    INSERT INTO public.pipeline (client_id, stage, deal_value, probability, user_id)
    VALUES (NEW.id, 'Discovery', 0, 0.5, NEW.owner_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ================================================================
DROP FUNCTION IF EXISTS public.auto_create_finance_on_closed_won() CASCADE;
CREATE OR REPLACE FUNCTION public.auto_create_finance_on_closed_won()
RETURNS trigger AS $$
BEGIN
  IF NEW.stage = 'Closed Won' THEN
    IF TG_OP = 'UPDATE' AND OLD.stage = 'Closed Won' THEN
      IF NEW.deal_value IS DISTINCT FROM OLD.deal_value THEN
        UPDATE public.finance
        SET monthly_recurring_revenue = NEW.deal_value,
            user_id = NEW.user_id,
            updated_at = timezone('utc', NOW())
        WHERE client_id = NEW.client_id;
      END IF;
    ELSE
      INSERT INTO public.finance (client_id, monthly_recurring_revenue, outstanding_invoices, user_id)
      VALUES (NEW.client_id, NEW.deal_value, 0, NEW.user_id)
      ON CONFLICT (client_id) DO UPDATE
        SET monthly_recurring_revenue = EXCLUDED.monthly_recurring_revenue,
            outstanding_invoices      = EXCLUDED.outstanding_invoices,
            user_id                   = EXCLUDED.user_id,
            updated_at                = timezone('utc', NOW());
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.stage = 'Closed Won' AND NEW.stage <> 'Closed Won' THEN
    UPDATE public.finance
    SET monthly_recurring_revenue = 0,
        outstanding_invoices = 0,
        user_id = NEW.user_id,
        updated_at = timezone('utc', NOW())
    WHERE client_id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ================================================================
DROP FUNCTION IF EXISTS public.update_dashboard_snapshots() CASCADE;
CREATE OR REPLACE FUNCTION public.update_dashboard_snapshots()
RETURNS trigger AS $$
DECLARE
  total_mrr NUMERIC(14,2);
  org_id UUID;
BEGIN
  SELECT organization_id
    INTO org_id
    FROM public.users
   WHERE id = NEW.user_id;

  IF org_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(f.monthly_recurring_revenue), 0)
    INTO total_mrr
    FROM public.finance f
    JOIN public.users u ON u.id = f.user_id
   WHERE u.organization_id = org_id;

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
    jsonb_build_object('organization_id', org_id),
    jsonb_build_object(
      'total_mrr', COALESCE(total_mrr, 0),
      'updated_finance_id', NEW.id
    ),
    timezone('utc', NOW())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- ================================================================
DROP FUNCTION IF EXISTS public.log_agent_run() CASCADE;
CREATE OR REPLACE FUNCTION public.log_agent_run()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (
    TG_OP = 'UPDATE' AND (
      NEW.last_run_at IS DISTINCT FROM OLD.last_run_at OR
      NEW.status IS DISTINCT FROM OLD.status OR
      COALESCE(NEW.run_metadata, '{}'::jsonb) IS DISTINCT FROM COALESCE(OLD.run_metadata, '{}'::jsonb)
    )
  ) THEN
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
      jsonb_build_object(
        'status', NEW.status,
        'last_run_at', NEW.last_run_at,
        'metadata', COALESCE(NEW.run_metadata, '{}'::jsonb)
      ),
      timezone('utc', NOW())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

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
