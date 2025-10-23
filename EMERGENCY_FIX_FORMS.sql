-- ============================================================================
-- EMERGENCY FIX FOR FORM SUBMISSIONS
-- ============================================================================
-- This SQL script fixes the critical issue preventing public form submissions
-- from creating clients due to NOT NULL constraint on owner_id column.
--
-- ISSUE: Public form submissions fail with error:
-- "Could not find the 'monthly_recurring_revenue' column of 'clients'"
--
-- ROOT CAUSES:
-- 1. Form API tries to insert 'monthly_recurring_revenue' but schema uses 'arr'
-- 2. owner_id column is NOT NULL but public forms have no authenticated user
--
-- FIXES APPLIED:
-- 1. Code fix: Changed 'monthly_recurring_revenue' to 'arr' in route.ts
-- 2. Database fix: Make owner_id nullable for public submissions
--
-- ============================================================================

-- Step 1: Make owner_id nullable to allow public form submissions
ALTER TABLE clients
  ALTER COLUMN owner_id DROP NOT NULL;

-- Step 2: Add comment to document this change
COMMENT ON COLUMN clients.owner_id IS 'Owner user ID. Can be NULL for public form submissions that have not yet been assigned to a user.';

-- Step 3: Update RLS policies to handle NULL owner_id
-- Drop existing policies
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
    OR auth.role() = 'service_role'  -- Service role can view all
  );

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow creating clients without owner (public forms)
    OR auth.role() = 'service_role'  -- Service role can insert
  );

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow updating unassigned clients
    OR auth.role() = 'service_role'  -- Service role can update all
  )
  WITH CHECK (
    auth.uid() = owner_id
    OR owner_id IS NULL
    OR auth.role() = 'service_role'
  );

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE
  USING (
    auth.uid() = owner_id
    OR owner_id IS NULL  -- Allow deleting unassigned clients
    OR auth.role() = 'service_role'  -- Service role can delete all
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify owner_id is now nullable
SELECT
  table_name,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name = 'owner_id';
-- Expected: is_nullable = 'YES'

-- Verify all required columns exist with correct names
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('arr', 'owner_id', 'phase', 'status', 'industry', 'notes')
ORDER BY column_name;

-- Count existing clients with NULL owner_id (should work after fix)
SELECT COUNT(*) as unassigned_clients
FROM clients
WHERE owner_id IS NULL;

-- ============================================================================
-- HOW TO APPLY THIS FIX
-- ============================================================================
-- Option 1: Via Supabase SQL Editor (RECOMMENDED)
--   1. Log in to https://supabase.com/dashboard
--   2. Select your project
--   3. Go to SQL Editor
--   4. Paste this entire script
--   5. Click "Run"
--
-- Option 2: Via CLI
--   psql "YOUR_DATABASE_CONNECTION_STRING" < EMERGENCY_FIX_FORMS.sql
--
-- Option 3: Via Supabase migrations
--   Copy migration file: supabase/migrations/20251023000000_fix_public_form_submissions.sql
--   Run: npx supabase db push --include-all
-- ============================================================================
