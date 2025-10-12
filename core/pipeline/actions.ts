"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";

export type Opportunity = {
  id: string;
  client_id: string;
  name: string;
  amount: number;
  stage: string;
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
  stage: string;
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
  newStage: string
): Promise<{ success: boolean; error?: string; clientId?: string }> {
  const supabase = await createClient();

  // Update probability based on stage
  const stageProbabilities: { [key: string]: number } = {
    Prospect: 10,
    Qualify: 25,
    Proposal: 50,
    Negotiation: 75,
    ClosedWon: 100,
    ClosedLost: 0,
  };

  const { error } = await supabase
    .from("opportunities")
    .update({
      stage: newStage,
      probability: stageProbabilities[newStage] || 50
    })
    .eq("id", id);

  if (error) {
    console.error("Error moving opportunity stage:", error);
    return { success: false, error: error.message };
  }

  // If moved to ClosedWon, invoke conversion routine in Supabase
  let clientId: string | undefined;
  if (newStage === "ClosedWon") {
    const { data: convertedId, error: convertError } = await supabase.rpc(
      "rpc_convert_won_to_client",
      {
        p_pipeline_id: null,
        p_opportunity_id: id,
      }
    );

    if (convertError) {
      console.error("Error converting opportunity to client:", convertError);
      return { success: false, error: convertError.message };
    }

    clientId = convertedId ?? undefined;

    if (clientId) {
      revalidatePath("/clients");
      revalidatePath(`/clients/${clientId}`);
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
  industry?: string;
  region?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  nextStep?: string;
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
      industry: input.industry || null,
      region: input.region || null,
      status: "active",
    })
    .select()
    .single();

  if (clientError) {
    console.error("Error creating client:", clientError);
    return { success: false, error: clientError.message };
  }

  // Create primary contact if provided
  if (input.primaryContact && (input.contactEmail || input.contactPhone)) {
    const { error: contactError } = await supabase
      .from("contacts")
      .insert({
        client_id: client.id,
        name: input.primaryContact,
        role: "Primary Contact",
        email: input.contactEmail || null,
        phone: input.contactPhone || null,
        power: "Decision",
      });

    if (contactError) {
      console.error("Error creating contact:", contactError);
      // Continue even if contact creation fails
    }
  }

  // Then create the opportunity
  const { data: opportunity, error: oppError } = await supabase
    .from("opportunities")
    .insert({
      client_id: client.id,
      name: input.dealName,
      amount: input.amount,
      stage: "Prospect",
      probability: 10,
      close_date: input.expectedCloseDate || null,
      owner_id: owner_id,
      next_step: input.nextStep || "Initial outreach",
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
export async function getPipelineByStage(): Promise<{
  [stage: string]: OpportunityWithNotes[];
}> {
  const opportunities = await getOpportunities();

  const stages = ["Prospect", "Qualify", "Proposal", "Negotiation", "ClosedWon", "ClosedLost"];
  const grouped: { [stage: string]: OpportunityWithNotes[] } = {};

  stages.forEach((stage) => {
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

export async function syncPipelineAnalytics() {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: "/login?next=/pipeline" });

  if (!organizationId) {
    return { ok: false, error: "missing-organization" } as const;
  }

  const { data: totals } = await supabase
    .from("opportunities")
    .select("stage")
    .eq("owner_id", user.id);

  const stageCounts = (totals ?? []).reduce<Record<string, number>>((acc, opp) => {
    const key = opp.stage ?? "Unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const { error } = await supabase.functions.invoke("analytics-events", {
    body: {
      organization_id: organizationId,
      user_id: user.id,
      event_key: "pipeline.sync.triggered",
      payload: stageCounts,
    },
  });

  if (error) {
    console.error("pipeline:analytics-sync-failed", error);
    return { ok: false, error: error.message } as const;
  }

  revalidatePath("/pipeline");
  return { ok: true, stages: stageCounts } as const;
}
