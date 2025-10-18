import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function createTable() {
  console.log('Creating client_notes table directly...\n')

  // Use fetch to call Supabase's PostgREST admin API
  const url = `${supabaseUrl}/rest/v1/rpc/query`

  const sql = `
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
  `

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error response:', error)

      // Try direct SQL execution via psql
      console.log('\nDirect API call failed. Please run this SQL in Supabase Dashboard:')
      console.log('\n' + '='.repeat(70))
      console.log(sql)
      console.log('='.repeat(70) + '\n')
      return
    }

    const result = await response.json()
    console.log('✓ Table created successfully!')
    console.log('Result:', result)

    // Verify the table exists
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('client_notes')
      .select('count')
      .limit(1)

    if (error) {
      console.log('\n⚠ Warning: Could not verify table (schema cache may need refresh)')
      console.log('Error:', error.message)
    } else {
      console.log('\n✓ Table verified and accessible!')
    }

  } catch (error: any) {
    console.error('Error:', error.message)
    console.log('\nPlease run the SQL manually in Supabase Dashboard > SQL Editor:')
    console.log('\n' + '='.repeat(70))
    console.log(sql)
    console.log('='.repeat(70) + '\n')
  }
}

createTable()
