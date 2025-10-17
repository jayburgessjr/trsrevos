import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This API endpoint is PUBLIC - no auth required
// It creates a document in Supabase from form submissions

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, data } = body

    if (!formId || !data) {
      return NextResponse.json({ error: 'Missing formId or data' }, { status: 400 })
    }

    // Use service role key to bypass RLS for public form submissions
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Format the form data as a readable document description
    const formattedDescription = Object.entries(data)
      .map(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
        return `**${label}:** ${value}`
      })
      .join('\n\n')

    // Determine document type based on form
    const documentType = formId.includes('clarity')
      ? 'Audit Report'
      : formId.includes('blueprint')
        ? 'Intervention Blueprint'
        : 'Proposal'

    // Create document title with client name
    const clientName = data.clientName || data.companyName || 'Unknown Client'
    const documentTitle = `${
      formId.includes('clarity') ? 'Clarity Intake' : 'Blueprint Intake'
    } - ${clientName}`

    // Generate a unique ID for the document
    const documentId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Insert document into revos_documents table
    const { error: insertError } = await supabase.from('revos_documents').insert({
      id: documentId,
      project_id: null, // Unassigned - you'll link it later
      title: documentTitle,
      description: formattedDescription,
      type: documentType,
      tags: ['client-intake', formId],
      file_url: '#', // No file for form submissions
      version: 1,
      status: 'Draft',
      summary: `Client submission from ${formId} form`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Error inserting document:', insertError)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      documentId,
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
