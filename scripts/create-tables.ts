import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  console.log('Creating revos_projects tables...')

  const sql = readFileSync(join(__dirname, 'setup-revos-projects-table.sql'), 'utf-8')

  const { data, error } = await supabase.rpc('exec_sql', { sql })

  if (error) {
    console.error('Error creating tables:', error)
    // Try executing statements one by one
    const statements = sql.split(';').filter(s => s.trim())

    for (const statement of statements) {
      if (!statement.trim()) continue

      try {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        if (stmtError) {
          console.log('Skipping statement (may already exist):', stmtError.message)
        } else {
          console.log('✓ Executed statement successfully')
        }
      } catch (e) {
        console.log('Skipping statement:', e)
      }
    }
  } else {
    console.log('✓ Tables created successfully!')
  }
}

createTables().catch(console.error)
