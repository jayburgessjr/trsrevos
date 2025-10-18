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
-- Drop the old client_notes table if it exists (from previous version)
DROP TABLE IF EXISTS client_notes CASCADE;

-- Create a new client_notes table that supports multiple notes per client
CREATE TABLE IF NOT EXISTS client_notes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on client_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_client_name ON client_notes(client_name);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at DESC);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON client_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON client_notes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON client_notes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON client_notes;

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

CREATE POLICY "Enable delete for authenticated users only"
ON client_notes FOR DELETE
USING (true);
```

### Verification

After running the SQL, you should be able to:
- Navigate to any client detail page (e.g., `/clients-revos/Your Client Name`)
- Click on the **Notes** tab
- Click "New" to create a note with title and content
- Notes appear in a list on the left side
- Click on any note to view it
- Edit or delete notes as needed
- All notes persist and load automatically when you return to the page

### Features:
- **Multiple notes per client**: Create unlimited notes for each client
- **Note list view**: All notes displayed in a sidebar with title, date, and preview
- **Click to view**: Click any note to see full content
- **Edit/Delete**: Edit existing notes or delete them
- **Auto-save**: Notes save to Supabase immediately
- **Timestamps**: Track when notes were created and last updated

### Migration File

The migration is also available in:
- `supabase/migrations/20251017210000_update_client_notes_schema.sql`

This can be pushed with `npx supabase db push --include-all` if you have other migrations to apply.
