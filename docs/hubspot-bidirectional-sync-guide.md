# HubSpot Bi-Directional Sync - Deployment Guide

## Overview

Complete bi-directional synchronization between HubSpot CRM and TRS Platform:

**Inbound (HubSpot → TRS):**
- Real-time webhook notifications for property changes
- Hourly full sync for drift correction

**Outbound (TRS → HubSpot):**
- Automatic change detection via database triggers
- Batched updates every 10 minutes
- Retry logic with error tracking

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         HubSpot CRM                             │
│                    (Source of Truth)                            │
└──────────┬────────────────────────────────┬─────────────────────┘
           │ Webhooks (real-time)           │ REST API (batch)
           ↓                                ↑
┌──────────────────────────────────────────────────────────────────┐
│                    Supabase Edge Functions                       │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │ hubspot-webhook     │    │ hubspot-sync-bidirectional   │    │
│  │ (inbound)           │    │ (outbound + inbound)         │    │
│  │ Triggers: instant   │    │ Triggers: every 10 min       │    │
│  └─────────────────────┘    └──────────────────────────────┘    │
└──────────┬─────────────────────────────────┬────────────────────┘
           │                                 │
           ↓                                 ↓
┌──────────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL                           │
│  ┌─────────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │ opportunities       │  │ clients        │  │ contacts     │  │
│  │ + needs_sync column │  │ + needs_sync   │  │ + needs_sync │  │
│  └─────────────────────┘  └────────────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ sync_log (monitoring)                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Triggers: on UPDATE → mark needs_sync = true                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────┬──────────────────────────────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────────────┐
│                      Next.js TRS UI                              │
│  /pipeline, /clients, /dashboard (server components)            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Run Database Migration

Apply the bi-directional sync schema:

```bash
# Push migration to Supabase
supabase db push
```

Or via Supabase Dashboard → SQL Editor:

```sql
-- Run the contents of:
-- supabase/migrations/20251010150000_bidirectional_sync.sql
```

This adds:
- `needs_sync`, `hubspot_synced`, `last_synced_at`, `sync_error` columns to opportunities, clients, contacts
- `sync_log` table for monitoring
- Database triggers to automatically mark records for sync
- `get_sync_stats()` function for monitoring

---

## Step 2: Deploy Edge Functions

### A. Deploy Bi-Directional Sync Function

```bash
supabase functions deploy hubspot-sync-bidirectional
```

### B. Deploy Webhook Handler

```bash
supabase functions deploy hubspot-webhook
```

### C. Configure Environment Secrets

```bash
# Set HubSpot API key (if not already set)
supabase secrets set HUBSPOT_API_KEY=your_hubspot_private_app_token
```

---

## Step 3: Configure HubSpot Webhooks

### Create Webhook Subscriptions

1. Go to **HubSpot** → **Settings** → **Integrations** → **Private Apps** → Your App → **Webhooks**

2. Create webhook for **Deals**:
   - URL: `https://your-project-ref.supabase.co/functions/v1/hubspot-webhook`
   - Events: Select "Property Change"
   - Properties: `dealname`, `amount`, `dealstage`, `closedate`, `hs_deal_stage_probability`, `hubspot_owner_id`

3. Create webhook for **Companies**:
   - URL: Same as above
   - Events: Select "Property Change"
   - Properties: `name`, `annualrevenue`, `lifecyclestage`, `industry`, `country`, `hubspot_owner_id`

4. Create webhook for **Contacts**:
   - URL: Same as above
   - Events: Select "Property Change"
   - Properties: `firstname`, `lastname`, `email`, `jobtitle`, `phone`

5. **Test each webhook** using HubSpot's "Send test event" button

---

## Step 4: Schedule Periodic Sync

Configure cron job for outbound sync (TRS → HubSpot):

```sql
-- Run in Supabase SQL Editor
SELECT cron.schedule(
  'hubspot-bidirectional-sync',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/hubspot-sync-bidirectional',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key"}'::jsonb,
    body := '{"direction": "outbound"}'::jsonb
  );
  $$
);
```

**Parameters:**
- `direction=outbound` - Only push TRS changes → HubSpot (recommended for 10-min schedule)
- `direction=inbound` - Only pull HubSpot → TRS (use for hourly full sync)
- `direction=both` - Full bi-directional sync (use sparingly, once daily)

**Recommended Schedule:**
- **Outbound sync**: Every 10 minutes (pushes user changes to HubSpot quickly)
- **Inbound full sync**: Once hourly (drift correction, use existing hubspot-sync function)

---

## Step 5: Monitor Sync Health

### A. Via Sync Status API

```bash
curl http://localhost:3000/api/hubspot/sync-status
```

Returns:
```json
{
  "success": true,
  "stats": {
    "opportunities_pending": 3,
    "clients_pending": 1,
    "contacts_pending": 0,
    "sync_errors_24h": 0,
    "last_successful_sync": "2025-10-10T15:30:00Z"
  },
  "recentLogs": [...]
}
```

### B. Via Supabase Dashboard

Query sync logs:

```sql
-- View recent sync activity
SELECT
  object_type,
  direction,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_activity
FROM sync_log
WHERE created_at > now() - interval '24 hours'
GROUP BY object_type, direction, status
ORDER BY last_activity DESC;

-- View sync errors
SELECT
  object_type,
  object_id,
  direction,
  message,
  error_details,
  created_at
FROM sync_log
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 20;

-- View pending syncs
SELECT COUNT(*) as opportunities_pending
FROM opportunities
WHERE needs_sync = true;

SELECT COUNT(*) as clients_pending
FROM clients
WHERE needs_sync = true;
```

### C. Via SyncStatus UI Component

Add to admin dashboard or settings page:

```typescript
import { SyncStatus } from "@/components/hubspot/SyncStatus";

export default function AdminPage() {
  return (
    <div>
      <h1>HubSpot Sync Status</h1>
      <SyncStatus />
    </div>
  );
}
```

---

## Data Flow Examples

### Example 1: User Updates Deal in TRS

```
1. User edits opportunity stage in /pipeline
   ↓
2. Server action calls: supabase.from("opportunities").update({ stage: "Negotiation" })
   ↓
3. Database trigger fires: trigger_opportunity_sync()
   ↓
4. Trigger sets: needs_sync = true, hubspot_synced = false
   ↓
5. Trigger logs: INSERT INTO sync_log(direction='outbound', status='queued')
   ↓
6. Cron job runs hubspot-sync-bidirectional (every 10 min)
   ↓
7. Edge function queries: SELECT * FROM opportunities WHERE needs_sync = true
   ↓
8. Edge function calls HubSpot API: PATCH /crm/v3/objects/deals/{id}
   ↓
9. On success: UPDATE opportunities SET needs_sync = false, hubspot_synced = true
   ↓
10. Log: INSERT INTO sync_log(direction='outbound', status='success')
```

### Example 2: Deal Updated in HubSpot

```
1. User changes deal amount in HubSpot CRM
   ↓
2. HubSpot webhook fires → hubspot-webhook edge function
   ↓
3. Webhook handler receives: { objectId: 12345, propertyName: "amount", propertyValue: "50000" }
   ↓
4. Handler calls: supabase.from("opportunities").update({ amount: 50000, needs_sync: false })
   ↓
5. Update bypasses trigger (needs_sync already false)
   ↓
6. Log: INSERT INTO sync_log(direction='inbound', status='success')
   ↓
7. TRS UI shows updated amount instantly (via revalidation)
```

---

## Conflict Resolution

**Priority:** HubSpot is the source of truth for conflicts

**Strategies:**

1. **Timestamp-based**: Webhook updates set `last_synced_at`, outbound sync skips recently synced records
2. **needs_sync flag**: Webhook sets `needs_sync = false` to prevent ping-pong
3. **Error handling**: Failed outbound syncs remain queued, retried on next cycle

**Handling Simultaneous Updates:**
- If HubSpot webhook arrives while record has `needs_sync = true`:
  - Webhook wins (sets data + needs_sync = false)
  - TRS change is overwritten
  - User sees HubSpot version (correct behavior)

---

## Testing

### Test Outbound Sync (TRS → HubSpot)

```bash
# 1. Update an opportunity in TRS
psql -h your-db-host -c "
UPDATE opportunities
SET stage = 'Negotiation', needs_sync = true
WHERE id = 'hs_12345';
"

# 2. Manually trigger sync
curl -X POST https://your-project-ref.supabase.co/functions/v1/hubspot-sync-bidirectional?direction=outbound \
  -H "Authorization: Bearer your-anon-key"

# 3. Check HubSpot CRM - deal should show stage update

# 4. Check sync log
psql -h your-db-host -c "
SELECT * FROM sync_log
WHERE object_id = 'hs_12345'
ORDER BY created_at DESC
LIMIT 5;
"
```

### Test Inbound Sync (HubSpot → TRS)

```bash
# 1. Update a deal in HubSpot CRM UI
#    Change: Deal Name, Amount, or Stage

# 2. Check TRS database (should update within seconds)
psql -h your-db-host -c "
SELECT id, name, amount, stage, last_synced_at
FROM opportunities
WHERE id = 'hs_12345';
"

# 3. Check webhook logs
supabase functions logs hubspot-webhook --tail

# 4. Check sync log
psql -h your-db-host -c "
SELECT * FROM sync_log
WHERE object_id = 'hs_12345' AND direction = 'inbound'
ORDER BY created_at DESC;
"
```

---

## Troubleshooting

### Issue: Outbound sync not working

**Symptoms:** TRS changes don't appear in HubSpot

**Debug Steps:**
```sql
-- Check if records are marked for sync
SELECT id, name, needs_sync, last_synced_at, sync_error
FROM opportunities
WHERE needs_sync = true;

-- Check cron job status
SELECT * FROM cron.job WHERE jobname = 'hubspot-bidirectional-sync';

-- Check edge function logs
```

```bash
supabase functions logs hubspot-sync-bidirectional --tail
```

**Common Fixes:**
1. Verify HUBSPOT_API_KEY secret is set
2. Check HubSpot API rate limits (10 req/sec for private apps)
3. Verify cron job is enabled and running
4. Check `sync_error` column for specific error messages

### Issue: Webhook not receiving events

**Symptoms:** HubSpot changes don't appear in TRS

**Debug Steps:**
1. Go to HubSpot → Settings → Webhooks → View Activity Log
2. Check for failed deliveries or errors
3. Test webhook manually: "Send test event"
4. Check edge function logs:

```bash
supabase functions logs hubspot-webhook --tail
```

**Common Fixes:**
1. Verify webhook URL is correct (use full function URL)
2. Check webhook is subscribed to correct events
3. Verify edge function is deployed: `supabase functions list`
4. Check for CORS issues (edge functions should handle)

### Issue: Sync loop (ping-pong)

**Symptoms:** Same record syncs repeatedly, incrementing sync count

**Debug:**
```sql
SELECT id, name, needs_sync, hubspot_synced, last_synced_at, updated_at
FROM opportunities
WHERE id = 'hs_12345';

SELECT * FROM sync_log
WHERE object_id = 'hs_12345'
ORDER BY created_at DESC
LIMIT 20;
```

**Fix:** Ensure webhook sets `needs_sync = false` when updating from HubSpot

---

## Performance & Rate Limits

**HubSpot API Limits (Private Apps):**
- 10 requests/second
- 100,000 requests/day

**Sync Strategy:**
- Outbound: 50 records/batch, every 10 min = 7,200 updates/day (well within limits)
- Inbound: Webhook-based (no polling needed)
- Full refresh: Once hourly for drift correction

**Optimization:**
- Use `needs_sync` flag to avoid unnecessary API calls
- Batch updates in edge function (50 at a time)
- Skip unchanged records

---

## Security

**API Key Storage:**
- Stored in Supabase secrets (encrypted)
- Never exposed to client
- Accessed only by edge functions with service role

**RLS Policies:**
- `sync_log` table: Admin/service role only
- Webhook endpoint: Public (validates HubSpot signature if needed)
- Edge functions: Run with service role, bypass RLS

**Webhook Validation:**
- Optional: Verify HubSpot signature header
- Rate limit webhook endpoint if needed

---

## Monitoring Queries

```sql
-- Daily sync summary
SELECT
  DATE(created_at) as date,
  direction,
  status,
  COUNT(*) as operations
FROM sync_log
WHERE created_at > now() - interval '7 days'
GROUP BY DATE(created_at), direction, status
ORDER BY date DESC, direction, status;

-- Error rate by object type
SELECT
  object_type,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'error') / COUNT(*), 2) as error_rate_pct
FROM sync_log
WHERE created_at > now() - interval '24 hours'
GROUP BY object_type;

-- Average sync latency
SELECT
  direction,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_seconds
FROM sync_log
WHERE completed_at IS NOT NULL
  AND created_at > now() - interval '24 hours'
GROUP BY direction;
```

---

## Rollback / Disable Sync

To temporarily disable bi-directional sync:

```sql
-- Disable cron job
SELECT cron.unschedule('hubspot-bidirectional-sync');

-- Disable webhooks in HubSpot UI
-- (Settings → Integrations → Private Apps → Your App → Webhooks → Toggle Off)

-- Clear pending sync queue (optional)
UPDATE opportunities SET needs_sync = false WHERE needs_sync = true;
UPDATE clients SET needs_sync = false WHERE needs_sync = true;
UPDATE contacts SET needs_sync = false WHERE needs_sync = true;
```

To re-enable:

```sql
-- Re-create cron job (see Step 4)
-- Re-enable webhooks in HubSpot UI
```

---

## Summary

✅ **Inbound Sync (HubSpot → TRS):** Real-time via webhooks
✅ **Outbound Sync (TRS → HubSpot):** Automatic via triggers + cron (10 min)
✅ **Monitoring:** sync_log table + UI component
✅ **Conflict Resolution:** HubSpot wins
✅ **Error Handling:** Retries + error logging

**Next Steps:**
1. Run migration: `supabase db push`
2. Deploy functions: `supabase functions deploy hubspot-sync-bidirectional`
3. Configure HubSpot webhooks
4. Schedule cron job
5. Monitor via `/api/hubspot/sync-status`

---

**Last Updated:** 2025-10-10
**Version:** 2.0 (Bi-Directional)
**Author:** Claude Code + TRS Engineering
