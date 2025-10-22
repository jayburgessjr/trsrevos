import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// This API endpoint is PUBLIC - no auth required
// It creates a document in Supabase from form submissions

function getSupabaseConfig() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

  return { supabaseUrl, supabaseServiceKey }
}

export async function POST(request: NextRequest) {
  console.log('📝 Form submission API called')
  try {
    const body = await request.json()
    const { formId, data } = body

    console.log('📋 Form ID:', formId)

    if (!formId || !data || typeof data !== 'object' || data === null || Array.isArray(data)) {
      console.error('❌ Missing formId or data')
      return NextResponse.json({ error: 'Missing formId or data' }, { status: 400 })
    }

    console.log('📊 Form data keys:', Object.keys(data as Record<string, unknown>))

    // Validate environment variables
    const { supabaseUrl, supabaseServiceKey } = getSupabaseConfig()

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

    // Step 1: Check if client already exists, otherwise create new
    console.log('Step 1: Checking if client exists:', clientName)

    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('id, name')
      .ilike('name', clientName)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Error checking for existing client:', JSON.stringify(checkError, null, 2))
    }

    let client = existingClient

    if (existingClient) {
      console.log('✅ Found existing client:', existingClient.id)
    } else {
      console.log('Creating new client with data:', {
        name: clientName,
        industry: data.industry || null,
        monthly_recurring_revenue: Number(data.monthlyRevenue) || 0,
        primary_goal: data.goals || null,
        phase: 'Discovery',
        status: 'active',
      })

      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: clientName,
          industry: data.industry || null,
          monthly_recurring_revenue: Number(data.monthlyRevenue) || 0,
          primary_goal: data.goals || null,
          phase: 'Discovery',
          status: 'active',
          user_id: null,  // Public form submission - no user associated
          owner_id: null, // Public form submission - no owner yet
        })
        .select('id, name')
        .single()

      if (clientError) {
        console.error('❌ Error creating client:', JSON.stringify(clientError, null, 2))
        // Continue anyway - we'll create an unlinked project
      } else {
        console.log('✅ Client created successfully:', newClient)
        client = newClient
      }
    }

    // Step 2: Create Revenue Audit project in revos_projects table
    const annualRevenue = (Number(data.monthlyRevenue) || 0) * 12
    console.log('Step 2: Creating project with data:', {
      id: projectId,
      name: `Revenue Audit - ${clientName}`,
      client: clientName,
      type: 'Audit',
      revenue_target: annualRevenue,
    })

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
      console.error('❌ Error creating project:', JSON.stringify(projectError, null, 2))
      // Continue anyway - we'll still save the document
    } else {
      console.log('✅ Project created successfully')
    }

    // Step 3: Insert document into revos_documents table, linked to the project
    console.log('Step 3: Creating document with data:', {
      id: documentId,
      project_id: projectId,
      title: documentTitle,
      type: documentType,
      status: 'Draft',
    })

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
      console.error('❌ Error inserting document:', JSON.stringify(insertError, null, 2))
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    console.log('✅ Document created successfully')

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      documentId,
      projectId,
      clientId: client?.id,
    })
  } catch (error) {
    console.error('Form submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
