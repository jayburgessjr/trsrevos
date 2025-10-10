SELECT cron.schedule(
  'hubspot-sync',
  '0 */2 * * *', -- every 2 hours
  $$
  SELECT net.http_post(
    url:='https://itolyllbvbdorqapuhyj.supabase.co/functions/v1/hubspot-sync',
    headers:='{
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2x5bGxidmJkb3JxYXB1aHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzOTE5MSwiZXhwIjoyMDc1NjE1MTkxfQ.TIKxeof9WBk1NfONxYb0_4FGGSKqcHytRKvJKjWXuSU"
    }'::jsonb,
    body:='{"name":"HubSpot Sync"}'::jsonb
  );
  $$
);
