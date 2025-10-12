CREATE OR REPLACE FUNCTION public.rpc_ensure_client_onboarding(
  p_client_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_client record;
  v_owner_id UUID;
  v_now TIMESTAMPTZ := timezone('utc', now());
  v_project_id UUID;
  v_has_deliverables BOOLEAN;
  v_default_deliverables CONSTANT TEXT[] := ARRAY[
    'Executive Dashboard',
    'Operating KPIs',
    'Quarterly Review'
  ];
BEGIN
  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client % not found', p_client_id;
  END IF;

  v_owner_id := v_client.owner_id;

  IF v_client.phase IS DISTINCT FROM 'Onboarding' OR v_client.phase IS NULL THEN
    UPDATE public.clients
    SET phase = 'Onboarding', updated_at = v_now
    WHERE id = p_client_id;
  END IF;

  SELECT id
  INTO v_project_id
  FROM public.projects
  WHERE client_id = p_client_id AND name = 'RevOS Implementation'
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
      p_client_id,
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

  SELECT EXISTS (
    SELECT 1 FROM public.client_deliverables WHERE client_id = p_client_id
  ) INTO v_has_deliverables;

  IF NOT v_has_deliverables THEN
    INSERT INTO public.client_deliverables (client_id, title, type, status)
    SELECT p_client_id, d, 'dashboard', 'Planned'
    FROM unnest(v_default_deliverables) AS d;
  END IF;

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
    NULL,
    v_owner_id,
    'client_onboarding_ensured',
    'client',
    p_client_id::text,
    jsonb_build_object('project_id', v_project_id),
    v_now
  );
END;
$$;
