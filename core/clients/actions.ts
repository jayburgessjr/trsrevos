"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { RevOSPhase, Client, ClientDeliverable, ClientFinancialSnapshot } from "./types";

const hasSupabaseCredentials = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Fetch all clients with their relationships
 */
export async function actionListClients() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      owner:users!clients_owner_id_fkey(name),
      opportunities:opportunities!opportunities_client_id_fkey(id, name, amount, stage, probability),
      contacts:contacts!contacts_client_id_fkey(id, name, role, email, power)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single client by ID
 */
export async function actionGetClient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      owner:users!clients_owner_id_fkey(name),
      opportunities:opportunities!opportunities_client_id_fkey(*),
      contacts:contacts!contacts_client_id_fkey(*),
      discovery:discovery_questions(*),
      data:data_sources(*),
      kanban:kanban_items(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching client:", error);
    return null;
  }

  return data;
}

/**
 * Update client phase
 */
export async function actionSetPhase(id: string, phase: RevOSPhase) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .update({ phase, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client phase:", error);
    return null;
  }

  // Log analytics event
  await supabase.from("analytics_events").insert({
    event_type: "client_phase_changed",
    entity_type: "client",
    entity_id: id,
    metadata: { new_phase: phase },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);

  return data;
}

/**
 * Save discovery questions
 */
export async function actionSaveDiscovery(id: string, qa: any[]) {
  const supabase = await createClient();

  // Delete existing questions
  await supabase.from("discovery_questions").delete().eq("client_id", id);

  // Insert new questions
  const { error } = await supabase.from("discovery_questions").insert(
    qa.map((q) => ({
      client_id: id,
      question: q.question,
      answer: q.answer,
      lever: q.lever,
      expected_impact: q.expectedImpact,
    }))
  );

  if (error) {
    console.error("Error saving discovery:", error);
    return null;
  }

  await supabase.from("analytics_events").insert({
    event_type: "discovery_saved",
    entity_type: "client",
    entity_id: id,
    metadata: { count: qa.length },
  });

  revalidatePath(`/clients/${id}`);
  return await actionGetClient(id);
}

/**
 * Save data sources
 */
export async function actionSaveData(id: string, data: any[]) {
  const supabase = await createClient();

  // Delete existing data sources
  await supabase.from("data_sources").delete().eq("client_id", id);

  // Insert new data sources
  const { error } = await supabase.from("data_sources").insert(
    data.map((d) => ({
      client_id: id,
      name: d.name,
      category: d.category,
      status: d.status,
      notes: d.notes,
    }))
  );

  if (error) {
    console.error("Error saving data sources:", error);
    return null;
  }

  await supabase.from("analytics_events").insert({
    event_type: "data_saved",
    entity_type: "client",
    entity_id: id,
    metadata: { available: data.length },
  });

  revalidatePath(`/clients/${id}`);
  return await actionGetClient(id);
}

/**
 * Save kanban items
 */
export async function actionSaveKanban(id: string, cards: any[]) {
  const supabase = await createClient();

  // Delete existing kanban items
  await supabase.from("kanban_items").delete().eq("client_id", id);

  // Insert new kanban items
  const { error } = await supabase.from("kanban_items").insert(
    cards.map((card) => ({
      client_id: id,
      title: card.title,
      status: card.status,
      owner: card.owner,
      due_date: card.dueDate,
    }))
  );

  if (error) {
    console.error("Error saving kanban:", error);
    return null;
  }

  await supabase.from("analytics_events").insert({
    event_type: "kanban_saved",
    entity_type: "client",
    entity_id: id,
    metadata: { count: cards.length },
  });

  revalidatePath(`/clients/${id}`);
  return await actionGetClient(id);
}

/**
 * Create or update a client
 */
export async function actionUpsertClient(c: Client) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .upsert({
      ...c,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error upserting client:", error);
    return null;
  }

  revalidatePath("/clients");
  return data;
}

/**
 * Get client statistics
 */
export async function getClientStats(): Promise<{
  avgHealth: number;
  atRisk: number;
  expansions: number;
  churned: number;
}> {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select("health, churn_risk, is_expansion, status");

  if (error) {
    console.error("Error fetching client stats:", error);
    return { avgHealth: 0, atRisk: 0, expansions: 0, churned: 0 };
  }

  if (!clients || clients.length === 0) {
    return { avgHealth: 0, atRisk: 0, expansions: 0, churned: 0 };
  }

  const total = clients.length;
  const avgHealth = Math.round(
    clients.reduce((sum, client) => sum + (client.health ?? 0), 0) / total
  );
  const atRisk = clients.filter((client) => (client.churn_risk ?? 0) >= 15).length;
  const expansions = clients.filter((client) => client.is_expansion).length;
  const churned = clients.filter((client) => client.status === "churned").length;

  return { avgHealth, atRisk, expansions, churned };
}

export async function actionListDeliverables(clientId: string): Promise<ClientDeliverable[]> {
  if (!hasSupabaseCredentials()) {
    return [];
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching deliverables:", error);
    return [];
  }

  return data ?? [];
}

export async function actionCreateDeliverable(input: {
  clientId: string;
  name: string;
  type?: string;
  link?: string;
  status?: string;
}): Promise<ClientDeliverable | null> {
  if (!hasSupabaseCredentials()) {
    return {
      id: crypto.randomUUID(),
      client_id: input.clientId,
      name: input.name,
      type: input.type?.trim() || null,
      link: input.link?.trim() || null,
      status: input.status?.trim() || null,
      updated_at: new Date().toISOString(),
    };
  }
  const supabase = await createClient();

  const payload = {
    client_id: input.clientId,
    name: input.name,
    type: input.type?.trim() || null,
    link: input.link?.trim() || null,
    status: input.status?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("deliverables")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating deliverable:", error);
    return null;
  }

  revalidatePath(`/clients/${input.clientId}`);
  return data;
}

export async function actionListClientFinancials(clientId: string): Promise<ClientFinancialSnapshot[]> {
  if (!hasSupabaseCredentials()) {
    return [];
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_financials")
    .select("*")
    .eq("client_id", clientId)
    .order("last_updated", { ascending: true });

  if (error) {
    console.error("Error fetching client financials:", error);
    return [];
  }

  return data ?? [];
}

export async function actionRecordClientFinancials(input: {
  clientId: string;
  equityStake?: number | null;
  monthlyRevenue?: number | null;
  projectedAnnualRevenue?: number | null;
  lastUpdated?: string | null;
}): Promise<ClientFinancialSnapshot | null> {
  if (!hasSupabaseCredentials()) {
    return {
      id: crypto.randomUUID(),
      client_id: input.clientId,
      equity_stake: input.equityStake ?? null,
      monthly_revenue: input.monthlyRevenue ?? null,
      projected_annual_revenue: input.projectedAnnualRevenue ?? null,
      last_updated: input.lastUpdated ?? new Date().toISOString(),
    };
  }
  const supabase = await createClient();

  const payload = {
    client_id: input.clientId,
    equity_stake: input.equityStake ?? null,
    monthly_revenue: input.monthlyRevenue ?? null,
    projected_annual_revenue: input.projectedAnnualRevenue ?? null,
    last_updated: input.lastUpdated ?? new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("client_financials")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Error recording client financials:", error);
    return null;
  }

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath(`/finance`);
  return data;
}

/**
 * Trigger HubSpot sync
 */
export async function triggerHubSpotSync(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/hubspot/sync`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Sync failed" };
    }

    revalidatePath("/clients");
    revalidatePath("/pipeline");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error triggering HubSpot sync:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
