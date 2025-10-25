-- Add financial tracking fields to clients table
-- Migration: 20251025000000_add_client_financial_tracking

ALTER TABLE clients
  ADD COLUMN deal_type TEXT CHECK (deal_type IN ('invoiced', 'equity_partnership', 'equity')),
  ADD COLUMN monthly_invoiced NUMERIC(12,2),
  ADD COLUMN equity_percentage NUMERIC(5,2);

COMMENT ON COLUMN clients.deal_type IS 'Type of financial arrangement: invoiced (standard invoicing), equity_partnership ($2500/mo + 2% of client MRR), or equity (percentage of client MRR)';
COMMENT ON COLUMN clients.monthly_invoiced IS 'For invoiced deals: the monthly amount we invoice the client';
COMMENT ON COLUMN clients.equity_percentage IS 'For equity deals: our equity stake percentage (typically 15%)';
