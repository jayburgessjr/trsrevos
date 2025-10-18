# Migration Instructions for Client Notes

## Database Setup Required

The client notes feature requires a new `client_notes` table in Supabase. Please run the following SQL in your Supabase Dashboard:

### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor** → **New query**
4. Copy and paste the SQL below
5. Click **Run** to execute

### SQL to Execute:

```sql
-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on client_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_client_name ON client_notes(client_name);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON client_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON client_notes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON client_notes;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON client_notes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON client_notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON client_notes FOR UPDATE
USING (true);
```

### Verification

After running the SQL, you should be able to:
- Navigate to any client detail page (e.g., `/clients-revos/Your Client Name`)
- Click on the **Notes** tab
- Add notes and click **Save Notes**
- Notes will persist and load automatically when you return to the page

### Migration File

The migration is also available in:
- `supabase/migrations/20251017200000_create_client_notes.sql`

This can be pushed with `npx supabase db push --include-all` if you have other migrations to apply.
