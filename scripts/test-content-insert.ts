import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testContentInsert() {
  console.log('Testing content insert...')

  const testContent = {
    id: `content-test-${Date.now()}`,
    title: 'Test Content',
    type: 'Post',
    client: 'Test Client',
    source_project_id: null,
    draft: 'This is a test draft',
    final_text: 'This is the final text',
    status: 'Draft',
  }

  console.log('Inserting:', testContent)

  const { data, error } = await supabase
    .from('revos_content')
    .insert(testContent)
    .select()

  if (error) {
    console.error('❌ Error inserting content:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
  } else {
    console.log('✅ Content inserted successfully:', data)
  }
}

testContentInsert()
