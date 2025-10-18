-- Enable RLS on revos_documents table
ALTER TABLE revos_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON revos_documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON revos_documents;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON revos_documents;

-- Create policy to allow all users to read documents
CREATE POLICY "Enable read access for all users"
ON revos_documents FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert documents
CREATE POLICY "Enable insert for authenticated users only"
ON revos_documents FOR INSERT
WITH CHECK (true);

-- Create policy to allow authenticated users to update documents
CREATE POLICY "Enable update for authenticated users only"
ON revos_documents FOR UPDATE
USING (true);
