-- Ensure client phase supports onboarding lifecycle
ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_phase_check;
ALTER TABLE public.clients
  ADD CONSTRAINT clients_phase_check
  CHECK (
    phase IS NULL
    OR phase IN (
      'Discovery',
      'Data',
      'Algorithm',
      'Architecture',
      'Compounding',
      'Onboarding',
      'Active'
    )
  );

-- Allow projects table to store planned onboarding workstreams
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (
    status IN ('Planned', 'Active', 'On Hold', 'Completed', 'Cancelled')
  );

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_health_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_health_check
  CHECK (
    health IS NULL
    OR health IN ('green', 'yellow', 'red', 'Green')
  );

-- Create client deliverables table if missing
CREATE TABLE IF NOT EXISTS public.client_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'dashboard',
  url TEXT,
  status TEXT DEFAULT 'Planned',
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_client_deliverables_client
  ON public.client_deliverables(client_id);

CREATE OR REPLACE FUNCTION public.rpc_convert_won_to_client(
  p_pipeline_id UUID,
  p_opportunity_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_client_id UUID;
  v_client record;
  v_pipeline record;
  v_opportunity record;
  v_owner_id UUID;
  v_org_id UUID;
  v_client_name TEXT;
  v_source TEXT := NULL;
  v_source_id UUID := NULL;
  v_project_id UUID;
  v_finance_id UUID;
  v_has_deliverables BOOLEAN;
  v_now TIMESTAMPTZ := timezone('utc', now());
  v_metadata JSONB;
  v_default_deliverables CONSTANT TEXT[] := ARRAY[
    'Executive Dashboard',
    'Operating KPIs',
    'Quarterly Review'
  ];
BEGIN
  IF p_opportunity_id IS NOT NULL THEN
    SELECT
      o.*,
      c.id AS existing_client_id,
      c.owner_id AS existing_owner_id,
      c.name AS existing_client_name,
      u.organization_id
    INTO v_opportunity
    FROM public.opportunities o
    LEFT JOIN public.clients c ON c.id = o.client_id
    LEFT JOIN public.users u ON u.id = o.owner_id
    WHERE o.id = p_opportunity_id;

    IF FOUND THEN
      v_source := 'opportunities';
      v_source_id := v_opportunity.id;
      v_client_id := v_opportunity.existing_client_id;
      v_owner_id := COALESCE(v_opportunity.existing_owner_id, v_opportunity.owner_id);
      v_org_id := v_opportunity.organization_id;
      v_client_name := COALESCE(v_opportunity.existing_client_name, v_opportunity.company, v_opportunity.name);
    END IF;
  END IF;

  IF v_client_id IS NULL AND p_pipeline_id IS NOT NULL THEN
    SELECT
      p.*,
      c.id AS existing_client_id,
      c.owner_id AS existing_owner_id,
      c.name AS existing_client_name,
      u.organization_id
    INTO v_pipeline
    FROM public.pipeline p
    LEFT JOIN public.clients c ON c.id = p.client_id
    LEFT JOIN public.users u ON u.id = p.user_id
    WHERE p.id = p_pipeline_id;

    IF FOUND THEN
      v_source := COALESCE(v_source, 'pipeline');
      v_source_id := COALESCE(v_source_id, v_pipeline.id);
      v_client_id := COALESCE(v_pipeline.existing_client_id, v_client_id);
      v_owner_id := COALESCE(v_pipeline.existing_owner_id, v_pipeline.user_id, v_owner_id);
      v_org_id := COALESCE(v_pipeline.organization_id, v_org_id);
      v_client_name := COALESCE(v_pipeline.existing_client_name, v_client_name);
    END IF;
  END IF;

  IF v_client_id IS NOT NULL THEN
    SELECT * INTO v_client FROM public.clients WHERE id = v_client_id;
  END IF;

  v_owner_id := COALESCE(v_client.owner_id, v_owner_id, v_opportunity.owner_id, v_pipeline.user_id);
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Unable to resolve owner for client conversion';
  END IF;

  IF v_client IS NULL THEN
    INSERT INTO public.clients (name, owner_id, status, phase, created_at, updated_at)
    VALUES (
      COALESCE(v_client_name, 'New Client'),
      v_owner_id,
      'active',
      'Onboarding',
      v_now,
      v_now
    )
    RETURNING * INTO v_client;
    v_client_id := v_client.id;
  ELSE
    UPDATE public.clients
    SET
      status = 'active',
      phase = COALESCE(NULLIF(v_client.phase, ''), 'Onboarding'),
      updated_at = v_now
    WHERE id = v_client.id
    RETURNING * INTO v_client;

    IF v_client.phase IS DISTINCT FROM 'Onboarding' THEN
      UPDATE public.clients
      SET phase = 'Onboarding', updated_at = v_now
      WHERE id = v_client.id;
      v_client.phase := 'Onboarding';
    END IF;
  END IF;

  v_client_name := v_client.name;

  -- Ensure implementation project exists
  SELECT id
  INTO v_project_id
  FROM public.projects
  WHERE client_id = v_client_id AND name = 'RevOS Implementation'
  LIMIT 1;

  IF v_project_id IS NULL THEN
    INSERT INTO public.projects (
      name,
      client_id,
      description,
      owner_id,
      status,
      phase,
      health,
      progress,
      start_date,
      created_at,
      updated_at
    )
    VALUES (
      'RevOS Implementation',
      v_client_id,
      'Foundational implementation project created during onboarding.',
      v_owner_id,
      'Planned',
      'Discovery',
      'Green',
      0,
      current_date,
      v_now,
      v_now
    )
    RETURNING id INTO v_project_id;
  END IF;

  -- Ensure finance record exists
  SELECT id
  INTO v_finance_id
  FROM public.finance
  WHERE client_id = v_client_id
  LIMIT 1;

  IF v_finance_id IS NULL THEN
    INSERT INTO public.finance (client_id, monthly_recurring_revenue, outstanding_invoices, user_id, updated_at)
    VALUES (v_client_id, 0, 0, v_owner_id, v_now)
    RETURNING id INTO v_finance_id;
  END IF;

  -- Ensure default deliverables exist
  SELECT EXISTS (
    SELECT 1 FROM public.client_deliverables WHERE client_id = v_client_id
  ) INTO v_has_deliverables;

  IF NOT v_has_deliverables THEN
    INSERT INTO public.client_deliverables (client_id, title, type, status)
    SELECT v_client_id, d, 'dashboard', 'Planned'
    FROM unnest(v_default_deliverables) AS d;
  END IF;

  -- Log analytics event
  v_metadata := jsonb_build_object(
    'source', COALESCE(v_source, 'pipeline'),
    'source_id', v_source_id,
    'created_by', v_owner_id
  );

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
    v_org_id,
    v_owner_id,
    'client_created_from_pipeline',
    'client',
    v_client_id::text,
    v_metadata,
    v_now
  );

  RETURN v_client_id;
END;
$$;
