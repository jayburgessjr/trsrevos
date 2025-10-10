# Database Seeding Instructions

## Quick Start

To seed your Supabase database with dummy data:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `seed-database.sql`
5. Click **Run** or press `Ctrl/Cmd + Enter`

The script will insert test data for:
- 1 Organization (TRS Internal)
- 3 Users (Admin, Sarah Chen, Mike Johnson)
- 5 Clients (various segments and phases)
- 5 Opportunities (different stages)
- 4 Opportunity Notes
- 5 Invoices (some paid, some pending)
- 5 Projects (various statuses)
- 10 Client Health History records

## Verification

After running the script, you should see a summary table showing the count of records in each table.

## Running Locally

If you have Supabase CLI installed:

```bash
supabase db push
supabase db seed
```

## Notes

- The script uses `ON CONFLICT DO NOTHING` so it's safe to run multiple times
- All IDs are deterministic (starting with 00000000, 10000000, etc.) for easy testing
- The data is designed to showcase the Pipeline and Dashboard features
- **Schema Alignment**: This script is aligned with migrations through `20251010061014_fix_dashboard_and_pipeline.sql`
  - Uses `invoices.paid_at` (TIMESTAMPTZ) instead of `paid_date`
  - Uses lowercase status values ('paid', 'sent', 'overdue') for invoices
  - Uses `projects.budget` and `projects.spent` fields

## Resetting Data

To reset and reseed:

1. Delete existing data:
```sql
DELETE FROM public.opportunity_notes;
DELETE FROM public.opportunities;
DELETE FROM public.client_health_history;
DELETE FROM public.projects;
DELETE FROM public.invoices;
DELETE FROM public.clients;
DELETE FROM public.users WHERE id LIKE '10000000%';
DELETE FROM public.organizations WHERE id = '00000000-0000-0000-0000-000000000001';
```

2. Run `seed-database.sql` again
