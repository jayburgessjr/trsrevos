"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import {
  PIPELINE_STAGE_ORDER,
  PIPELINE_STAGE_PROBABILITIES,
  type PipelineStage,
} from "./constants";

export type Opportunity = {
  id: string;
  client_id: string;
  name: string;
  amount: number;
  stage: PipelineStage;
  probability: number;
  close_date: string | null;
  owner_id: string;
  next_step: string | null;
  next_step_date: string | null;
  created_at: string;
  updated_at: string;
};

export type OpportunityNote = {
  id: string;
  opportunity_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type OpportunityWithNotes = Opportunity & {
  notes: OpportunityNote[];
  client: { name: string } | null;
  owner: { name: string } | null;
};

/**
 * Fetch all opportunities with their notes, clients, and owners
 */
export async function getOpportunities(): Promise<OpportunityWithNotes[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .select(`
      *,
      notes:opportunity_notes(*),
      client:clients(name),
      owner:users(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching opportunities:", error);
    return [];
  }

  return data as OpportunityWithNotes[];
}

/**
 * Create a new opportunity
 */
export async function createOpportunity(input: {
  client_id: string;
  name: string;
  amount: number;
  stage: PipelineStage;
  probability: number;
  close_date?: string;
  owner_id: string;
  next_step?: string;
}): Promise<{ success: boolean; opportunity?: Opportunity; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .insert({
      client_id: input.client_id,
      name: input.name,
      amount: input.amount,
      stage: input.stage,
      probability: input.probability,
      close_date: input.close_date || null,
      owner_id: input.owner_id,
      next_step: input.next_step || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating opportunity:", error);
    return { success: false, error: error.message };
  }

  // Emit analytics event
  await emitAnalyticsEvent({
    event_type: "opportunity_created",
    entity_type: "opportunity",
    entity_id: data.id,
    metadata: { stage: input.stage, amount: input.amount },
  });

  revalidatePath("/pipeline");
  return { success: true, opportunity: data };
}

/**
 * Update an opportunity
 */
export async function updateOpportunity(
  id: string,
  updates: Partial<Omit<Opportunity, "id" | "created_at" | "updated_at">>
): Promise<{ success: boolean; opportunity?: Opportunity; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating opportunity:", error);
    return { success: false, error: error.message };
  }

  // Emit analytics event
  await emitAnalyticsEvent({
    event_type: "opportunity_updated",
    entity_type: "opportunity",
    entity_id: id,
    metadata: updates,
  });

  revalidatePath("/pipeline");
  return { success: true, opportunity: data };
}

/**
 * Move an opportunity to a new stage
 */
export async function moveOpportunityStage(
  id: string,
  newStage: PipelineStage
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const supabase = await createClient();

  // Update probability based on stage
  const { error } = await supabase
    .from("opportunities")
    .update({
      stage: newStage,
      probability: PIPELINE_STAGE_PROBABILITIES[newStage] ?? 50,
    })
    .eq("id", id);

  if (error) {
    console.error("Error moving opportunity stage:", error);
    return { success: false, error: error.message };
  }

  // If moved to ClosedWon, automatically convert prospect to client
  let clientId: string | undefined;
  if (newStage === "ClosedWon") {
    const result = await convertProspectToClient(id);
    if (result.success) {
      clientId = result.clientId;
    }
  }

  // Emit analytics event
  await emitAnalyticsEvent({
    event_type: "opportunity_stage_changed",
    entity_type: "opportunity",
    entity_id: id,
    metadata: { new_stage: newStage, converted_to_client: !!clientId },
  });

  revalidatePath("/pipeline");
  return { success: true, clientId };
}

/**
 * Add a note to an opportunity
 */
export async function addOpportunityNote(
  opportunity_id: string,
  body: string,
  author_id: string
): Promise<{ success: boolean; note?: OpportunityNote; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("opportunity_notes")
    .insert({
      opportunity_id,
      body,
      author_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding opportunity note:", error);
    return { success: false, error: error.message };
  }

  // Emit analytics event
  await emitAnalyticsEvent({
    event_type: "opportunity_note_added",
    entity_type: "opportunity",
    entity_id: opportunity_id,
    metadata: { note_id: data.id },
  });

  revalidatePath("/pipeline");
  return { success: true, note: data };
}

/**
 * Get pipeline metrics
 */
export async function getPipelineMetrics(): Promise<{
  totalValue: number;
  totalWeighted: number;
  dealCount: number;
  avgDealSize: number;
  winRate: number;
  avgSalesCycle: number;
}> {
  const supabase = await createClient();

  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("amount, probability, stage, created_at, close_date");

  if (!opportunities || opportunities.length === 0) {
    return {
      totalValue: 0,
      totalWeighted: 0,
      dealCount: 0,
      avgDealSize: 0,
      winRate: 0,
      avgSalesCycle: 0,
    };
  }

  const totalValue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
  const totalWeighted = opportunities.reduce(
    (sum, opp) => sum + (opp.amount || 0) * ((opp.probability || 0) / 100),
    0
  );
  const dealCount = opportunities.length;
  const avgDealSize = totalValue / dealCount;

  const wonDeals = opportunities.filter((opp) => opp.stage === "ClosedWon");
  const lostDeals = opportunities.filter((opp) => opp.stage === "ClosedLost");
  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
      : 0;

  // Calculate avg sales cycle for closed deals
  const closedDeals = opportunities.filter(
    (opp) => opp.stage === "ClosedWon" || opp.stage === "ClosedLost"
  );
  const avgSalesCycle =
    closedDeals.length > 0
      ? closedDeals.reduce((sum, opp) => {
          if (!opp.close_date) return sum;
          const created = new Date(opp.created_at);
          const closed = new Date(opp.close_date);
          const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / closedDeals.length
      : 0;

  return {
    totalValue,
    totalWeighted,
    dealCount,
    avgDealSize,
    winRate,
    avgSalesCycle,
  };
}

/**
 * Create a new prospect (opportunity + placeholder client)
 */
export async function createProspect(input: {
  companyName: string;
  dealName: string;
  amount: number;
  expectedCloseDate?: string;
  owner_id: string;
}): Promise<{ success: boolean; opportunity?: Opportunity; error?: string }> {
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  // Use the authenticated user's ID instead of the passed owner_id for security
  const owner_id = user.id;

  // First, create a placeholder client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      name: input.companyName,
      phase: "Discovery",
      owner_id: owner_id,
      status: "active",
    })
    .select()
    .single();

  if (clientError) {
    console.error("Error creating client:", clientError);
    return { success: false, error: clientError.message };
  }

  // Then create the opportunity
  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .insert({
      client_id: client.id,
      name: input.dealName,
      amount: input.amount,
      stage: "New",
      probability: PIPELINE_STAGE_PROBABILITIES.New,
      close_date: input.expectedCloseDate || null,
      owner_id: owner_id,
      next_step: "Initial outreach",
    })
    .select()
    .single();

  if (oppError) {
    console.error("Error creating opportunity:", oppError);
    return { success: false, error: oppError.message };
  }

  await emitAnalyticsEvent({
    event_type: "prospect_created",
    entity_type: "opportunity",
    entity_id: opportunity.id,
    metadata: { company: input.companyName, amount: input.amount },
  });

  revalidatePath("/pipeline");
  revalidatePath("/clients");
  return { success: true, opportunity };
}

/**
 * Convert prospect to client when deal is won
 */
export async function convertProspectToClient(
  opportunityId: string
): Promise<{ success: boolean; clientId?: string; error?: string }> {
  const supabase = await createClient();

  // Get the opportunity with client info
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*, client:clients(*)")
    .eq("id", opportunityId)
    .single();

  if (!opportunity) {
    return { success: false, error: "Opportunity not found" };
  }

  // Update client status from prospect to active
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .update({
      status: "active",
      phase: "Data",
    })
    .eq("id", opportunity.client_id)
    .select()
    .single();

  if (clientError) {
    console.error("Error converting client:", clientError);
    return { success: false, error: clientError.message };
  }

  await emitAnalyticsEvent({
    event_type: "prospect_converted_to_client",
    entity_type: "client",
    entity_id: client.id,
    metadata: { opportunity_id: opportunityId },
  });

  revalidatePath("/pipeline");
  revalidatePath("/clients");
  revalidatePath(`/clients/${client.id}`);

  return { success: true, clientId: client.id };
}

/**
 * Delete an opportunity
 */
export async function deleteOpportunity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.from("opportunities").delete().eq("id", id);

  if (error) {
    console.error("Error deleting opportunity:", error);
    return { success: false, error: error.message };
  }

  await emitAnalyticsEvent({
    event_type: "opportunity_deleted",
    entity_type: "opportunity",
    entity_id: id,
    metadata: {},
  });

  revalidatePath("/pipeline");
  return { success: true };
}

/**
 * Get pipeline data grouped by stage for Kanban view
 */
export async function getPipelineByStage(): Promise<
  Partial<Record<PipelineStage, OpportunityWithNotes[]>>
> {
  const opportunities = await getOpportunities();

  const grouped: { [stage in PipelineStage]?: OpportunityWithNotes[] } = {};

  PIPELINE_STAGE_ORDER.forEach((stage) => {
    grouped[stage] = opportunities.filter((opp) => opp.stage === stage);
  });

  return grouped;
}

/**
 * Helper to emit analytics events
 */
async function emitAnalyticsEvent(event: {
  event_type: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("analytics_events").insert({
    event_type: event.event_type,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    user_id: user.id,
    metadata: event.metadata || {},
  });
}
