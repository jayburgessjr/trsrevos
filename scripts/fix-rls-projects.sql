-- Enable RLS on revos_projects table
ALTER TABLE revos_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON revos_projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON revos_projects;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON revos_projects;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON revos_projects;

-- Create policy to allow all users to read projects
CREATE POLICY "Enable read access for all users"
ON revos_projects FOR SELECT
USING (true);

-- Create policy to allow authenticated users to insert projects
CREATE POLICY "Enable insert for authenticated users only"
ON revos_projects FOR INSERT
WITH CHECK (true);

-- Create policy to allow authenticated users to update projects
CREATE POLICY "Enable update for authenticated users only"
ON revos_projects FOR UPDATE
USING (true);

-- Create policy to allow authenticated users to delete projects
CREATE POLICY "Enable delete for authenticated users only"
ON revos_projects FOR DELETE
USING (true);
