-- Migration: Enable Bi-Directional HubSpot Sync
-- Adds sync tracking, triggers, and logging for TRS ↔ HubSpot synchronization

-- Add sync tracking columns to opportunities
ALTER TABLE public.opportunities
  ADD COLUMN IF NOT EXISTS hubspot_synced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_error TEXT,
  ADD COLUMN IF NOT EXISTS needs_sync BOOLEAN DEFAULT true;

-- Add sync tracking to clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS hubspot_synced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_error TEXT,
  ADD COLUMN IF NOT EXISTS needs_sync BOOLEAN DEFAULT true;

-- Add sync tracking to contacts
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS hubspot_synced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_error TEXT,
  ADD COLUMN IF NOT EXISTS needs_sync BOOLEAN DEFAULT true;

-- Create sync log table for monitoring
CREATE TABLE IF NOT EXISTS public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type TEXT NOT NULL CHECK (object_type IN ('opportunity', 'client', 'contact', 'note')),
  object_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'success', 'error')),
  message TEXT,
  error_details JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_log_object
  ON public.sync_log(object_type, object_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_log_status
  ON public.sync_log(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_log_direction
  ON public.sync_log(direction, created_at DESC);

-- Enable RLS on sync_log
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist (for idempotency)
DROP POLICY IF EXISTS "sync_log_select" ON public.sync_log;
DROP POLICY IF EXISTS "sync_log_insert" ON public.sync_log;

-- Create RLS policies
CREATE POLICY "sync_log_select"
  ON public.sync_log
  FOR SELECT
  USING (
    public.is_admin() OR auth.role() = 'service_role'
  );

CREATE POLICY "sync_log_insert"
  ON public.sync_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Function to mark opportunity for sync on update
CREATE OR REPLACE FUNCTION trigger_opportunity_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only mark for sync if actual data changed (not just metadata)
  IF (
    NEW.name IS DISTINCT FROM OLD.name OR
    NEW.amount IS DISTINCT FROM OLD.amount OR
    NEW.stage IS DISTINCT FROM OLD.stage OR
    NEW.probability IS DISTINCT FROM OLD.probability OR
    NEW.close_date IS DISTINCT FROM OLD.close_date OR
    NEW.owner_id IS DISTINCT FROM OLD.owner_id OR
    NEW.next_step IS DISTINCT FROM OLD.next_step
  ) THEN
    NEW.needs_sync := true;
    NEW.hubspot_synced := false;

    -- Log the change
    INSERT INTO public.sync_log(object_type, object_id, direction, status, message)
    VALUES('opportunity', NEW.id, 'outbound', 'queued', 'Opportunity updated, queued for sync to HubSpot');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark client for sync on update
CREATE OR REPLACE FUNCTION trigger_client_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.name IS DISTINCT FROM OLD.name OR
    NEW.segment IS DISTINCT FROM OLD.segment OR
    NEW.arr IS DISTINCT FROM OLD.arr OR
    NEW.industry IS DISTINCT FROM OLD.industry OR
    NEW.region IS DISTINCT FROM OLD.region OR
    NEW.phase IS DISTINCT FROM OLD.phase OR
    NEW.owner_id IS DISTINCT FROM OLD.owner_id OR
    NEW.status IS DISTINCT FROM OLD.status
  ) THEN
    NEW.needs_sync := true;
    NEW.hubspot_synced := false;

    INSERT INTO public.sync_log(object_type, object_id, direction, status, message)
    VALUES('client', NEW.id, 'outbound', 'queued', 'Client updated, queued for sync to HubSpot');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark contact for sync on update
CREATE OR REPLACE FUNCTION trigger_contact_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.name IS DISTINCT FROM OLD.name OR
    NEW.email IS DISTINCT FROM OLD.email OR
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.phone IS DISTINCT FROM OLD.phone
  ) THEN
    NEW.needs_sync := true;
    NEW.hubspot_synced := false;

    INSERT INTO public.sync_log(object_type, object_id, direction, status, message)
    VALUES('contact', NEW.id, 'outbound', 'queued', 'Contact updated, queued for sync to HubSpot');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_opportunity_update ON public.opportunities;
CREATE TRIGGER on_opportunity_update
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION trigger_opportunity_sync();

DROP TRIGGER IF EXISTS on_client_update ON public.clients;
CREATE TRIGGER on_client_update
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION trigger_client_sync();

DROP TRIGGER IF EXISTS on_contact_update ON public.contacts;
CREATE TRIGGER on_contact_update
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION trigger_contact_sync();

-- Create indexes for needs_sync queries
CREATE INDEX IF NOT EXISTS idx_opportunities_needs_sync
  ON public.opportunities(needs_sync, last_synced_at)
  WHERE needs_sync = true;

CREATE INDEX IF NOT EXISTS idx_clients_needs_sync
  ON public.clients(needs_sync, last_synced_at)
  WHERE needs_sync = true;

CREATE INDEX IF NOT EXISTS idx_contacts_needs_sync
  ON public.contacts(needs_sync, last_synced_at)
  WHERE needs_sync = true;

-- Function to get sync statistics
CREATE OR REPLACE FUNCTION get_sync_stats()
RETURNS TABLE(
  opportunities_pending BIGINT,
  clients_pending BIGINT,
  contacts_pending BIGINT,
  sync_errors_24h BIGINT,
  last_successful_sync TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.opportunities WHERE needs_sync = true),
    (SELECT COUNT(*) FROM public.clients WHERE needs_sync = true),
    (SELECT COUNT(*) FROM public.contacts WHERE needs_sync = true),
    (SELECT COUNT(*) FROM public.sync_log WHERE status = 'error' AND created_at > now() - interval '24 hours'),
    (SELECT MAX(completed_at) FROM public.sync_log WHERE status = 'success');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_sync_stats() TO authenticated, service_role;

COMMENT ON TABLE public.sync_log IS 'Tracks all HubSpot ↔ TRS synchronization events';
COMMENT ON COLUMN public.opportunities.needs_sync IS 'Marks opportunity for next sync cycle';
COMMENT ON COLUMN public.opportunities.hubspot_synced IS 'Last sync completed successfully';
COMMENT ON FUNCTION trigger_opportunity_sync IS 'Automatically marks opportunities for HubSpot sync on meaningful updates';
