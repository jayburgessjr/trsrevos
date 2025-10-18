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
