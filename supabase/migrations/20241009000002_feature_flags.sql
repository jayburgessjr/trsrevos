-- Feature flags governance table
-- Migration: 20241009000002_feature_flags

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  access_level TEXT NOT NULL DEFAULT 'Admin' CHECK (access_level IN ('Admin', 'Director', 'SuperAdmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);

DROP TRIGGER IF EXISTS set_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER set_feature_flags_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_flags_read ON feature_flags;
CREATE POLICY feature_flags_read ON feature_flags
  FOR SELECT
  USING (auth.role() IN ('service_role', 'authenticated'));

DROP POLICY IF EXISTS feature_flags_manage ON feature_flags;
CREATE POLICY feature_flags_manage ON feature_flags
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE feature_flags IS 'Feature flag toggles for the TRS platform settings control center.';
COMMENT ON COLUMN feature_flags.access_level IS 'Minimum role required to see the feature in product surfaces.';
