# HubSpot CRM Integration Guide

## Overview

This guide provides complete instructions for integrating HubSpot CRM with the TRS RevOS platform. After implementation, Pipeline, Clients, and Dashboard pages will be powered by real HubSpot data, synced hourly into Supabase.

---

## Architecture

```
HubSpot CRM (Source of Truth)
    ↓
Supabase Edge Function (hubspot-sync)
    ↓
Supabase Tables (clients, opportunities, contacts)
    ↓
Next.js UI (Pipeline, Clients, Dashboard)
```

**Key Components:**
- `lib/hubspot/client.ts` - HubSpot API client with typed methods
- `app/api/hubspot/*` - Next.js API routes for on-demand data fetching
- `supabase/functions/hubspot-sync` - Scheduled sync edge function
- `core/clients/actions.ts` - Supabase-backed server actions
- `components/hubspot/SyncButton.tsx` - Manual sync trigger UI

---

## Implementation Steps

### 1. Configure HubSpot API Key

#### A. Create a Private App in HubSpot

1. Go to **Settings** → **Integrations** → **Private Apps** in your HubSpot account
2. Click **Create a private app**
3. Name it "TRS RevOS Integration"
4. Under **Scopes**, grant the following permissions:
   - `crm.objects.deals.read`
   - `crm.objects.deals.write`
   - `crm.objects.companies.read`
   - `crm.objects.contacts.read`
   - `crm.objects.notes.read`
   - `crm.objects.notes.write`
5. Click **Create app** and copy the **Access Token**

#### B. Add Environment Variables

Add to `.env.local`:
```bash
HUBSPOT_API_KEY=your_hubspot_access_token_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Or your production URL
```

Add to Supabase Edge Function environment (via Supabase Dashboard → Edge Functions → Secrets):
```bash
HUBSPOT_API_KEY=your_hubspot_access_token_here
```

---

### 2. Deploy Supabase Edge Function

#### A. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
supabase login
```

#### B. Link to your Supabase project
```bash
supabase link --project-ref your-project-ref
```

#### C. Deploy the hubspot-sync function
```bash
supabase functions deploy hubspot-sync
```

#### D. Set the HUBSPOT_API_KEY secret
```bash
supabase secrets set HUBSPOT_API_KEY=your_hubspot_access_token_here
```

#### E. Schedule the function to run hourly

Go to **Supabase Dashboard** → **Database** → **Cron Jobs** and create a new job:

```sql
SELECT cron.schedule(
  'hubspot-sync-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/hubspot-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-anon-key"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

### 3. Update Client Data Flow

#### A. Migrate Clients Page from Store to Supabase

The `core/clients/actions.ts` file has been updated to query Supabase instead of the in-memory store.

**Update `/app/clients/page.tsx`:**

Change line 15 from:
```typescript
import { getClients, getClientStats } from "@/core/clients/store"
```

To:
```typescript
import { actionListClients, getClientStats } from "@/core/clients/actions"
```

Change line 35 from:
```typescript
const clients = useMemo(() => getClients(), [])
```

To:
```typescript
const clients = await actionListClients()
```

And convert the component to async server component:
```typescript
export default async function ClientsPage() {
  const clients = await actionListClients()
  const stats = await getClientStats()
  // ... rest of component
}
```

#### B. Add Sync Button to Clients Header

In `/app/clients/page.tsx`, import and add the sync button:

```typescript
import { SyncButton } from "@/components/hubspot/SyncButton"

// Inside the component JSX, add to the header:
<div className="flex items-center justify-between">
  <PageTitle>Clients</PageTitle>
  <SyncButton />
</div>
```

---

### 4. Verify Database Schema

Ensure all required tables exist in Supabase. Run the seed script if needed:

```bash
# Via Supabase SQL Editor, run:
# scripts/seed-database.sql
```

**Required Tables:**
- `clients` - Company records
- `opportunities` - Deals/pipeline
- `contacts` - Contact persons
- `opportunity_notes` - Deal collaboration notes
- `analytics_events` - Sync logs
- `discovery_questions`, `data_sources`, `kanban_items` - Client details

---

### 5. Test the Integration

#### A. Manual Sync Test

1. Start the dev server: `pnpm run dev`
2. Navigate to `/clients`
3. Click **Sync HubSpot** button
4. Check console for sync logs
5. Verify clients appear from HubSpot

#### B. API Route Test

```bash
# Test deals endpoint
curl http://localhost:3000/api/hubspot/deals

# Test companies endpoint
curl http://localhost:3000/api/hubspot/companies

# Test contacts endpoint
curl http://localhost:3000/api/hubspot/contacts

# Trigger sync
curl -X POST http://localhost:3000/api/hubspot/sync

# Check sync status
curl http://localhost:3000/api/hubspot/sync
```

#### C. Edge Function Test

```bash
# Invoke the function locally
supabase functions serve hubspot-sync

# In another terminal:
curl -X POST http://localhost:54321/functions/v1/hubspot-sync \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

### 6. Production Deployment

#### A. Environment Variables

Add to your production environment (Netlify/Vercel):
```bash
HUBSPOT_API_KEY=your_production_hubspot_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### B. Deploy Application

```bash
git add .
git commit -m "Add HubSpot CRM integration"
git push origin main
```

#### C. Verify Sync is Running

1. Check **Supabase Dashboard** → **Edge Functions** → **hubspot-sync** → **Logs**
2. Query `analytics_events` table for `event_type = 'hubspot_sync'`
3. Verify client count in `clients` table matches HubSpot

---

## Data Mapping

### HubSpot → Supabase Mappings

#### Companies → Clients
```javascript
{
  id: `hs_company_${hubspot_id}`,
  name: company.properties.name,
  segment: arr > 500k ? "Enterprise" : arr > 100k ? "Mid" : "SMB",
  arr: company.properties.annualrevenue,
  industry: company.properties.industry,
  region: company.properties.country,
  phase: lifecyclestage_mapped_to_revos_phase,
  owner_id: `hs_owner_${company.properties.hubspot_owner_id}`,
  health: 75 (default),
  churn_risk: 10 (default),
  status: lifecyclestage === "customer" ? "active" : "churned"
}
```

#### Deals → Opportunities
```javascript
{
  id: `hs_${deal_id}`,
  client_id: `hs_company_${company_id}`,
  name: deal.properties.dealname,
  amount: deal.properties.amount,
  stage: dealstage_mapped_to_trs_stage,
  probability: deal.properties.hs_deal_stage_probability,
  close_date: deal.properties.closedate,
  owner_id: `hs_owner_${deal.properties.hubspot_owner_id}`
}
```

#### Contacts → Contacts
```javascript
{
  id: `hs_contact_${contact_id}`,
  client_id: null (updated via associations),
  name: `${firstname} ${lastname}`,
  role: contact.properties.jobtitle,
  email: contact.properties.email,
  phone: contact.properties.phone,
  power: inferred_from_job_title // "Economic", "Decision", "Influencer", "User"
}
```

#### Stage Mappings

**HubSpot Deal Stages → TRS Stages:**
```javascript
{
  "appointmentscheduled": "Qualify",
  "qualifiedtobuy": "Qualify",
  "presentationscheduled": "Proposal",
  "decisionmakerboughtin": "Proposal",
  "contractsent": "Negotiation",
  "closedwon": "ClosedWon",
  "closedlost": "ClosedLost"
}
```

**HubSpot Lifecycle Stages → RevOS Phases:**
```javascript
{
  "lead": "Discovery",
  "marketingqualifiedlead": "Discovery",
  "salesqualifiedlead": "Data",
  "opportunity": "Algorithm",
  "customer": "Architecture",
  "evangelist": "Compounding"
}
```

---

## Troubleshooting

### Issue: "HubSpot API key not configured"

**Solution:** Ensure `HUBSPOT_API_KEY` is set in both:
1. `.env.local` for API routes
2. Supabase Edge Function secrets for sync function

### Issue: Edge function fails with "ECONNREFUSED"

**Solution:** Check that:
1. HUBSPOT_API_KEY is valid and has correct scopes
2. HubSpot API rate limits haven't been exceeded (10 requests/second for private apps)

### Issue: Clients not appearing after sync

**Solution:**
1. Check edge function logs: `supabase functions logs hubspot-sync`
2. Verify RLS policies allow reading from `clients` table
3. Check that `analytics_events` has a `hubspot_sync` entry with `status: "success"`

### Issue: Foreign key constraint violations

**Solution:** The sync creates placeholder owner IDs. Ensure your `users` table has entries for:
```sql
INSERT INTO public.users (id, email, name, role, organization_id) VALUES
('hs_owner_system', 'system@hubspot.com', 'HubSpot System', 'Member', 'org_id');
```

---

## Monitoring & Maintenance

### Check Sync Health

```sql
-- View recent syncs
SELECT
  created_at,
  metadata->>'status' as status,
  metadata->>'deals_synced' as deals,
  metadata->>'companies_synced' as companies,
  metadata->>'contacts_synced' as contacts,
  metadata->>'duration_ms' as duration_ms
FROM analytics_events
WHERE event_type = 'hubspot_sync'
ORDER BY created_at DESC
LIMIT 10;
```

### Monitor API Usage

HubSpot Private Apps have rate limits:
- **10 requests/second**
- **100,000 requests/day**

The sync function fetches 100 records per entity type (deals, companies, contacts), so each sync = ~3 API calls.

### Disable Sync Temporarily

```sql
-- Remove cron job
SELECT cron.unschedule('hubspot-sync-hourly');
```

---

## Next Steps

1. **Add Bi-Directional Sync**: Update HubSpot when changes are made in TRS
2. **Fetch Associations**: Link contacts to companies using HubSpot associations API
3. **Sync Notes**: Pull deal notes into `opportunity_notes` table
4. **Custom Properties**: Map custom HubSpot properties to TRS fields
5. **Webhooks**: Use HubSpot webhooks for real-time sync instead of hourly cron

---

## Support

For issues or questions:
- Check logs: `supabase functions logs hubspot-sync`
- Review HubSpot API docs: https://developers.hubspot.com/docs/api/overview
- Check TRS implementation in `lib/hubspot/client.ts`

**Test Credentials:**
- Password: `password123`
- Emails: `admin@trs.com`, `sarah.chen@trs.com`, `mike.johnson@trs.com`

---

**Last Updated:** 2025-10-10
**Version:** 1.0
**Author:** Claude Code + TRS Engineering
