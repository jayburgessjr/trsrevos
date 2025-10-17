-- Run this in Supabase SQL Editor to create the revos_projects table
-- This allows projects to sync across all your devices

-- Create revos_projects table
CREATE TABLE IF NOT EXISTS revos_projects (
  id TEXT PRIMARY KEY,
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
CREATE INDEX IF NOT EXISTS idx_revos_projects_status ON revos_projects(status);
CREATE INDEX IF NOT EXISTS idx_revos_projects_type ON revos_projects(type);
CREATE INDEX IF NOT EXISTS idx_revos_projects_client ON revos_projects(client);

-- Enable RLS
ALTER TABLE revos_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view revos projects" ON revos_projects;
DROP POLICY IF EXISTS "Users can create revos projects" ON revos_projects;
DROP POLICY IF EXISTS "Users can update revos projects" ON revos_projects;
DROP POLICY IF EXISTS "Users can delete revos projects" ON revos_projects;

-- Create RLS policies
CREATE POLICY "Users can view revos projects"
  ON revos_projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create revos projects"
  ON revos_projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update revos projects"
  ON revos_projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete revos projects"
  ON revos_projects FOR DELETE
  TO authenticated
  USING (true);

-- Create documents table
CREATE TABLE IF NOT EXISTS revos_documents (
  id TEXT PRIMARY KEY,
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

CREATE INDEX IF NOT EXISTS idx_revos_documents_project_id ON revos_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_revos_documents_status ON revos_documents(status);

ALTER TABLE revos_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view revos documents" ON revos_documents;
DROP POLICY IF EXISTS "Users can create revos documents" ON revos_documents;
DROP POLICY IF EXISTS "Users can update revos documents" ON revos_documents;
DROP POLICY IF EXISTS "Users can delete revos documents" ON revos_documents;

CREATE POLICY "Users can view revos documents"
  ON revos_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create revos documents"
  ON revos_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update revos documents"
  ON revos_documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete revos documents"
  ON revos_documents FOR DELETE TO authenticated USING (true);

-- Create resources table
CREATE TABLE IF NOT EXISTS revos_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_project_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revos_resources_type ON revos_resources(type);

ALTER TABLE revos_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view revos resources" ON revos_resources;
DROP POLICY IF EXISTS "Users can create revos resources" ON revos_resources;
DROP POLICY IF EXISTS "Users can update revos resources" ON revos_resources;
DROP POLICY IF EXISTS "Users can delete revos resources" ON revos_resources;

CREATE POLICY "Users can view revos resources"
  ON revos_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create revos resources"
  ON revos_resources FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update revos resources"
  ON revos_resources FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete revos resources"
  ON revos_resources FOR DELETE TO authenticated USING (true);

-- Create content table
CREATE TABLE IF NOT EXISTS revos_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  source_project_id TEXT,
  draft TEXT,
  final_text TEXT,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Review', 'Published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revos_content_source_project_id ON revos_content(source_project_id);
CREATE INDEX IF NOT EXISTS idx_revos_content_status ON revos_content(status);

ALTER TABLE revos_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view revos content" ON revos_content;
DROP POLICY IF EXISTS "Users can create revos content" ON revos_content;
DROP POLICY IF EXISTS "Users can update revos content" ON revos_content;
DROP POLICY IF EXISTS "Users can delete revos content" ON revos_content;

CREATE POLICY "Users can view revos content"
  ON revos_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create revos content"
  ON revos_content FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update revos content"
  ON revos_content FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete revos content"
  ON revos_content FOR DELETE TO authenticated USING (true);
