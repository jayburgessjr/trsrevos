"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logAnalyticsEvent } from "@/core/analytics/actions"
import type {
  Partner,
  PartnerContact,
  PartnerOpportunity,
  PartnerInitiative,
  PartnerInteraction,
  PartnerResource,
  PartnerStage,
  PartnerModel,
} from "./types"

const PARTNERS_PATH = "/partners"

// ============================================================================
// Partners CRUD
// ============================================================================

export async function getPartners(): Promise<Partner[]> {
  try {
    const supabase = await createClient()
    const { data: partnersData, error: partnersError } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false })

    if (partnersError) {
      console.error("Error fetching partners:", partnersError)
      return []
    }

    // Fetch all related data for each partner
    const partners = await Promise.all(
      (partnersData || []).map(async (partner: any) => {
        const [contacts, opportunities, initiatives, interactions, resources] =
          await Promise.all([
            getPartnerContacts(partner.id),
            getPartnerOpportunities(partner.id),
            getPartnerInitiatives(partner.id),
            getPartnerInteractions(partner.id),
            getPartnerResources(partner.id),
          ])

        return {
          id: partner.id,
          name: partner.name,
          organizationType: partner.organization_type || "",
          focus: partner.focus || "",
          city: partner.city || "",
          state: partner.state || "",
          stage: partner.stage as PartnerStage,
          owner: partner.owner || "",
          model: partner.model as PartnerModel,
          potentialValue: partner.potential_value || 0,
          warmIntroductions: partner.warm_introductions || 0,
          mutualClients: partner.mutual_clients || 0,
          readinessScore: partner.readiness_score || 0,
          notes: partner.notes || [],
          website: partner.website || undefined,
          lastInteraction: partner.last_interaction || "",
          ecosystemFit: partner.ecosystem_fit || "Emerging",
          strengths: partner.strengths || [],
          needs: partner.needs || [],
          contacts,
          opportunities,
          initiatives,
          interactions,
          resources,
        } as Partner
      })
    )

    return partners
  } catch (error) {
    console.error("Error in getPartners:", error)
    return []
  }
}

export async function getPartner(id: string): Promise<Partner | null> {
  try {
    const supabase = await createClient()
    const { data: partner, error } = await supabase
      .from("partners")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !partner) {
      console.error("Error fetching partner:", error)
      return null
    }

    // Fetch all related data
    const [contacts, opportunities, initiatives, interactions, resources] =
      await Promise.all([
        getPartnerContacts(partner.id),
        getPartnerOpportunities(partner.id),
        getPartnerInitiatives(partner.id),
        getPartnerInteractions(partner.id),
        getPartnerResources(partner.id),
      ])

    return {
      id: partner.id,
      name: partner.name,
      organizationType: partner.organization_type || "",
      focus: partner.focus || "",
      city: partner.city || "",
      state: partner.state || "",
      stage: partner.stage as PartnerStage,
      owner: partner.owner || "",
      model: partner.model as PartnerModel,
      potentialValue: partner.potential_value || 0,
      warmIntroductions: partner.warm_introductions || 0,
      mutualClients: partner.mutual_clients || 0,
      readinessScore: partner.readiness_score || 0,
      notes: partner.notes || [],
      website: partner.website || undefined,
      lastInteraction: partner.last_interaction || "",
      ecosystemFit: partner.ecosystem_fit || "Emerging",
      strengths: partner.strengths || [],
      needs: partner.needs || [],
      contacts,
      opportunities,
      initiatives,
      interactions,
      resources,
    } as Partner
  } catch (error) {
    console.error("Error in getPartner:", error)
    return null
  }
}

export async function createPartner(input: {
  id?: string
  name: string
  organizationType?: string
  focus?: string
  city?: string
  state?: string
  stage: PartnerStage
  owner?: string
  model: PartnerModel
  potentialValue?: number
  warmIntroductions?: number
  mutualClients?: number
  readinessScore?: number
  notes?: string[]
  website?: string
  ecosystemFit?: "Anchor" | "Strategic" | "Emerging"
  strengths?: string[]
  needs?: string[]
}): Promise<Partner> {
  const supabase = await createClient()

  const partnerData = {
    id: input.id,
    name: input.name,
    organization_type: input.organizationType || "",
    focus: input.focus || "",
    city: input.city || "",
    state: input.state || "",
    stage: input.stage,
    owner: input.owner || "",
    model: input.model,
    potential_value: input.potentialValue || 0,
    warm_introductions: input.warmIntroductions || 0,
    mutual_clients: input.mutualClients || 0,
    readiness_score: input.readinessScore || 0,
    notes: input.notes || [],
    website: input.website || null,
    last_interaction: new Date().toISOString().split("T")[0],
    ecosystem_fit: input.ecosystemFit || "Emerging",
    strengths: input.strengths || [],
    needs: input.needs || [],
  }

  const { data, error } = await supabase
    .from("partners")
    .insert(partnerData)
    .select()
    .single()

  if (error) {
    console.error("Error creating partner:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.partner.created",
    payload: { partnerId: data.id, name: input.name },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    name: data.name,
    organizationType: data.organization_type || "",
    focus: data.focus || "",
    city: data.city || "",
    state: data.state || "",
    stage: data.stage as PartnerStage,
    owner: data.owner || "",
    model: data.model as PartnerModel,
    potentialValue: data.potential_value || 0,
    warmIntroductions: data.warm_introductions || 0,
    mutualClients: data.mutual_clients || 0,
    readinessScore: data.readiness_score || 0,
    notes: data.notes || [],
    website: data.website || undefined,
    lastInteraction: data.last_interaction || "",
    ecosystemFit: data.ecosystem_fit || "Emerging",
    strengths: data.strengths || [],
    needs: data.needs || [],
    contacts: [],
    opportunities: [],
    initiatives: [],
    interactions: [],
    resources: [],
  } as Partner
}

export async function updatePartner(
  id: string,
  updates: Partial<{
    name: string
    organizationType: string
    focus: string
    city: string
    state: string
    stage: PartnerStage
    owner: string
    model: PartnerModel
    potentialValue: number
    warmIntroductions: number
    mutualClients: number
    readinessScore: number
    notes: string[]
    website: string
    ecosystemFit: "Anchor" | "Strategic" | "Emerging"
    strengths: string[]
    needs: string[]
  }>
): Promise<Partner | null> {
  const supabase = await createClient()

  const updateData: Record<string, any> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.organizationType !== undefined)
    updateData.organization_type = updates.organizationType
  if (updates.focus !== undefined) updateData.focus = updates.focus
  if (updates.city !== undefined) updateData.city = updates.city
  if (updates.state !== undefined) updateData.state = updates.state
  if (updates.stage !== undefined) updateData.stage = updates.stage
  if (updates.owner !== undefined) updateData.owner = updates.owner
  if (updates.model !== undefined) updateData.model = updates.model
  if (updates.potentialValue !== undefined)
    updateData.potential_value = updates.potentialValue
  if (updates.warmIntroductions !== undefined)
    updateData.warm_introductions = updates.warmIntroductions
  if (updates.mutualClients !== undefined)
    updateData.mutual_clients = updates.mutualClients
  if (updates.readinessScore !== undefined)
    updateData.readiness_score = updates.readinessScore
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.website !== undefined) updateData.website = updates.website
  if (updates.ecosystemFit !== undefined)
    updateData.ecosystem_fit = updates.ecosystemFit
  if (updates.strengths !== undefined) updateData.strengths = updates.strengths
  if (updates.needs !== undefined) updateData.needs = updates.needs

  const { data, error } = await supabase
    .from("partners")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.partner.updated",
    payload: { partnerId: id },
  })

  revalidatePath(PARTNERS_PATH)

  return getPartner(id)
}

export async function updatePartnerStage(
  id: string,
  stage: PartnerStage
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("partners")
    .update({ stage, last_interaction: new Date().toISOString().split("T")[0] })
    .eq("id", id)

  if (error) {
    console.error("Error updating partner stage:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.stage.updated",
    payload: { partnerId: id, stage },
  })

  revalidatePath(PARTNERS_PATH)
}

// ============================================================================
// Partner Contacts
// ============================================================================

export async function getPartnerContacts(
  partnerId: string
): Promise<PartnerContact[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("partner_contacts")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching partner contacts:", error)
      return []
    }

    return (data || []).map((contact: any) => ({
      id: contact.id,
      name: contact.name,
      role: contact.role || "",
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      notes: contact.notes || undefined,
    }))
  } catch (error) {
    console.error("Error in getPartnerContacts:", error)
    return []
  }
}

export async function createPartnerContact(input: {
  partnerId: string
  name: string
  role: string
  email?: string
  phone?: string
  notes?: string
}): Promise<PartnerContact> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_contacts")
    .insert({
      partner_id: input.partnerId,
      name: input.name,
      role: input.role,
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating partner contact:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.contact.created",
    payload: { partnerId: input.partnerId, contactId: data.id },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    name: data.name,
    role: data.role || "",
    email: data.email || undefined,
    phone: data.phone || undefined,
    notes: data.notes || undefined,
  }
}

export async function updatePartnerContact(
  contactId: string,
  updates: Partial<{
    name: string
    role: string
    email: string
    phone: string
    notes: string
  }>
): Promise<PartnerContact | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_contacts")
    .update(updates)
    .eq("id", contactId)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner contact:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.contact.updated",
    payload: { contactId },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    name: data.name,
    role: data.role || "",
    email: data.email || undefined,
    phone: data.phone || undefined,
    notes: data.notes || undefined,
  }
}

// ============================================================================
// Partner Opportunities
// ============================================================================

export async function getPartnerOpportunities(
  partnerId: string
): Promise<PartnerOpportunity[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("partner_opportunities")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching partner opportunities:", error)
      return []
    }

    return (data || []).map((opp: any) => ({
      id: opp.id,
      name: opp.name,
      type: opp.type as "Referral" | "Joint Project" | "Event",
      value: opp.value || 0,
      status: opp.status as
        | "Sourcing"
        | "Introduced"
        | "In Motion"
        | "Won"
        | "Stalled",
      targetClient: opp.target_client || "",
      expectedClose: opp.expected_close || "",
    }))
  } catch (error) {
    console.error("Error in getPartnerOpportunities:", error)
    return []
  }
}

export async function createPartnerOpportunity(input: {
  partnerId: string
  name: string
  type: "Referral" | "Joint Project" | "Event"
  value: number
  status: "Sourcing" | "Introduced" | "In Motion" | "Won" | "Stalled"
  targetClient: string
  expectedClose: string
}): Promise<PartnerOpportunity> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_opportunities")
    .insert({
      partner_id: input.partnerId,
      name: input.name,
      type: input.type,
      value: input.value,
      status: input.status,
      target_client: input.targetClient,
      expected_close: input.expectedClose,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating partner opportunity:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.opportunity.created",
    payload: { partnerId: input.partnerId, opportunityId: data.id },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    name: data.name,
    type: data.type as "Referral" | "Joint Project" | "Event",
    value: data.value || 0,
    status: data.status as
      | "Sourcing"
      | "Introduced"
      | "In Motion"
      | "Won"
      | "Stalled",
    targetClient: data.target_client || "",
    expectedClose: data.expected_close || "",
  }
}

export async function updatePartnerOpportunity(
  opportunityId: string,
  updates: Partial<{
    name: string
    type: "Referral" | "Joint Project" | "Event"
    value: number
    status: "Sourcing" | "Introduced" | "In Motion" | "Won" | "Stalled"
    targetClient: string
    expectedClose: string
  }>
): Promise<PartnerOpportunity | null> {
  const supabase = await createClient()

  const updateData: Record<string, any> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.value !== undefined) updateData.value = updates.value
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.targetClient !== undefined)
    updateData.target_client = updates.targetClient
  if (updates.expectedClose !== undefined)
    updateData.expected_close = updates.expectedClose

  const { data, error } = await supabase
    .from("partner_opportunities")
    .update(updateData)
    .eq("id", opportunityId)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner opportunity:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.opportunity.updated",
    payload: { opportunityId },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    name: data.name,
    type: data.type as "Referral" | "Joint Project" | "Event",
    value: data.value || 0,
    status: data.status as
      | "Sourcing"
      | "Introduced"
      | "In Motion"
      | "Won"
      | "Stalled",
    targetClient: data.target_client || "",
    expectedClose: data.expected_close || "",
  }
}

// ============================================================================
// Partner Initiatives
// ============================================================================

export async function getPartnerInitiatives(
  partnerId: string
): Promise<PartnerInitiative[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("partner_initiatives")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching partner initiatives:", error)
      return []
    }

    return (data || []).map((init: any) => ({
      id: init.id,
      title: init.title,
      owner: init.owner || "",
      status: init.status as "Planning" | "Active" | "Completed",
      dueDate: init.due_date || "",
      description: init.description || "",
    }))
  } catch (error) {
    console.error("Error in getPartnerInitiatives:", error)
    return []
  }
}

export async function createPartnerInitiative(input: {
  partnerId: string
  title: string
  owner: string
  status: "Planning" | "Active" | "Completed"
  dueDate: string
  description: string
}): Promise<PartnerInitiative> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_initiatives")
    .insert({
      partner_id: input.partnerId,
      title: input.title,
      owner: input.owner,
      status: input.status,
      due_date: input.dueDate,
      description: input.description,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating partner initiative:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.initiative.created",
    payload: { partnerId: input.partnerId, initiativeId: data.id },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    title: data.title,
    owner: data.owner || "",
    status: data.status as "Planning" | "Active" | "Completed",
    dueDate: data.due_date || "",
    description: data.description || "",
  }
}

export async function updatePartnerInitiative(
  initiativeId: string,
  updates: Partial<{
    title: string
    owner: string
    status: "Planning" | "Active" | "Completed"
    dueDate: string
    description: string
  }>
): Promise<PartnerInitiative | null> {
  const supabase = await createClient()

  const updateData: Record<string, any> = {}
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.owner !== undefined) updateData.owner = updates.owner
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
  if (updates.description !== undefined)
    updateData.description = updates.description

  const { data, error } = await supabase
    .from("partner_initiatives")
    .update(updateData)
    .eq("id", initiativeId)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner initiative:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.initiative.updated",
    payload: { initiativeId },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    title: data.title,
    owner: data.owner || "",
    status: data.status as "Planning" | "Active" | "Completed",
    dueDate: data.due_date || "",
    description: data.description || "",
  }
}

// ============================================================================
// Partner Interactions
// ============================================================================

export async function getPartnerInteractions(
  partnerId: string
): Promise<PartnerInteraction[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("partner_interactions")
      .select("*")
      .eq("partner_id", partnerId)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching partner interactions:", error)
      return []
    }

    return (data || []).map((interaction: any) => ({
      id: interaction.id,
      date: interaction.date || "",
      type: interaction.type as "Call" | "Meeting" | "Intro" | "Event" | "Email",
      summary: interaction.summary || "",
      nextStep: interaction.next_step || undefined,
      sentiment: interaction.sentiment as "Positive" | "Neutral" | "Caution",
    }))
  } catch (error) {
    console.error("Error in getPartnerInteractions:", error)
    return []
  }
}

export async function createPartnerInteraction(input: {
  partnerId: string
  date: string
  type: "Call" | "Meeting" | "Intro" | "Event" | "Email"
  summary: string
  nextStep?: string
  sentiment: "Positive" | "Neutral" | "Caution"
}): Promise<PartnerInteraction> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_interactions")
    .insert({
      partner_id: input.partnerId,
      date: input.date,
      type: input.type,
      summary: input.summary,
      next_step: input.nextStep || null,
      sentiment: input.sentiment,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating partner interaction:", error)
    throw error
  }

  // Update partner's last interaction date
  await updatePartner(input.partnerId, {})

  await logAnalyticsEvent({
    eventKey: "partners.interaction.created",
    payload: { partnerId: input.partnerId, interactionId: data.id },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    date: data.date || "",
    type: data.type as "Call" | "Meeting" | "Intro" | "Event" | "Email",
    summary: data.summary || "",
    nextStep: data.next_step || undefined,
    sentiment: data.sentiment as "Positive" | "Neutral" | "Caution",
  }
}

export async function updatePartnerInteraction(
  interactionId: string,
  updates: Partial<{
    date: string
    type: "Call" | "Meeting" | "Intro" | "Event" | "Email"
    summary: string
    nextStep: string
    sentiment: "Positive" | "Neutral" | "Caution"
  }>
): Promise<PartnerInteraction | null> {
  const supabase = await createClient()

  const updateData: Record<string, any> = {}
  if (updates.date !== undefined) updateData.date = updates.date
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.summary !== undefined) updateData.summary = updates.summary
  if (updates.nextStep !== undefined) updateData.next_step = updates.nextStep
  if (updates.sentiment !== undefined) updateData.sentiment = updates.sentiment

  const { data, error } = await supabase
    .from("partner_interactions")
    .update(updateData)
    .eq("id", interactionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner interaction:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.interaction.updated",
    payload: { interactionId },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    date: data.date || "",
    type: data.type as "Call" | "Meeting" | "Intro" | "Event" | "Email",
    summary: data.summary || "",
    nextStep: data.next_step || undefined,
    sentiment: data.sentiment as "Positive" | "Neutral" | "Caution",
  }
}

// ============================================================================
// Partner Resources
// ============================================================================

export async function getPartnerResources(
  partnerId: string
): Promise<PartnerResource[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("partner_resources")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching partner resources:", error)
      return []
    }

    return (data || []).map((resource: any) => ({
      id: resource.id,
      title: resource.title,
      type: resource.type as
        | "Deck"
        | "One-Pager"
        | "Case Study"
        | "Checklist"
        | "Playbook",
      url: resource.url || "",
      notes: resource.notes || undefined,
    }))
  } catch (error) {
    console.error("Error in getPartnerResources:", error)
    return []
  }
}

export async function createPartnerResource(input: {
  partnerId: string
  title: string
  type: "Deck" | "One-Pager" | "Case Study" | "Checklist" | "Playbook"
  url: string
  notes?: string
}): Promise<PartnerResource> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_resources")
    .insert({
      partner_id: input.partnerId,
      title: input.title,
      type: input.type,
      url: input.url,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating partner resource:", error)
    throw error
  }

  await logAnalyticsEvent({
    eventKey: "partners.resource.created",
    payload: { partnerId: input.partnerId, resourceId: data.id },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type as
      | "Deck"
      | "One-Pager"
      | "Case Study"
      | "Checklist"
      | "Playbook",
    url: data.url || "",
    notes: data.notes || undefined,
  }
}

export async function updatePartnerResource(
  resourceId: string,
  updates: Partial<{
    title: string
    type: "Deck" | "One-Pager" | "Case Study" | "Checklist" | "Playbook"
    url: string
    notes: string
  }>
): Promise<PartnerResource | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("partner_resources")
    .update(updates)
    .eq("id", resourceId)
    .select()
    .single()

  if (error) {
    console.error("Error updating partner resource:", error)
    return null
  }

  await logAnalyticsEvent({
    eventKey: "partners.resource.updated",
    payload: { resourceId },
  })

  revalidatePath(PARTNERS_PATH)

  return {
    id: data.id,
    title: data.title,
    type: data.type as
      | "Deck"
      | "One-Pager"
      | "Case Study"
      | "Checklist"
      | "Playbook",
    url: data.url || "",
    notes: data.notes || undefined,
  }
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export async function getPartnerMetrics(): Promise<{
  totalPartners: number
  activePartners: number
  totalOpportunityValue: number
  wonOpportunityValue: number
  activeInitiatives: number
  completedInitiatives: number
  totalInteractions: number
  recentInteractions: number
  partnersByStage: Record<PartnerStage, number>
  partnersByModel: Record<PartnerModel, number>
  avgReadinessScore: number
}> {
  try {
    const supabase = await createClient()

    const [
      { data: partners },
      { data: opportunities },
      { data: initiatives },
      { data: interactions },
    ] = await Promise.all([
      supabase.from("partners").select("stage, model, readiness_score"),
      supabase.from("partner_opportunities").select("status, value"),
      supabase.from("partner_initiatives").select("status"),
      supabase.from("partner_interactions").select("date"),
    ])

    const totalPartners = partners?.length || 0
    const activePartners =
      partners?.filter((p) => p.stage !== "Dormant").length || 0

    const totalOpportunityValue =
      opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0
    const wonOpportunityValue =
      opportunities
        ?.filter((opp) => opp.status === "Won")
        .reduce((sum, opp) => sum + (opp.value || 0), 0) || 0

    const activeInitiatives =
      initiatives?.filter((init) => init.status === "Active").length || 0
    const completedInitiatives =
      initiatives?.filter((init) => init.status === "Completed").length || 0

    const totalInteractions = interactions?.length || 0
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentInteractions =
      interactions?.filter(
        (int) => new Date(int.date) >= thirtyDaysAgo
      ).length || 0

    const partnersByStage: Record<PartnerStage, number> = {
      "Initial Outreach": 0,
      Discovery: 0,
      "Pilot Collaboration": 0,
      Contracting: 0,
      Launch: 0,
      Dormant: 0,
    }
    partners?.forEach((p) => {
      partnersByStage[p.stage as PartnerStage]++
    })

    const partnersByModel: Record<PartnerModel, number> = {
      "Referral Exchange": 0,
      "Co-Marketing": 0,
      "Co-Sell": 0,
      Community: 0,
    }
    partners?.forEach((p) => {
      partnersByModel[p.model as PartnerModel]++
    })

    const avgReadinessScore =
      partners && partners.length > 0
        ? partners.reduce((sum, p) => sum + (p.readiness_score || 0), 0) /
          partners.length
        : 0

    return {
      totalPartners,
      activePartners,
      totalOpportunityValue,
      wonOpportunityValue,
      activeInitiatives,
      completedInitiatives,
      totalInteractions,
      recentInteractions,
      partnersByStage,
      partnersByModel,
      avgReadinessScore,
    }
  } catch (error) {
    console.error("Error in getPartnerMetrics:", error)
    return {
      totalPartners: 0,
      activePartners: 0,
      totalOpportunityValue: 0,
      wonOpportunityValue: 0,
      activeInitiatives: 0,
      completedInitiatives: 0,
      totalInteractions: 0,
      recentInteractions: 0,
      partnersByStage: {
        "Initial Outreach": 0,
        Discovery: 0,
        "Pilot Collaboration": 0,
        Contracting: 0,
        Launch: 0,
        Dormant: 0,
      },
      partnersByModel: {
        "Referral Exchange": 0,
        "Co-Marketing": 0,
        "Co-Sell": 0,
        Community: 0,
      },
      avgReadinessScore: 0,
    }
  }
}
