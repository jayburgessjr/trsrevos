CREATE TABLE IF NOT EXISTS user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  provider text,
  access_token text,
  refresh_token text,
  scope text,
  token_type text,
  expiry_date timestamptz,
  connected_at timestamptz DEFAULT now()
);

CREATE TABLE hubspot_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE quickbooks_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  amount numeric,
  due_date timestamptz,
  status text,
  synced_at timestamptz DEFAULT now()
);

CREATE TABLE docs_deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  doc_id text,
  doc_url text,
  type text,
  created_at timestamptz DEFAULT now()
);
