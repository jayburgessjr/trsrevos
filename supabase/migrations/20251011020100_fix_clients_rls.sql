-- Fix RLS policy for clients table to allow authenticated users to create clients
-- The issue is that auth.uid() must match owner_id exactly

-- Ensure the is_admin function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('SuperAdmin', 'Admin')
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create clients" ON clients;

-- Create a new policy that allows any authenticated user to create clients
-- with themselves as owner
CREATE POLICY "Authenticated users can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (owner_id = auth.uid() OR public.is_admin())
  );

-- Also ensure the update policy is working correctly
DROP POLICY IF EXISTS "Owners and admins can update clients" ON clients;

CREATE POLICY "Owners and admins can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR public.is_admin()
  )
  WITH CHECK (
    owner_id = auth.uid() OR public.is_admin()
  );
