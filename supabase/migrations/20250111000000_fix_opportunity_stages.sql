-- Fix opportunity stage mismatch
-- Change 'New' to 'Prospect' to match application expectations

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Update the check constraint to use 'Prospect' instead of 'New'
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_stage_check;
ALTER TABLE opportunities ADD CONSTRAINT opportunities_stage_check
  CHECK (stage IN ('Prospect', 'Qualify', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'));

-- Update any existing 'New' stages to 'Prospect'
UPDATE opportunities SET stage = 'Prospect' WHERE stage = 'New';

-- Create opportunity_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS opportunity_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunity_notes_opportunity_id ON opportunity_notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_author_id ON opportunity_notes(author_id);

-- Add trigger for opportunity_notes updated_at
DROP TRIGGER IF EXISTS update_opportunity_notes_updated_at ON opportunity_notes;
CREATE TRIGGER update_opportunity_notes_updated_at
  BEFORE UPDATE ON opportunity_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
