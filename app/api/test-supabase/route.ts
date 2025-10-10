import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Try to get the current user (will be null if not authenticated, but connection works)
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Test a simple query to verify database connection
    const { error: dbError } = await supabase.from('_test_connection').select('*').limit(1)

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      connected: true,
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      // Note: dbError is expected if table doesn't exist - that's fine, it means we connected
      canQueryDatabase: !dbError || dbError.code === 'PGRST116' // PGRST116 = table not found
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Supabase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
