-- Fix Public Form Submissions
-- This migration allows public form submissions to create clients without requiring an owner_id
-- Critical fix for business-critical form intake flow

-- Make owner_id nullable in clients table to allow public form submissions
ALTER TABLE clients
  ALTER COLUMN owner_id DROP NOT NULL;

-- Add comment to document this change
COMMENT ON COLUMN clients.owner_id IS 'Owner user ID. Can be NULL for public form submissions that are not yet assigned to a user.';

-- Update RLS policy to handle NULL owner_id for public submissions
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

-- Recreate policies with NULL owner_id handling
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT
  USING (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow viewing unassigned clients (from public forms)
  );

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow creating clients without owner (public forms)
  );

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow updating unassigned clients
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR owner_id IS NULL
  );

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE
  USING (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow deleting unassigned clients
  );

-- Also make user_id nullable if it exists (some forms might have this field)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE clients ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;
