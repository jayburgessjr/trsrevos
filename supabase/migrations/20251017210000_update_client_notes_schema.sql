-- Drop the old client_notes table if it exists
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
