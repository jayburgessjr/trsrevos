-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on client_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_client_name ON client_notes(client_name);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Enable read access for all users" ON client_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON client_notes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON client_notes;

CREATE POLICY "Enable read access for all users"
ON client_notes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON client_notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON client_notes FOR UPDATE
USING (true);
