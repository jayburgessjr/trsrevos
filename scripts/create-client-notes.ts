import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createClientNotesTable() {
  console.log('Creating client_notes table...\n')

  // The table needs to be created via SQL Editor in Supabase Dashboard
  // Or via the SQL API
  console.log('Please run the following SQL in your Supabase SQL Editor:')
  console.log('(Dashboard > SQL Editor > New query)')
  console.log('\n' + '='.repeat(60))
  console.log(`
-- Create client_notes table
CREATE TABLE IF NOT EXISTS client_notes (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on client_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_notes_client_name ON client_notes(client_name);

-- Enable RLS
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON client_notes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON client_notes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON client_notes;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON client_notes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON client_notes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
ON client_notes FOR UPDATE
USING (true);
  `)
  console.log('='.repeat(60) + '\n')

  console.log('✓ SQL ready to copy/paste into Supabase Dashboard')
  console.log('\nOR you can run this command:')
  console.log('cat scripts/create-client-notes-table.sql | pbcopy')
  console.log('Then paste into Supabase SQL Editor\n')
}

createClientNotesTable()
