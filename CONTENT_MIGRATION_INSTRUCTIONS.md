# Content Database Migration Instructions

## Database Setup Required

The content generation feature now requires a `revos_content` table in Supabase to properly store and track generated content.

### Steps:
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **SQL Editor** → **New query**
4. Copy and paste the SQL below
5. Click **Run** to execute

### SQL to Execute:

```sql
-- Create revos_content table for AI-generated content
CREATE TABLE IF NOT EXISTS revos_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  client TEXT,
  source_project_id TEXT,
  draft TEXT NOT NULL,
  final_text TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_revos_content_client ON revos_content(client);
CREATE INDEX IF NOT EXISTS idx_revos_content_project ON revos_content(source_project_id);
CREATE INDEX IF NOT EXISTS idx_revos_content_status ON revos_content(status);
CREATE INDEX IF NOT EXISTS idx_revos_content_created_at ON revos_content(created_at DESC);

-- Enable RLS
ALTER TABLE revos_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON revos_content;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON revos_content;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON revos_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON revos_content;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON revos_content FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON revos_content FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON revos_content FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for authenticated users only"
ON revos_content FOR DELETE
USING (true);
```

### What's New:

1. **Client Field**: Added to the content creation form so you can specify which client the content is for
2. **Auto-Population**: When you select a source project, the client field auto-populates with that project's client
3. **Database Storage**: Content is now saved to the `revos_content` table in Supabase
4. **Project Linking**: Content can be linked to specific projects and clients

### Features:
- Content is saved to Supabase immediately after generation
- Client and project associations are tracked
- All generated content persists across sessions
- Content can be viewed, copied, and downloaded from the library

### Migration File:

The migration is also available in:
- `supabase/migrations/20251018000000_create_revos_content_table.sql`
