-- Create opportunity_activities table for tracking tasks, calls, meetings, emails
CREATE TABLE IF NOT EXISTS opportunity_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'task', 'call', 'meeting', 'email', 'note'
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_opportunity_activities_opportunity_id ON opportunity_activities(opportunity_id);
CREATE INDEX idx_opportunity_activities_assigned_to ON opportunity_activities(assigned_to);
CREATE INDEX idx_opportunity_activities_due_date ON opportunity_activities(due_date);
CREATE INDEX idx_opportunity_activities_status ON opportunity_activities(status);

-- RLS Policies
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for accessible opportunities"
  ON opportunity_activities FOR SELECT
  USING (
    opportunity_id IN (SELECT id FROM opportunities)
  );

CREATE POLICY "Users can create activities for accessible opportunities"
  ON opportunity_activities FOR INSERT
  WITH CHECK (
    opportunity_id IN (SELECT id FROM opportunities) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their own activities"
  ON opportunity_activities FOR UPDATE
  USING (
    created_by = auth.uid() OR assigned_to = auth.uid()
  );

CREATE POLICY "Users can delete their own activities"
  ON opportunity_activities FOR DELETE
  USING (
    created_by = auth.uid()
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_opportunity_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opportunity_activities_updated_at
  BEFORE UPDATE ON opportunity_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_activities_updated_at();
