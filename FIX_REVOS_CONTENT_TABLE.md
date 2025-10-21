# Fix revos_content Table - Missing 'client' Column

## Problem
The `revos_content` table is missing the `client` column, causing content creation to fail with error:
```
Could not find the 'client' column of 'revos_content' in the schema cache
```

## Solution

Go to your Supabase SQL Editor and run this SQL:

**URL:** https://supabase.com/dashboard/project/itolyllbvbdorqapuhyj/sql/new

```sql
-- Add missing client column
ALTER TABLE revos_content
ADD COLUMN IF NOT EXISTS client TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'revos_content'
ORDER BY ordinal_position;
```

After running this SQL, content creation should work!

## Expected Columns in revos_content:
- id (TEXT, PRIMARY KEY)
- title (TEXT, NOT NULL)
- type (TEXT, NOT NULL)
- **client (TEXT)** ← This was missing!
- source_project_id (TEXT)
- draft (TEXT, NOT NULL)
- final_text (TEXT)
- status (TEXT, NOT NULL, DEFAULT 'Draft')
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
