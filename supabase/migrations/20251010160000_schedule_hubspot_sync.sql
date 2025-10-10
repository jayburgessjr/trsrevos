-- Schedule HubSpot Bi-Directional Sync Cron Job
-- Runs every 10 minutes to push TRS changes → HubSpot

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule existing job if it exists (ignore errors if not found)
DO $$
BEGIN
  PERFORM cron.unschedule('hubspot-bidirectional-sync');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore error if job doesn't exist
END $$;

-- Schedule outbound sync every 10 minutes
SELECT cron.schedule(
  'hubspot-bidirectional-sync',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://itolyllbvbdorqapuhyj.supabase.co/functions/v1/hubspot-sync-bidirectional?direction=outbound',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2x5bGxidmJkb3JxYXB1aHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNzE1NTQsImV4cCI6MjA1Njc0NzU1NH0.aVPGQ53o0YoSEKuGRk0_Lz_hIJhyvmJgD0WtGlsQYD8"}'::jsonb,
    body := '{"direction": "outbound"}'::jsonb
  ) AS request_id;
  $$
);
