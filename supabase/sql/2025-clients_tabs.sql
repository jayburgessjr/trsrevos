-- Client workspace schema extensions for 2025 tabbed experience

-- === Discovery + Forms ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'discovery_responses'
  ) THEN
    CREATE TABLE public.discovery_responses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.clients(id),
      form_type text NOT NULL,
      answers jsonb NOT NULL DEFAULT '{}'::jsonb,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
    CREATE INDEX ON public.discovery_responses (client_id, form_type);
  END IF;
END$$;

-- === Data Requirements / Collection ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'data_requirements'
  ) THEN
    CREATE TABLE public.data_requirements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.clients(id),
      source_name text NOT NULL,
      required boolean NOT NULL DEFAULT true,
      status text NOT NULL DEFAULT 'needed',
      notes text,
      meta jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
    CREATE UNIQUE INDEX uq_data_req_client_source ON public.data_requirements(client_id, source_name);
  END IF;
END$$;

-- === QRA runs + saved strategies ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'qra_runs'
  ) THEN
    CREATE TABLE public.qra_runs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.clients(id),
      inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
      outputs jsonb NOT NULL DEFAULT '{}'::jsonb,
      selected_strategy_key text,
      created_by uuid,
      created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
    CREATE INDEX ON public.qra_runs (client_id, created_at DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'client_strategies'
  ) THEN
    CREATE TABLE public.client_strategies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.clients(id),
      title text NOT NULL,
      key text,
      body jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'active',
      created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
    CREATE INDEX ON public.client_strategies (client_id, status);
  END IF;
END$$;

-- === Client Deliverables (link to existing content_items or external links) ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'client_deliverables'
  ) THEN
    CREATE TABLE public.client_deliverables (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid NOT NULL REFERENCES public.clients(id),
      content_id uuid,
      title text NOT NULL,
      type text NOT NULL,
      url text,
      share_expires_at timestamptz,
      meta jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
    CREATE INDEX ON public.client_deliverables (client_id, type);
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'client_deliverables' AND column_name = 'content_id'
    ) THEN
      ALTER TABLE public.client_deliverables ADD COLUMN content_id uuid;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'client_deliverables' AND column_name = 'share_expires_at'
    ) THEN
      ALTER TABLE public.client_deliverables ADD COLUMN share_expires_at timestamptz;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'client_deliverables' AND column_name = 'type'
    ) THEN
      ALTER TABLE public.client_deliverables ADD COLUMN type text NOT NULL DEFAULT 'content';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'client_deliverables' AND column_name = 'url'
    ) THEN
      ALTER TABLE public.client_deliverables ADD COLUMN url text;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'client_deliverables' AND column_name = 'meta'
    ) THEN
      ALTER TABLE public.client_deliverables ADD COLUMN meta jsonb NOT NULL DEFAULT '{}'::jsonb;
    END IF;
  END IF;
END$$;

-- === Finance extensions (terms) ===
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'finance' AND column_name = 'arrangement_type'
  ) THEN
    ALTER TABLE public.finance ADD COLUMN arrangement_type text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'finance' AND column_name = 'equity_stake_pct'
  ) THEN
    ALTER TABLE public.finance ADD COLUMN equity_stake_pct numeric(5,2);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'finance' AND column_name = 'projection_mrr'
  ) THEN
    ALTER TABLE public.finance ADD COLUMN projection_mrr numeric(14,2);
  END IF;
END$$;
