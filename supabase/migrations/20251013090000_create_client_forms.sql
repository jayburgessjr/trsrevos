-- Create supporting columns on clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS mrr numeric;

-- Store schema-driven form submissions
CREATE TABLE IF NOT EXISTS public.client_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  form_id text NOT NULL,
  data jsonb NOT NULL,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS client_forms_client_idx ON public.client_forms (client_id);
CREATE INDEX IF NOT EXISTS client_forms_form_idx ON public.client_forms (form_id);

-- Link submissions to deliverables surface
CREATE TABLE IF NOT EXISTS public.client_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  reference text,
  type text,
  status text,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS client_deliverables_client_idx ON public.client_deliverables (client_id);
