SELECT cron.schedule(
  'calendar-sync',
  '0 6 * * *', -- every day at 6am
  $$
  SELECT net.http_post(
    url:='https://itolyllbvbdorqapuhyj.supabase.co/functions/v1/calendar-sync',
    headers:='{
      "Content-Type": "application/json",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2x5bGxidmJkb3JxYXB1aHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzOTE5MSwiZXhwIjoyMDc1NjE1MTkxfQ.TIKxeof9WBk1NfONxYb0_4FGGSKqcHytRKvJKjWXuSU"
    }'::jsonb,
    body:='{"name":"Calendar Sync"}'::jsonb
  );
  $$
);
