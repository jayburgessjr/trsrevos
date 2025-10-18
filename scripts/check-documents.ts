import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDocuments() {
  console.log('Fetching all documents from Supabase...\n')

  const { data, error } = await supabase
    .from('revos_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('No documents found in the database.')
    return
  }

  console.log(`Found ${data.length} documents:\n`)
  data.forEach((doc, index) => {
    console.log(`${index + 1}. ${doc.title}`)
    console.log(`   ID: ${doc.id}`)
    console.log(`   Type: ${doc.type}`)
    console.log(`   Status: ${doc.status}`)
    console.log(`   Project ID: ${doc.project_id || 'null'}`)
    console.log(`   Created: ${doc.created_at}`)
    console.log(`   Tags: ${doc.tags?.join(', ') || 'none'}`)
    console.log(`   Description preview: ${doc.description?.substring(0, 200) || 'none'}...`)
    console.log('')
  })
}

checkDocuments()
