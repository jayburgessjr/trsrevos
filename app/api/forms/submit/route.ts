import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

// This API endpoint is PUBLIC - no auth required
// It creates a document in Supabase from form submissions

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const defaultClientOwnerId = process.env.SUPABASE_DEFAULT_CLIENT_OWNER_ID?.trim()

function parseCurrency(value: unknown): number {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return 0
  }

  const normalized = String(value).replace(/[^0-9.-]+/g, '')
  const parsed = Number.parseFloat(normalized)

  return Number.isFinite(parsed) ? parsed : 0
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, data } = body

    if (!formId || !data) {
      return NextResponse.json({ error: 'Missing formId or data' }, { status: 400 })
    }

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Use service role key to bypass RLS for public form submissions
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

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

    // Generate unique IDs
    const documentId = randomUUID()
    const projectId = randomUUID()

    // Normalize revenue inputs for reuse
    const monthlyRevenue = parseCurrency(data.monthlyRevenue)
    const annualRevenue = parseCurrency(data.annualRevenue) || monthlyRevenue * 12

    // Step 1: Create client in clients table (requires an owner)
    let clientId: string | undefined
    if (defaultClientOwnerId) {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientName,
          industry: data.industry || null,
          arr: annualRevenue,
          phase: 'Discovery',
          status: 'active',
          owner_id: defaultClientOwnerId,
          notes: formattedDescription,
        })
        .select('id')
        .single()

      if (clientError) {
        console.error('Error creating client:', clientError)
        // Continue anyway - we'll create an unlinked project
      } else {
        clientId = client.id
      }
    } else {
      console.warn('SUPABASE_DEFAULT_CLIENT_OWNER_ID not set - skipping client creation')
    }

    // Step 2: Create Revenue Audit project in revos_projects table
    const { error: projectError } = await supabase
      .from('revos_projects')
      .insert({
        id: projectId,
        name: `Revenue Audit - ${clientName}`,
        client: clientName,
        type: 'Audit',
        team: [],
        start_date: new Date().toISOString().split('T')[0],
        status: 'Active',
        revenue_target: annualRevenue,
        documents: [],
        agents: [],
        resources: [],
      })

    if (projectError) {
      console.error('Error creating project:', projectError)
      // Continue anyway - we'll still save the document
    }

    // Step 3: Insert document into revos_documents table, linked to the project
    const { error: insertError } = await supabase.from('revos_documents').insert({
      id: documentId,
      project_id: projectId, // Link to the created project
      title: documentTitle,
      description: formattedDescription,
      type: documentType,
      tags: ['client-intake', formId],
      file_url: '#', // No file for form submissions
      version: 1,
      status: 'Draft',
      summary: `Client submission from ${formId} form`,
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
      projectId,
      clientId,
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
