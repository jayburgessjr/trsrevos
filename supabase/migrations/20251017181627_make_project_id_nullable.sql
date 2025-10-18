-- Make project_id nullable in revos_documents table
-- This allows form submissions to be created without being assigned to a project initially

ALTER TABLE revos_documents 
ALTER COLUMN project_id DROP NOT NULL;
