-- TRS RevOS Row Level Security Policies
-- Migration: 20241009000001_rls_policies

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's organization_id
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if current user is SuperAdmin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'SuperAdmin'
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if current user is Admin or SuperAdmin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('SuperAdmin', 'Admin')
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (id = public.user_organization_id() OR public.is_super_admin());

CREATE POLICY "SuperAdmins can manage all organizations"
  ON organizations FOR ALL
  USING (public.is_super_admin());

-- ============================================================================
-- USERS
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = public.user_organization_id() OR public.is_super_admin());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage users in their organization"
  ON users FOR ALL
  USING (
    public.is_super_admin() OR
    (public.is_admin() AND organization_id = public.user_organization_id())
  );

-- ============================================================================
-- CLIENTS
-- ============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients in their organization"
  ON clients FOR SELECT
  USING (
    public.is_super_admin() OR
    owner_id IN (SELECT id FROM users WHERE organization_id = public.user_organization_id())
  );

CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners and admins can update clients"
  ON clients FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete clients"
  ON clients FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- CONTACTS
-- ============================================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts for accessible clients"
  ON contacts FOR SELECT
  USING (
    client_id IN (SELECT id FROM clients)
  );

CREATE POLICY "Users can manage contacts for accessible clients"
  ON contacts FOR ALL
  USING (
    client_id IN (SELECT id FROM clients)
  );

-- ============================================================================
-- CLIENT RELATED TABLES
-- ============================================================================

-- Apply same pattern to all client-related tables
ALTER TABLE client_commercials ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE qra_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compounding_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_commercials_select" ON client_commercials FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "client_commercials_all" ON client_commercials FOR ALL USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "opportunities_select" ON opportunities FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "opportunities_all" ON opportunities FOR ALL USING (client_id IN (SELECT id FROM clients) OR owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "discovery_questions_select" ON discovery_questions FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "discovery_questions_all" ON discovery_questions FOR ALL USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "data_sources_select" ON data_sources FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "data_sources_all" ON data_sources FOR ALL USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "qra_strategies_select" ON qra_strategies FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "qra_strategies_all" ON qra_strategies FOR ALL USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "kanban_items_select" ON kanban_items FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "kanban_items_all" ON kanban_items FOR ALL USING (client_id IN (SELECT id FROM clients));

CREATE POLICY "compounding_metrics_select" ON compounding_metrics FOR SELECT USING (client_id IN (SELECT id FROM clients));
CREATE POLICY "compounding_metrics_all" ON compounding_metrics FOR ALL USING (client_id IN (SELECT id FROM clients));

-- ============================================================================
-- PROJECTS
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their organization"
  ON projects FOR SELECT
  USING (
    public.is_super_admin() OR
    client_id IN (SELECT id FROM clients) OR
    owner_id = auth.uid()
  );

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners and admins can update projects"
  ON projects FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (public.is_admin());

-- ============================================================================
-- FINANCE
-- ============================================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_forecast ENABLE ROW LEVEL SECURITY;

-- Finance tables accessible to admins and finance team
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (public.is_admin() OR client_id IN (SELECT id FROM clients));
CREATE POLICY "invoices_all" ON invoices FOR ALL USING (public.is_admin());

CREATE POLICY "invoice_line_items_select" ON invoice_line_items FOR SELECT USING (invoice_id IN (SELECT id FROM invoices));
CREATE POLICY "invoice_line_items_all" ON invoice_line_items FOR ALL USING (public.is_admin());

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (public.is_admin() OR client_id IN (SELECT id FROM clients));
CREATE POLICY "subscriptions_all" ON subscriptions FOR ALL USING (public.is_admin());

CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (public.is_admin());
CREATE POLICY "expenses_all" ON expenses FOR ALL USING (public.is_admin());

CREATE POLICY "equity_holders_select" ON equity_holders FOR SELECT USING (public.is_admin());
CREATE POLICY "equity_holders_all" ON equity_holders FOR ALL USING (public.is_super_admin());

CREATE POLICY "cash_flow_entries_select" ON cash_flow_entries FOR SELECT USING (public.is_admin());
CREATE POLICY "cash_flow_entries_all" ON cash_flow_entries FOR ALL USING (public.is_admin());

CREATE POLICY "profit_loss_periods_select" ON profit_loss_periods FOR SELECT USING (public.is_admin());
CREATE POLICY "profit_loss_periods_all" ON profit_loss_periods FOR ALL USING (public.is_admin());

CREATE POLICY "cash_flow_forecast_select" ON cash_flow_forecast FOR SELECT USING (public.is_admin());
CREATE POLICY "cash_flow_forecast_all" ON cash_flow_forecast FOR ALL USING (public.is_admin());

-- ============================================================================
-- PARTNERS
-- ============================================================================

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partners_select" ON partners FOR SELECT USING (
  public.is_super_admin() OR
  owner_id IN (SELECT id FROM users WHERE organization_id = public.user_organization_id())
);
CREATE POLICY "partners_insert" ON partners FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "partners_update" ON partners FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "partners_delete" ON partners FOR DELETE USING (public.is_admin());

CREATE POLICY "partner_contacts_select" ON partner_contacts FOR SELECT USING (partner_id IN (SELECT id FROM partners));
CREATE POLICY "partner_contacts_all" ON partner_contacts FOR ALL USING (partner_id IN (SELECT id FROM partners));

CREATE POLICY "partner_opportunities_select" ON partner_opportunities FOR SELECT USING (partner_id IN (SELECT id FROM partners));
CREATE POLICY "partner_opportunities_all" ON partner_opportunities FOR ALL USING (partner_id IN (SELECT id FROM partners));

CREATE POLICY "partner_initiatives_select" ON partner_initiatives FOR SELECT USING (partner_id IN (SELECT id FROM partners));
CREATE POLICY "partner_initiatives_all" ON partner_initiatives FOR ALL USING (partner_id IN (SELECT id FROM partners));

CREATE POLICY "partner_interactions_select" ON partner_interactions FOR SELECT USING (partner_id IN (SELECT id FROM partners));
CREATE POLICY "partner_interactions_all" ON partner_interactions FOR ALL USING (partner_id IN (SELECT id FROM partners));

CREATE POLICY "partner_resources_select" ON partner_resources FOR SELECT USING (partner_id IN (SELECT id FROM partners));
CREATE POLICY "partner_resources_all" ON partner_resources FOR ALL USING (partner_id IN (SELECT id FROM partners));

-- ============================================================================
-- CONTENT
-- ============================================================================

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_touches ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items_select" ON content_items FOR SELECT USING (
  owner_id IN (SELECT id FROM users WHERE organization_id = public.user_organization_id()) OR public.is_super_admin()
);
CREATE POLICY "content_items_insert" ON content_items FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "content_items_update" ON content_items FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());
CREATE POLICY "content_items_delete" ON content_items FOR DELETE USING (public.is_admin());

CREATE POLICY "content_variants_select" ON content_variants FOR SELECT USING (content_id IN (SELECT id FROM content_items));
CREATE POLICY "content_variants_all" ON content_variants FOR ALL USING (content_id IN (SELECT id FROM content_items));

CREATE POLICY "content_distribution_select" ON content_distribution FOR SELECT USING (content_id IN (SELECT id FROM content_items));
CREATE POLICY "content_distribution_all" ON content_distribution FOR ALL USING (content_id IN (SELECT id FROM content_items));

CREATE POLICY "content_touches_select" ON content_touches FOR SELECT USING (content_id IN (SELECT id FROM content_items));
CREATE POLICY "content_touches_all" ON content_touches FOR ALL USING (content_id IN (SELECT id FROM content_items));

CREATE POLICY "content_pieces_select" ON content_pieces FOR SELECT USING (
  created_by IN (SELECT id FROM users WHERE organization_id = public.user_organization_id()) OR public.is_super_admin()
);
CREATE POLICY "content_pieces_insert" ON content_pieces FOR INSERT WITH CHECK (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "content_pieces_update" ON content_pieces FOR UPDATE USING (created_by = auth.uid() OR assigned_to = auth.uid() OR public.is_admin());
CREATE POLICY "content_pieces_delete" ON content_pieces FOR DELETE USING (public.is_admin());

CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT USING (
  created_by IN (SELECT id FROM users WHERE organization_id = public.user_organization_id()) OR public.is_super_admin()
);
CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT WITH CHECK (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "ad_campaigns_delete" ON ad_campaigns FOR DELETE USING (public.is_admin());

CREATE POLICY "media_ideas_select" ON media_ideas FOR SELECT USING (
  public.user_organization_id() IS NOT NULL OR public.is_super_admin()
);
CREATE POLICY "media_ideas_all" ON media_ideas FOR ALL USING (
  public.user_organization_id() IS NOT NULL OR public.is_super_admin()
);

CREATE POLICY "media_projects_select" ON media_projects FOR SELECT USING (idea_id IN (SELECT id FROM media_ideas));
CREATE POLICY "media_projects_all" ON media_projects FOR ALL USING (idea_id IN (SELECT id FROM media_ideas));

CREATE POLICY "media_distribution_select" ON media_distribution FOR SELECT USING (project_id IN (SELECT id FROM media_projects));
CREATE POLICY "media_distribution_all" ON media_distribution FOR ALL USING (project_id IN (SELECT id FROM media_projects));

-- ============================================================================
-- PRODUCTIVITY
-- ============================================================================

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_plans_select" ON daily_plans FOR SELECT USING (
  user_id = auth.uid() OR
  (organization_id = public.user_organization_id() AND public.is_admin()) OR
  public.is_super_admin()
);
CREATE POLICY "daily_plans_insert" ON daily_plans FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "daily_plans_update" ON daily_plans FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "daily_plans_delete" ON daily_plans FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "priority_items_select" ON priority_items FOR SELECT USING (daily_plan_id IN (SELECT id FROM daily_plans));
CREATE POLICY "priority_items_all" ON priority_items FOR ALL USING (daily_plan_id IN (SELECT id FROM daily_plans));

CREATE POLICY "share_spaces_select" ON share_spaces FOR SELECT USING (
  created_by IN (SELECT id FROM users WHERE organization_id = public.user_organization_id()) OR public.is_super_admin()
);
CREATE POLICY "share_spaces_insert" ON share_spaces FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "share_spaces_update" ON share_spaces FOR UPDATE USING (created_by = auth.uid() OR public.is_admin());
CREATE POLICY "share_spaces_delete" ON share_spaces FOR DELETE USING (created_by = auth.uid() OR public.is_admin());

-- ============================================================================
-- EVENTS
-- ============================================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON events FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin() OR public.is_super_admin()
);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AGENTS
-- ============================================================================

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_runs_select" ON agent_runs FOR SELECT USING (
  user_id = auth.uid() OR
  (organization_id = public.user_organization_id() AND public.is_admin()) OR
  public.is_super_admin()
);
CREATE POLICY "agent_runs_insert" ON agent_runs FOR INSERT WITH CHECK (user_id = auth.uid());
