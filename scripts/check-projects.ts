import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProjects() {
  console.log('Fetching all projects from Supabase...\n')

  const { data, error } = await supabase
    .from('revos_projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No projects found in the database.')
    return
  }

  console.log(`Found ${data.length} projects:\n`)
  data.forEach((project, index) => {
    console.log(`${index + 1}. ${project.name}`)
    console.log(`   ID: ${project.id}`)
    console.log(`   Client: ${project.client}`)
    console.log(`   Type: ${project.type}`)
    console.log(`   Status: ${project.status}`)
    console.log(`   Created: ${project.created_at}`)
    console.log(`   Team: ${project.team?.join(', ') || 'none'}`)
    console.log('')
  })
}

checkProjects()
