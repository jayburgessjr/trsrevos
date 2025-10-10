-- Seed script for TRS RevOS database
-- Run this in Supabase SQL Editor to populate with dummy data

-- IMPORTANT: This script creates users in auth.users first, then references them in public.users
-- The auth.users table is managed by Supabase Auth, so we use raw_user_meta_data for profile info

-- Step 1: Insert test users into auth.users (Supabase Auth table)
-- Note: In production, users would be created via Supabase Auth signup
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@trs.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'sarah.chen@trs.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Sarah Chen"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
),
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'mike.johnson@trs.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Mike Johnson"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert test organization
INSERT INTO public.organizations (id, name, type, settings) VALUES
('00000000-0000-0000-0000-000000000001', 'TRS Internal', 'trs', '{}')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert test users into public.users (references auth.users)
INSERT INTO public.users (id, email, name, role, organization_id) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@trs.com', 'Admin User', 'SuperAdmin', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'sarah.chen@trs.com', 'Sarah Chen', 'Director', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'mike.johnson@trs.com', 'Mike Johnson', 'Member', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Step 4: Insert test clients
INSERT INTO public.clients (id, name, segment, arr, industry, region, phase, owner_id, health, churn_risk, status) VALUES
('20000000-0000-0000-0000-000000000001', 'Acme Corp', 'Enterprise', 450000, 'Technology', 'North America', 'Architecture', '10000000-0000-0000-0000-000000000002', 85, 10, 'active'),
('20000000-0000-0000-0000-000000000002', 'GlobalTech Inc', 'Mid', 280000, 'Finance', 'North America', 'Data', '10000000-0000-0000-0000-000000000003', 72, 25, 'active'),
('20000000-0000-0000-0000-000000000003', 'Innovate Solutions', 'SMB', 120000, 'Healthcare', 'Europe', 'Compounding', '10000000-0000-0000-0000-000000000002', 90, 5, 'active'),
('20000000-0000-0000-0000-000000000004', 'TechVentures', 'Enterprise', 680000, 'Technology', 'Asia', 'Algorithm', '10000000-0000-0000-0000-000000000002', 65, 45, 'active'),
('20000000-0000-0000-0000-000000000005', 'DataFlow Systems', 'Mid', 340000, 'Technology', 'North America', 'Architecture', '10000000-0000-0000-0000-000000000003', 78, 18, 'active')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Insert test opportunities
INSERT INTO public.opportunities (id, client_id, name, amount, stage, probability, close_date, owner_id) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Enterprise SaaS Platform', 450000, 'Negotiation', 75, '2025-11-15', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Revenue Analytics Suite', 280000, 'Proposal', 60, '2025-11-30', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Data Integration Platform', 120000, 'Qualify', 40, '2025-12-15', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'AI-Powered CRM', 680000, 'Negotiation', 80, '2025-11-20', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Cloud Migration Services', 340000, 'Proposal', 65, '2025-12-01', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Step 6: Insert test opportunity notes
INSERT INTO public.opportunity_notes (opportunity_id, author_id, body) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Strong interest from CFO, awaiting legal review'),
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Scheduled demo for next week with full executive team'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Technical evaluation in progress'),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Competitor comparison completed, we''re leading')
ON CONFLICT DO NOTHING;

-- Step 7: Insert test invoices
INSERT INTO public.invoices (id, invoice_number, client_id, status, issue_date, due_date, paid_date, amount, tax, total, payment_term) VALUES
('40000000-0000-0000-0000-000000000001', 'INV-2025-001', '20000000-0000-0000-0000-000000000001', 'Paid', '2025-08-15', '2025-09-15', '2025-09-10', 45000, 4500, 49500, 'Net 30'),
('40000000-0000-0000-0000-000000000002', 'INV-2025-002', '20000000-0000-0000-0000-000000000002', 'Paid', '2025-08-20', '2025-09-20', '2025-09-18', 28000, 2800, 30800, 'Net 30'),
('40000000-0000-0000-0000-000000000003', 'INV-2025-003', '20000000-0000-0000-0000-000000000003', 'Sent', '2025-09-15', '2025-10-15', NULL, 12000, 1200, 13200, 'Net 30'),
('40000000-0000-0000-0000-000000000004', 'INV-2025-004', '20000000-0000-0000-0000-000000000004', 'Paid', '2025-07-30', '2025-08-30', '2025-10-05', 68000, 6800, 74800, 'Net 30'),
('40000000-0000-0000-0000-000000000005', 'INV-2025-005', '20000000-0000-0000-0000-000000000005', 'Overdue', '2025-09-20', '2025-10-20', NULL, 34000, 3400, 37400, 'Net 30')
ON CONFLICT (id) DO NOTHING;

-- Step 8: Insert test projects
INSERT INTO public.projects (id, name, client_id, owner_id, status, phase, health, progress, start_date, due_date, budget, spent) VALUES
('50000000-0000-0000-0000-000000000001', 'Discovery Phase', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Active', 'Discovery', 'green', 79, '2025-09-01', '2025-11-30', 120000, 95000),
('50000000-0000-0000-0000-000000000002', 'Data Integration', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Active', 'Data', 'yellow', 75, '2025-08-15', '2025-12-15', 200000, 150000),
('50000000-0000-0000-0000-000000000003', 'Algorithm Development', '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Active', 'Algorithm', 'green', 88, '2025-07-01', '2025-10-31', 160000, 140000),
('50000000-0000-0000-0000-000000000004', 'Architecture Design', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Active', 'Architecture', 'yellow', 67, '2025-08-01', '2025-12-31', 180000, 120000),
('50000000-0000-0000-0000-000000000005', 'Compounding Implementation', '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Completed', 'Compounding', 'green', 100, '2025-06-01', '2025-09-30', 240000, 235000)
ON CONFLICT (id) DO NOTHING;

-- Step 9: Insert test client health history
INSERT INTO public.client_health_history (client_id, snapshot_date, health, churn_risk) VALUES
('20000000-0000-0000-0000-000000000001', '2025-09-01', 80, 15),
('20000000-0000-0000-0000-000000000001', '2025-10-01', 85, 10),
('20000000-0000-0000-0000-000000000002', '2025-09-01', 70, 28),
('20000000-0000-0000-0000-000000000002', '2025-10-01', 72, 25),
('20000000-0000-0000-0000-000000000003', '2025-09-01', 88, 8),
('20000000-0000-0000-0000-000000000003', '2025-10-01', 90, 5),
('20000000-0000-0000-0000-000000000004', '2025-09-01', 68, 48),
('20000000-0000-0000-0000-000000000004', '2025-10-01', 65, 45),
('20000000-0000-0000-0000-000000000005', '2025-09-01', 75, 22),
('20000000-0000-0000-0000-000000000005', '2025-10-01', 78, 18)
ON CONFLICT DO NOTHING;

-- Verification: Check record counts
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users WHERE id LIKE '10000000%'
UNION ALL
SELECT 'Organizations', COUNT(*) FROM public.organizations
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users
UNION ALL
SELECT 'Clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'Opportunities', COUNT(*) FROM public.opportunities
UNION ALL
SELECT 'Opportunity Notes', COUNT(*) FROM public.opportunity_notes
UNION ALL
SELECT 'Invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Client Health History', COUNT(*) FROM public.client_health_history;
