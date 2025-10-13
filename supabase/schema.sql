-- =====================================================================
-- TRSREVOS DATABASE SCHEMA
-- Core automation triggers and dependencies for clients → pipeline → finance → dashboard
-- =====================================================================

SET search_path TO public, pg_temp;

-- =====================================================================
-- TABLES
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  type text DEFAULT 'standard',
  industry text,
  mrr numeric,
  created_at timestamptz DEFAULT timezone('utc', now())
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

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  event_type text,
  entity text,
  entity_id text,
  created_at timestamptz DEFAULT timezone('utc', now())
);

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
BEGIN
  INSERT INTO public.analytics_events (user_id, event_type, entity, entity_id, created_at)
  VALUES (NEW.user_id, 'agent_run', 'agents', NEW.id::text, timezone('utc', now()));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- TRIGGERS
-- =====================================================================

DROP TRIGGER IF EXISTS trg_auto_pipeline ON public.clients;
CREATE TRIGGER trg_auto_pipeline
AFTER INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_pipeline_on_new_client();

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
