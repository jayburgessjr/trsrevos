-- Create revos_projects table for the Projects page
-- This is separate from the main "projects" table which is tied to clients
-- This table stores project data for the TRS RevOS Projects module

CREATE TABLE IF NOT EXISTS revos_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Audit', 'Blueprint', 'Advisory', 'Internal')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Delivered', 'Closed')),
  team TEXT[] DEFAULT ARRAY[]::TEXT[],
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  quickbooks_invoice_url TEXT,
  revenue_target NUMERIC(12,2) DEFAULT 0,
  documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  resources TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_revos_projects_status ON revos_projects(status);
CREATE INDEX idx_revos_projects_type ON revos_projects(type);
CREATE INDEX idx_revos_projects_client ON revos_projects(client);

-- Add RLS policies
ALTER TABLE revos_projects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all projects
CREATE POLICY "Users can view revos projects"
  ON revos_projects FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create projects
CREATE POLICY "Users can create revos projects"
  ON revos_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update projects
CREATE POLICY "Users can update revos projects"
  ON revos_projects FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete projects
CREATE POLICY "Users can delete revos projects"
  ON revos_projects FOR DELETE
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_revos_projects_updated_at
  BEFORE UPDATE ON revos_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create revos_documents table
CREATE TABLE IF NOT EXISTS revos_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  file_url TEXT,
  version INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Review', 'Approved')),
  summary TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revos_documents_project_id ON revos_documents(project_id);
CREATE INDEX idx_revos_documents_status ON revos_documents(status);

ALTER TABLE revos_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revos documents"
  ON revos_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create revos documents"
  ON revos_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update revos documents"
  ON revos_documents FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete revos documents"
  ON revos_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create revos_resources table
CREATE TABLE IF NOT EXISTS revos_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_project_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revos_resources_type ON revos_resources(type);

ALTER TABLE revos_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revos resources"
  ON revos_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create revos resources"
  ON revos_resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update revos resources"
  ON revos_resources FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete revos resources"
  ON revos_resources FOR DELETE
  TO authenticated
  USING (true);

-- Create revos_content table
CREATE TABLE IF NOT EXISTS revos_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  source_project_id TEXT,
  draft TEXT,
  final_text TEXT,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Review', 'Published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revos_content_source_project_id ON revos_content(source_project_id);
CREATE INDEX idx_revos_content_status ON revos_content(status);

ALTER TABLE revos_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revos content"
  ON revos_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create revos content"
  ON revos_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update revos content"
  ON revos_content FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete revos content"
  ON revos_content FOR DELETE
  TO authenticated
  USING (true);
