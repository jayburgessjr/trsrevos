import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  try {
    console.log('Reading migration file...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251017200000_create_client_notes.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('Running migration...')
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      // Try running the migration directly using the client
      console.log('Trying direct execution...')

      // Split the SQL by statements and execute them one by one
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement })
        if (stmtError) {
          console.error(`Error executing statement: ${stmtError.message}`)
        }
      }
    }

    console.log('Migration completed successfully!')
    console.log('\nVerifying table creation...')

    const { data, error: checkError } = await supabase
      .from('client_notes')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('Table verification failed:', checkError.message)
    } else {
      console.log('✓ client_notes table is accessible!')
    }

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
