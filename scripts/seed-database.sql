-- Seed script for TRS RevOS database
-- Run this in Supabase SQL Editor to populate with dummy data

-- First, create some test users (assuming auth.users exists)
-- Note: In production, users would be created via Supabase Auth

-- Insert test organization
INSERT INTO public.organizations (id, name, type, settings) VALUES
('00000000-0000-0000-0000-000000000001', 'TRS Internal', 'trs', '{}')
ON CONFLICT (id) DO NOTHING;

-- Insert test users
INSERT INTO public.users (id, email, name, role, organization_id) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@trs.com', 'Admin User', 'SuperAdmin', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'sarah.chen@trs.com', 'Sarah Chen', 'Director', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'mike.johnson@trs.com', 'Mike Johnson', 'Member', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert test clients
INSERT INTO public.clients (id, name, segment, arr, industry, region, phase, owner_id, health, churn_risk, status) VALUES
('20000000-0000-0000-0000-000000000001', 'Acme Corp', 'Enterprise', 450000, 'Technology', 'North America', 'Architecture', '10000000-0000-0000-0000-000000000002', 85, 10, 'active'),
('20000000-0000-0000-0000-000000000002', 'GlobalTech Inc', 'Mid', 280000, 'Finance', 'North America', 'Data', '10000000-0000-0000-0000-000000000003', 72, 25, 'active'),
('20000000-0000-0000-0000-000000000003', 'Innovate Solutions', 'SMB', 120000, 'Healthcare', 'Europe', 'Compounding', '10000000-0000-0000-0000-000000000002', 90, 5, 'active'),
('20000000-0000-0000-0000-000000000004', 'TechVentures', 'Enterprise', 680000, 'Technology', 'Asia', 'Algorithm', '10000000-0000-0000-0000-000000000002', 65, 45, 'active'),
('20000000-0000-0000-0000-000000000005', 'DataFlow Systems', 'Mid', 340000, 'Technology', 'North America', 'Architecture', '10000000-0000-0000-0000-000000000003', 78, 18, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert test opportunities
INSERT INTO public.opportunities (id, client_id, name, amount, stage, probability, close_date, owner_id) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Enterprise SaaS Platform', 450000, 'Negotiation', 75, '2025-11-15', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Revenue Analytics Suite', 280000, 'Proposal', 60, '2025-11-30', '10000000-0000-0000-0000-000000000003'),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Data Integration Platform', 120000, 'Qualify', 40, '2025-12-15', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'AI-Powered CRM', 680000, 'Negotiation', 80, '2025-11-20', '10000000-0000-0000-0000-000000000002'),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Cloud Migration Services', 340000, 'Proposal', 65, '2025-12-01', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Insert test opportunity notes
INSERT INTO public.opportunity_notes (opportunity_id, author_id, body) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Strong interest from CFO, awaiting legal review'),
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Scheduled demo for next week with full executive team'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Technical evaluation in progress'),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Competitor comparison completed, we''re leading')
ON CONFLICT DO NOTHING;

-- Insert test invoices
INSERT INTO public.invoices (id, client_id, amount, status, due_date, paid_at) VALUES
('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 45000, 'paid', '2025-09-15', '2025-09-10'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 28000, 'paid', '2025-09-20', '2025-09-18'),
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 12000, 'pending', '2025-10-15', NULL),
('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 68000, 'paid', '2025-08-30', '2025-10-05'),
('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 34000, 'pending', '2025-10-20', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert test projects
INSERT INTO public.projects (id, client_id, name, status, hours_budgeted, hours_actual) VALUES
('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Discovery Phase', 'active', 120, 95),
('50000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Data Integration', 'active', 200, 150),
('50000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Algorithm Development', 'active', 160, 140),
('50000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Architecture Design', 'active', 180, 120),
('50000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Compounding Implementation', 'completed', 240, 235)
ON CONFLICT (id) DO NOTHING;

-- Insert test client health history
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

-- Verify data
SELECT 'Organizations' as table_name, COUNT(*) as count FROM public.organizations
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
