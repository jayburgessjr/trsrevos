-- Insert Test Organization and User
-- Seed data to ensure Supabase-backed integrations have an owner_id

-- Insert TRS organization
INSERT INTO organizations (id, name, type, settings, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'TRS',
  'trs',
  '{}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Insert admin user (using the auth user ID created by create-test-user script)
INSERT INTO users (id, email, name, role, organization_id, created_at, updated_at)
VALUES (
  'c4c0e68e-8154-4f87-9aca-6b2bc50edbf0'::uuid,
  'admin@trs.com',
  'Admin User',
  'SuperAdmin',
  (SELECT id FROM organizations WHERE name = 'TRS' AND type = 'trs' LIMIT 1),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
