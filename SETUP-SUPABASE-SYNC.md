# Setup Supabase Data Sync

## Problem

Your project data (created on computer) was only saved to localStorage in your browser, so it wasn't visible on your iPad or other devices.

## Solution

Migrate from localStorage to Supabase database for cross-device sync.

## Step 1: Create the Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/itolyllbvbdorqapuhyj
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `scripts/setup-revos-projects-table.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

This will create four tables:
- `revos_projects` - Your projects data
- `revos_documents` - Documents linked to projects
- `revos_resources` - Resources and frameworks
- `revos_content` - Content items

All tables have Row Level Security (RLS) enabled so only authenticated users can access them.

## Step 2: Update the RevosDataProvider

The next step is to update `app/providers/RevosDataProvider.tsx` to use Supabase instead of localStorage.

I'll create this in the next step, but here's what it needs to do:

### Features:
- **Load data from Supabase on mount** (instead of localStorage)
- **Save new projects to Supabase immediately** when created
- **Real-time sync** across devices using Supabase subscriptions
- **Optimistic updates** for fast UI
- **Keep localStorage as backup** for offline support

### Migration Strategy:
1. On first load, check if there's data in localStorage
2. If yes, migrate it to Supabase
3. Clear localStorage after successful migration
4. From then on, always use Supabase as source of truth

##Step 3: Test the Migration

1. Create a test project on your computer
2. Verify it appears in Supabase (SQL Editor → Table Editor → `revos_projects`)
3. Open the app on your iPad
4. The project should appear there too!

## Benefits

✅ **Cross-device sync** - See your data on computer, iPad, phone
✅ **Real-time updates** - Changes appear instantly on all devices
✅ **Backup & recovery** - Data stored safely in the cloud
✅ **Collaboration ready** - Multiple team members can work together
✅ **Offline support** - localStorage backup when offline

## Troubleshooting

### "Data not syncing"
- Check your internet connection
- Verify you're logged in to the same Supabase account on all devices
- Check browser console for errors

### "Permission denied" errors
- Make sure you're authenticated (check for auth token)
- Verify RLS policies are correctly set up in Supabase

### "Tables don't exist"
- Run the SQL script in Step 1 again
- Check for any SQL errors in the Supabase dashboard

## Next Steps

Once the tables are created, I'll update the RevosDataProvider to use Supabase instead of localStorage, with automatic migration of your existing data.
