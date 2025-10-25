-- Manual SQL to run in Supabase Dashboard SQL Editor
-- This adds financial tracking fields to the clients table

-- Add the new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='clients' AND column_name='deal_type') THEN
    ALTER TABLE clients ADD COLUMN deal_type TEXT CHECK (deal_type IN ('invoiced', 'equity_partnership', 'equity'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='clients' AND column_name='monthly_invoiced') THEN
    ALTER TABLE clients ADD COLUMN monthly_invoiced NUMERIC(12,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='clients' AND column_name='equity_percentage') THEN
    ALTER TABLE clients ADD COLUMN equity_percentage NUMERIC(5,2);
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN clients.deal_type IS 'Type of financial arrangement: invoiced (standard invoicing), equity_partnership ($2500/mo + 2% of client MRR), or equity (percentage of client MRR)';
COMMENT ON COLUMN clients.monthly_invoiced IS 'For invoiced deals: the monthly amount we invoice the client';
COMMENT ON COLUMN clients.equity_percentage IS 'For equity deals: our equity stake percentage (typically 15%)';

-- Confirm the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clients'
AND column_name IN ('deal_type', 'monthly_invoiced', 'equity_percentage');
