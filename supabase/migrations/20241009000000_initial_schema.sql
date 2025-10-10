-- TRS RevOS Initial Database Schema
-- Migration: 20241009000000_initial_schema

-- Enable UUID generation utilities
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CORE TABLES (Organizations & Users)
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trs', 'client', 'partner')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SuperAdmin', 'Admin', 'Director', 'Member', 'Client')),
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- 2. CLIENTS MODULE
-- ============================================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  segment TEXT CHECK (segment IN ('SMB', 'Mid', 'Enterprise')),
  arr NUMERIC(12,2),
  industry TEXT,
  region TEXT,
  phase TEXT CHECK (phase IN ('Discovery', 'Data', 'Algorithm', 'Architecture', 'Compounding')),
  owner_id UUID NOT NULL REFERENCES users(id),
  health INTEGER CHECK (health >= 0 AND health <= 100),
  churn_risk INTEGER CHECK (churn_risk >= 0 AND churn_risk <= 100),
  qbr_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'churned')),
  is_expansion BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_owner_id ON clients(owner_id);
CREATE INDEX idx_clients_phase ON clients(phase);
CREATE INDEX idx_clients_status ON clients(status);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  power TEXT CHECK (power IN ('User', 'Influencer', 'Decision', 'Economic')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_client_id ON contacts(client_id);

CREATE TABLE client_commercials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  term_months INTEGER NOT NULL,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  renewal_date DATE,
  payment_terms TEXT,
  approvals TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('New', 'Qualify', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost')),
  next_step TEXT,
  next_step_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  close_date DATE,
  owner_id UUID NOT NULL REFERENCES users(id),
  company TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);

CREATE TABLE discovery_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  lever TEXT,
  expected_impact NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'Collected', 'Missing')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qra_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pricing TEXT[],
  offers TEXT[],
  retention TEXT[],
  partners TEXT[],
  expected_impact NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kanban_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Backlog', 'Doing', 'Blocked', 'Review', 'Done')),
  owner TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compounding_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  baseline_mrr NUMERIC(12,2) NOT NULL,
  current_mrr NUMERIC(12,2) NOT NULL,
  net_new NUMERIC(12,2),
  forecast_qtd NUMERIC(12,2),
  drivers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. PROJECTS MODULE
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('Active', 'On Hold', 'Completed', 'Cancelled')),
  phase TEXT CHECK (phase IN ('Discovery', 'Data', 'Algorithm', 'Architecture', 'Compounding')),
  health TEXT CHECK (health IN ('green', 'yellow', 'red')),
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  due_date DATE,
  completed_date DATE,
  budget NUMERIC(12,2),
  spent NUMERIC(12,2),
  deliverables TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ============================================================================
-- 4. FINANCE MODULE
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  amount NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  payment_term TEXT CHECK (payment_term IN ('Due on Receipt', 'Net 15', 'Net 30', 'Net 60', 'Net 90')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  product_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Paused', 'Cancelled', 'Trial', 'Past Due')),
  mrr NUMERIC(12,2) NOT NULL,
  arr NUMERIC(12,2) NOT NULL,
  billing_frequency TEXT NOT NULL CHECK (billing_frequency IN ('Monthly', 'Quarterly', 'Annually', 'One-time')),
  start_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  next_billing_date DATE,
  contract_value NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Payroll & Benefits', 'Marketing & Advertising', 'Software & Tools', 'Office & Equipment', 'Travel & Entertainment', 'Professional Services', 'Hosting & Infrastructure', 'Other')),
  vendor TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);

CREATE TABLE equity_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  holder_type TEXT NOT NULL CHECK (holder_type IN ('Founder', 'Investor', 'Employee', 'Advisor', 'Entity')),
  equity_type TEXT NOT NULL CHECK (equity_type IN ('Common Stock', 'Preferred Stock', 'Options', 'Warrant', 'SAFE', 'Convertible Note')),
  shares NUMERIC(15,0) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  value_at_current NUMERIC(12,2),
  investment_date DATE NOT NULL,
  vesting_schedule JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cash_flow_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Inflow', 'Outflow')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  balance NUMERIC(12,2) NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profit_loss_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT UNIQUE NOT NULL,
  revenue JSONB NOT NULL,
  expenses JSONB NOT NULL,
  net_income NUMERIC(12,2) NOT NULL,
  profit_margin NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cash_flow_forecast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  beginning_balance NUMERIC(12,2) NOT NULL,
  expected_inflows NUMERIC(12,2) NOT NULL,
  expected_outflows NUMERIC(12,2) NOT NULL,
  ending_balance NUMERIC(12,2) NOT NULL,
  runway_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. PARTNERS MODULE
-- ============================================================================

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  focus TEXT NOT NULL,
  city TEXT,
  state TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('Initial Outreach', 'Discovery', 'Pilot Collaboration', 'Contracting', 'Launch', 'Dormant')),
  owner_id UUID NOT NULL REFERENCES users(id),
  model TEXT CHECK (model IN ('Referral Exchange', 'Co-Marketing', 'Co-Sell', 'Community')),
  potential_value NUMERIC(12,2),
  warm_introductions INTEGER DEFAULT 0,
  mutual_clients INTEGER DEFAULT 0,
  readiness_score INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
  notes TEXT[],
  website TEXT,
  last_interaction DATE,
  ecosystem_fit TEXT CHECK (ecosystem_fit IN ('Anchor', 'Strategic', 'Emerging')),
  strengths TEXT[],
  needs TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_owner_id ON partners(owner_id);
CREATE INDEX idx_partners_stage ON partners(stage);

CREATE TABLE partner_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_contacts_partner_id ON partner_contacts(partner_id);

CREATE TABLE partner_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Referral', 'Joint Project', 'Event')),
  value NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Sourcing', 'Introduced', 'In Motion', 'Won', 'Stalled')),
  target_client TEXT NOT NULL,
  expected_close DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partner_opportunities_partner_id ON partner_opportunities(partner_id);

CREATE TABLE partner_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Planning', 'Active', 'Completed')),
  due_date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Call', 'Meeting', 'Intro', 'Event', 'Email')),
  summary TEXT NOT NULL,
  next_step TEXT,
  sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Caution')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE partner_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Deck', 'One-Pager', 'Case Study', 'Checklist', 'Playbook')),
  url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CONTENT MODULE
-- ============================================================================

CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Idea', 'Draft', 'Review', 'Scheduled', 'Published')),
  persona TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('Discovery', 'Evaluation', 'Decision', 'Onboarding', 'Adoption')),
  objection TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  cost NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sla TEXT,
  brief JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_items_owner_id ON content_items(owner_id);
CREATE INDEX idx_content_items_status ON content_items(status);

CREATE TABLE content_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  headline TEXT NOT NULL,
  cta TEXT NOT NULL,
  variant_group TEXT CHECK (variant_group IN ('A', 'B')),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_variants_content_id ON content_variants(content_id);

CREATE TABLE content_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  utm TEXT,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_distribution_content_id ON content_distribution(content_id);

CREATE TABLE content_touches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('used', 'worked', 'failed')),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_touches_content_id ON content_touches(content_id);
CREATE INDEX idx_content_touches_opportunity_id ON content_touches(opportunity_id);

CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('Client', 'Prospect', 'Partner', 'Marketing')),
  format TEXT NOT NULL CHECK (format IN ('Post', 'Webinar', 'Workshop', 'One-Pager', 'Email', 'Case Study', 'White Paper', 'Video', 'Infographic')),
  status TEXT NOT NULL CHECK (status IN ('Idea', 'Draft', 'Review', 'Scheduled', 'Published')),
  purpose TEXT CHECK (purpose IN ('Inspire', 'Sell', 'Add Value')),
  channel TEXT,
  target_audience TEXT NOT NULL,
  target_id UUID,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  scheduled_date DATE,
  published_date DATE,
  due_date DATE,
  ai_generated BOOLEAN DEFAULT false,
  performance_metrics JSONB,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_content_pieces_created_by ON content_pieces(created_by);
CREATE INDEX idx_content_pieces_status ON content_pieces(status);

CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('LinkedIn', 'Google', 'Facebook', 'Twitter', 'Multi-Channel')),
  objective TEXT NOT NULL CHECK (objective IN ('Brand Awareness', 'Lead Generation', 'Conversion', 'Engagement')),
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed')),
  budget NUMERIC(12,2) NOT NULL,
  spent NUMERIC(12,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  target_audience TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  metrics JSONB,
  content_ids UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);

CREATE TABLE media_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  persona TEXT NOT NULL,
  stage TEXT NOT NULL,
  objection TEXT NOT NULL,
  expected_impact TEXT,
  effort TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES media_ideas(id),
  status TEXT NOT NULL CHECK (status IN ('Planned', 'Recording', 'Post', 'Scheduled', 'Published')),
  jellypod_url TEXT,
  transcript TEXT,
  artifacts JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media_distribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES media_projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('YouTube', 'Podcast', 'LinkedIn', 'X', 'Email', 'Partner')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  utm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. PRODUCTIVITY & PLANNING MODULE
-- ============================================================================

CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  date_iso DATE NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX idx_daily_plans_date ON daily_plans(date_iso);

CREATE TABLE priority_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_plan_id UUID REFERENCES daily_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  expected_impact NUMERIC(12,2),
  effort_hours NUMERIC(4,1),
  probability NUMERIC(3,2) CHECK (probability >= 0 AND probability <= 1),
  urgency INTEGER CHECK (urgency >= 1 AND urgency <= 10),
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  strategic_weight TEXT CHECK (strategic_weight IN ('Brilliant', 'Incremental', 'Stabilization')),
  next_action TEXT,
  module_href TEXT,
  status TEXT CHECK (status IN ('Ready', 'InProgress', 'Done', 'Deferred')),
  roi_dollars NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_priority_items_plan_id ON priority_items(daily_plan_id);

CREATE TABLE share_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  watermark BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. EVENTS & ACTIVITY TRACKING
-- ============================================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_entity ON events(entity);
CREATE INDEX idx_events_user_id ON events(user_id);

-- ============================================================================
-- 9. AGENTS MODULE
-- ============================================================================

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  payload JSONB,
  result JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error TEXT
);

CREATE INDEX idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX idx_agent_runs_agent_key ON agent_runs(agent_key);
CREATE INDEX idx_agent_runs_started_at ON agent_runs(started_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_commercials_updated_at BEFORE UPDATE ON client_commercials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discovery_questions_updated_at BEFORE UPDATE ON discovery_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qra_strategies_updated_at BEFORE UPDATE ON qra_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kanban_items_updated_at BEFORE UPDATE ON kanban_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compounding_metrics_updated_at BEFORE UPDATE ON compounding_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equity_holders_updated_at BEFORE UPDATE ON equity_holders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profit_loss_periods_updated_at BEFORE UPDATE ON profit_loss_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_flow_forecast_updated_at BEFORE UPDATE ON cash_flow_forecast FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_contacts_updated_at BEFORE UPDATE ON partner_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_opportunities_updated_at BEFORE UPDATE ON partner_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_initiatives_updated_at BEFORE UPDATE ON partner_initiatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_resources_updated_at BEFORE UPDATE ON partner_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_distribution_updated_at BEFORE UPDATE ON content_distribution FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_pieces_updated_at BEFORE UPDATE ON content_pieces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_projects_updated_at BEFORE UPDATE ON media_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_plans_updated_at BEFORE UPDATE ON daily_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_priority_items_updated_at BEFORE UPDATE ON priority_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
