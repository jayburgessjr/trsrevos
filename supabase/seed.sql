-- Supabase Seed Data for TRS Rev OS
-- This file populates the database with realistic demo data for the finance module

-- ============================================================================
-- EQUITY HOLDERS
-- ============================================================================
INSERT INTO equity_holders (id, name, holder_type, equity_type, shares, percentage, value_at_current, grant_date, vesting_schedule, notes, created_at, updated_at)
VALUES
  -- Founders
  ('550e8400-e29b-41d4-a716-446655440001', 'Jay Burgess', 'Founder', 'Common Stock', 5000000, 50.0, 5000000, '2022-01-01',
   '{"startDate": "2022-01-01", "cliffMonths": 12, "vestingMonths": 48, "vestedShares": 3125000, "totalShares": 5000000}'::jsonb,
   'Founder & CEO - 4 year vesting with 1 year cliff', NOW(), NOW()),

  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Chen', 'Founder', 'Common Stock', 3000000, 30.0, 3000000, '2022-01-01',
   '{"startDate": "2022-01-01", "cliffMonths": 12, "vestingMonths": 48, "vestedShares": 1875000, "totalShares": 3000000}'::jsonb,
   'Co-Founder & CTO - 4 year vesting with 1 year cliff', NOW(), NOW()),

  -- Investors
  ('550e8400-e29b-41d4-a716-446655440003', 'Sequoia Capital', 'Investor', 'Preferred Stock', 1500000, 15.0, 2250000, '2023-06-15',
   NULL, 'Series A Lead - $2M investment at $13.3M post-money', NOW(), NOW()),

  ('550e8400-e29b-41d4-a716-446655440004', 'Y Combinator', 'Investor', 'SAFE', 300000, 3.0, 450000, '2022-08-01',
   NULL, '$125K SAFE - $5M cap', NOW(), NOW()),

  -- Employees
  ('550e8400-e29b-41d4-a716-446655440005', 'Mike Johnson', 'Employee', 'Options (ISO)', 200000, 2.0, 200000, '2023-03-15',
   '{"startDate": "2023-03-15", "cliffMonths": 12, "vestingMonths": 48, "vestedShares": 91667, "totalShares": 200000}'::jsonb,
   'VP Engineering - 4 year vesting', NOW(), NOW());

-- ============================================================================
-- INVOICES
-- ============================================================================
INSERT INTO invoices (id, client_id, invoice_number, status, issue_date, due_date, paid_date, amount, tax, discount, total, notes, currency, payment_method, created_at, updated_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM clients LIMIT 1 OFFSET 0), 'INV-2024-001', 'Paid', '2024-01-15', '2024-02-14', '2024-02-10', 25000.00, 2125.00, 0.00, 27125.00, 'Q1 2024 Consulting Services', 'USD', 'Wire Transfer', NOW(), NOW()),

  ('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM clients LIMIT 1 OFFSET 1), 'INV-2024-002', 'Paid', '2024-02-01', '2024-03-01', '2024-02-28', 15000.00, 1275.00, 0.00, 16275.00, 'Implementation Services', 'USD', 'ACH', NOW(), NOW()),

  ('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM clients LIMIT 1 OFFSET 2), 'INV-2024-003', 'Sent', '2024-09-01', '2024-10-01', NULL, 35000.00, 2975.00, 0.00, 37975.00, 'Strategy & Analytics Package', 'USD', NULL, NOW(), NOW()),

  ('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM clients LIMIT 1 OFFSET 0), 'INV-2024-004', 'Overdue', '2024-08-15', '2024-09-14', NULL, 20000.00, 1700.00, 1000.00, 20700.00, 'Q3 2024 Retainer', 'USD', NULL, NOW(), NOW()),

  ('660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM clients LIMIT 1 OFFSET 3), 'INV-2024-005', 'Draft', '2024-10-01', '2024-11-01', NULL, 45000.00, 3825.00, 0.00, 48825.00, 'Annual Platform License', 'USD', NULL, NOW(), NOW());

-- Invoice Line Items
INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount, created_at, updated_at)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Strategy Consulting Hours', 100, 250.00, 25000.00, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Platform Implementation', 1, 15000.00, 15000.00, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'Revenue Analytics Setup', 1, 20000.00, 20000.00, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'Custom Dashboard Development', 1, 15000.00, 15000.00, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'Monthly Retainer - Q3', 1, 20000.00, 20000.00, NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440005', 'Enterprise Platform License', 1, 45000.00, 45000.00, NOW(), NOW());

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
INSERT INTO subscriptions (id, client_id, product_name, billing_frequency, status, start_date, end_date, renewal_date, next_billing_date, mrr, arr, contract_value, billing_contact, payment_method, notes, created_at, updated_at)
VALUES
  ('880e8400-e29b-41d4-a716-446655440001', (SELECT id FROM clients LIMIT 1 OFFSET 0), 'Revenue OS Pro', 'Monthly', 'Active', '2024-01-01', '2025-01-01', '2025-01-01', '2024-11-01', 2500.00, 30000.00, 30000.00, 'billing@acmecorp.com', 'Credit Card', 'Annual contract paid monthly', NOW(), NOW()),

  ('880e8400-e29b-41d4-a716-446655440002', (SELECT id FROM clients LIMIT 1 OFFSET 1), 'Revenue OS Enterprise', 'Annual', 'Active', '2024-03-15', '2025-03-15', '2025-03-15', '2025-03-15', 4166.67, 50000.00, 50000.00, 'finance@techstartup.io', 'Wire Transfer', 'Paid annually upfront', NOW(), NOW()),

  ('880e8400-e29b-41d4-a716-446655440003', (SELECT id FROM clients LIMIT 1 OFFSET 2), 'Revenue OS Starter', 'Monthly', 'Trial', '2024-09-15', '2024-10-15', NULL, '2024-10-15', 0.00, 0.00, 12000.00, 'ops@growthco.com', NULL, '30-day trial period', NOW(), NOW()),

  ('880e8400-e29b-41d4-a716-446655440004', (SELECT id FROM clients LIMIT 1 OFFSET 3), 'Revenue OS Pro', 'Quarterly', 'Active', '2023-06-01', '2025-06-01', '2025-06-01', '2024-12-01', 2000.00, 24000.00, 48000.00, 'accounts@datainsights.com', 'ACH', '2-year contract with quarterly billing', NOW(), NOW()),

  ('880e8400-e29b-41d4-a716-446655440005', (SELECT id FROM clients LIMIT 1 OFFSET 4), 'Revenue OS Starter', 'Monthly', 'Paused', '2024-02-01', '2024-08-15', NULL, NULL, 0.00, 0.00, 12000.00, 'billing@smallbiz.com', 'Credit Card', 'Paused per customer request', NOW(), NOW());

-- ============================================================================
-- EXPENSES
-- ============================================================================
INSERT INTO expenses (id, date, category, vendor, description, amount, approved, approver_id, receipt_url, payment_method, notes, created_at, updated_at)
VALUES
  -- Payroll
  ('990e8400-e29b-41d4-a716-446655440001', '2024-09-30', 'Payroll', 'ADP', 'September Payroll', 85000.00, TRUE, NULL, NULL, 'ACH', 'Full-time team salaries', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440002', '2024-08-31', 'Payroll', 'ADP', 'August Payroll', 85000.00, TRUE, NULL, NULL, 'ACH', 'Full-time team salaries', NOW(), NOW()),

  -- Software & Tools
  ('990e8400-e29b-41d4-a716-446655440003', '2024-10-01', 'Software', 'Google Workspace', 'Team productivity suite', 720.00, TRUE, NULL, NULL, 'Credit Card', '10 users x $12/mo', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440004', '2024-10-01', 'Software', 'GitHub', 'Code hosting & CI/CD', 210.00, TRUE, NULL, NULL, 'Credit Card', 'Team plan', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440005', '2024-10-01', 'Software', 'Figma', 'Design tools', 135.00, TRUE, NULL, NULL, 'Credit Card', '3 seats professional plan', NOW(), NOW()),

  -- Hosting & Infrastructure
  ('990e8400-e29b-41d4-a716-446655440006', '2024-10-01', 'Hosting', 'Vercel', 'Application hosting', 380.00, TRUE, NULL, NULL, 'Credit Card', 'Pro plan with edge functions', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440007', '2024-10-01', 'Hosting', 'Supabase', 'Database & Auth', 250.00, TRUE, NULL, NULL, 'Credit Card', 'Pro plan', NOW(), NOW()),

  -- Marketing
  ('990e8400-e29b-41d4-a716-446655440008', '2024-09-15', 'Marketing', 'Google Ads', 'Search advertising', 3500.00, TRUE, NULL, NULL, 'Credit Card', 'Q3 campaign', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440009', '2024-09-20', 'Marketing', 'LinkedIn Ads', 'B2B lead generation', 2800.00, TRUE, NULL, NULL, 'Credit Card', 'Sponsored content', NOW(), NOW()),

  -- Office & Equipment
  ('990e8400-e29b-41d4-a716-446655440010', '2024-09-05', 'Office', 'WeWork', 'Co-working space', 2400.00, TRUE, NULL, NULL, 'ACH', '6 desks for September', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440011', '2024-08-22', 'Equipment', 'Apple', 'MacBook Pro for new hire', 3200.00, TRUE, NULL, NULL, 'Credit Card', 'M3 Max 36GB RAM', NOW(), NOW()),

  -- Professional Services
  ('990e8400-e29b-41d4-a716-446655440012', '2024-09-30', 'Professional', 'Cooley LLP', 'Legal services', 4500.00, TRUE, NULL, NULL, 'Wire Transfer', 'Contract review and corporate matters', NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440013', '2024-09-30', 'Professional', 'Fidelity CPAs', 'Accounting & bookkeeping', 2200.00, TRUE, NULL, NULL, 'ACH', 'Monthly accounting services', NOW(), NOW()),

  -- Pending Approvals
  ('990e8400-e29b-41d4-a716-446655440014', '2024-10-08', 'Software', 'Notion', 'Team workspace', 240.00, FALSE, NULL, NULL, 'Credit Card', 'Business plan upgrade', NOW(), NOW());

-- ============================================================================
-- CASH FLOW ENTRIES
-- ============================================================================
INSERT INTO cash_flow_entries (id, date, type, category, description, amount, balance, reference_id, reference_type, created_at, updated_at)
VALUES
  -- Starting balance
  ('aa0e8400-e29b-41d4-a716-446655440001', '2024-01-01', 'Inflow', 'Investment', 'Series A Funding - Sequoia Capital', 2000000.00, 2500000.00, '550e8400-e29b-41d4-a716-446655440003', 'equity_holder', NOW(), NOW()),

  -- January
  ('aa0e8400-e29b-41d4-a716-446655440002', '2024-01-15', 'Outflow', 'Payroll', 'January Payroll', 82000.00, 2418000.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440003', '2024-01-31', 'Outflow', 'Operating', 'January Operating Expenses', 12500.00, 2405500.00, NULL, NULL, NOW(), NOW()),

  -- February
  ('aa0e8400-e29b-41d4-a716-446655440004', '2024-02-10', 'Inflow', 'Revenue', 'Payment - ACME Corp (INV-2024-001)', 27125.00, 2432625.00, '660e8400-e29b-41d4-a716-446655440001', 'invoice', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440005', '2024-02-15', 'Outflow', 'Payroll', 'February Payroll', 82000.00, 2350625.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440006', '2024-02-28', 'Inflow', 'Revenue', 'Payment - TechStartup (INV-2024-002)', 16275.00, 2366900.00, '660e8400-e29b-41d4-a716-446655440002', 'invoice', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440007', '2024-02-29', 'Outflow', 'Operating', 'February Operating Expenses', 13200.00, 2353700.00, NULL, NULL, NOW(), NOW()),

  -- March
  ('aa0e8400-e29b-41d4-a716-446655440008', '2024-03-15', 'Inflow', 'Revenue', 'Enterprise Annual Payment', 50000.00, 2403700.00, '880e8400-e29b-41d4-a716-446655440002', 'subscription', NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440009', '2024-03-15', 'Outflow', 'Payroll', 'March Payroll', 85000.00, 2318700.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440010', '2024-03-31', 'Outflow', 'Operating', 'March Operating Expenses', 14800.00, 2303900.00, NULL, NULL, NOW(), NOW()),

  -- Recent months (summarized)
  ('aa0e8400-e29b-41d4-a716-446655440011', '2024-04-30', 'Outflow', 'Operating', 'April Net Operating', 92000.00, 2211900.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440012', '2024-05-31', 'Outflow', 'Operating', 'May Net Operating', 88000.00, 2123900.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440013', '2024-06-30', 'Inflow', 'Revenue', 'June Net Revenue', 45000.00, 2168900.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440014', '2024-07-31', 'Outflow', 'Operating', 'July Net Operating', 95000.00, 2073900.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440015', '2024-08-31', 'Outflow', 'Operating', 'August Net Operating', 98000.00, 1975900.00, NULL, NULL, NOW(), NOW()),
  ('aa0e8400-e29b-41d4-a716-446655440016', '2024-09-30', 'Inflow', 'Revenue', 'September Net Revenue', 52000.00, 2027900.00, NULL, NULL, NOW(), NOW());

-- ============================================================================
-- CASH FLOW FORECAST
-- ============================================================================
INSERT INTO cash_flow_forecast (id, month, beginning_balance, expected_inflows, expected_outflows, ending_balance, runway, assumptions, created_at, updated_at)
VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'October 2024', 2027900.00, 65000.00, 105000.00, 1987900.00, 18.94,
   '{"revenue": "Conservative estimate based on active subscriptions and pipeline", "expenses": "Includes planned new hire"}', NOW(), NOW()),

  ('bb0e8400-e29b-41d4-a716-446655440002', 'November 2024', 1987900.00, 70000.00, 108000.00, 1949900.00, 18.05,
   '{"revenue": "Includes projected Q4 deals closing", "expenses": "Holiday seasonality factored in"}', NOW(), NOW()),

  ('bb0e8400-e29b-41d4-a716-446655440003', 'December 2024', 1949900.00, 85000.00, 112000.00, 1922900.00, 17.17,
   '{"revenue": "Year-end renewals and new contracts", "expenses": "Year-end bonuses included"}', NOW(), NOW());

-- ============================================================================
-- PROFIT & LOSS PERIODS
-- ============================================================================
INSERT INTO profit_loss_periods (id, period, period_start, period_end, revenue, cogs, gross_profit, operating_expenses, net_income, gross_margin, net_margin, created_at, updated_at)
VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'Q3 2024', '2024-07-01', '2024-09-30',
   '{"subscriptions": 168000, "services": 95000, "other": 5000, "total": 268000}'::jsonb,
   '{"hosting": 5500, "software": 3200, "total": 8700}'::jsonb,
   259300.00,
   '{"payroll": 255000, "marketing": 18500, "software": 9600, "office": 14400, "professional": 20100, "hosting": 7200, "other": 5200, "total": 330000}'::jsonb,
   -70700.00, 96.75, -26.38, NOW(), NOW()),

  ('cc0e8400-e29b-41d4-a716-446655440002', 'Q2 2024', '2024-04-01', '2024-06-30',
   '{"subscriptions": 145000, "services": 78000, "other": 3500, "total": 226500}'::jsonb,
   '{"hosting": 4800, "software": 2900, "total": 7700}'::jsonb,
   218800.00,
   '{"payroll": 247000, "marketing": 15200, "software": 8900, "office": 12800, "professional": 18500, "hosting": 6800, "other": 4300, "total": 313500}'::jsonb,
   -94700.00, 96.60, -41.81, NOW(), NOW());

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data successfully inserted!';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - 5 equity holders';
  RAISE NOTICE '  - 5 invoices with line items';
  RAISE NOTICE '  - 5 subscriptions';
  RAISE NOTICE '  - 14 expenses';
  RAISE NOTICE '  - 16 cash flow entries';
  RAISE NOTICE '  - 3 cash flow forecasts';
  RAISE NOTICE '  - 2 profit & loss periods';
END $$;
