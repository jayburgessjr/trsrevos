"use server";

import { revalidatePath } from "next/cache";

import { logAnalyticsEvent } from "@/core/analytics/actions";
import { computeStrategies, StrategyVariant } from "@/core/qra/engine";
import { requireAuth } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import {
  RevOSPhase,
  Client,
  ClientDeliverable,
  ClientFinancialSnapshot,
  ActivityItem,
  DiscoveryResponse,
  DataRequirement,
  ClientStrategy,
  QRARun,
} from "./types";

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
  await logAnalyticsEvent({
    eventKey: "client.phase.changed",
    payload: { clientId: id, newPhase: phase },
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

  await logAnalyticsEvent({
    eventKey: "client.discovery.saved",
    payload: { clientId: id, count: qa.length },
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

  await logAnalyticsEvent({
    eventKey: "client.data.saved",
    payload: { clientId: id, available: data.length },
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

  await logAnalyticsEvent({
    eventKey: "client.kanban.saved",
    payload: { clientId: id, count: cards.length },
  });

  revalidatePath(`/clients/${id}`);
  return await actionGetClient(id);
}

type SyncClientHealthResult =
  | { ok: true; processed?: number }
  | { ok: false; error: string };

export async function syncClientHealth(): Promise<SyncClientHealthResult> {
  const { supabase, user, organizationId } = await requireAuth({ redirectTo: "/login?next=/clients" });

  if (!organizationId) {
    return { ok: false, error: "missing-organization" };
  }

  const { data, error } = await supabase.functions.invoke("client-health-sync", {
    body: { organization_id: organizationId, triggered_by: user.id },
  });

  if (error) {
    console.error("clients:health-sync-failed", error);
    return { ok: false, error: error.message };
  }

  await logAnalyticsEvent({
    eventKey: "client.health.sync.triggered",
    payload: { processed: (data as any)?.processed ?? 0 },
  });

  revalidatePath("/clients");
  const processed = (data as Record<string, unknown> | null | undefined)?.processed;
  return {
    ok: true,
    processed: typeof processed === "number" ? processed : undefined,
  };
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

export async function saveDiscovery(
  formType: "gap_selling" | "clarity_gap" | "revenue_research",
  clientId: string,
  answers: Record<string, unknown>,
  options?: { completed?: boolean }
): Promise<DiscoveryResponse | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${clientId}` });
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    client_id: clientId,
    form_type: formType,
    answers,
    updated_at: now,
  };

  if (options?.completed) {
    payload.completed_at = now;
  }

  const { data, error } = await supabase
    .from("discovery_responses")
    .upsert(payload, { onConflict: "client_id,form_type" })
    .select("*")
    .single();

  if (error) {
    console.error("clients:save-discovery", error);
    return null;
  }

  await logAnalyticsEvent({
    eventKey: "client.discovery.saved",
    payload: { clientId, formType, userId: user.id },
  });

  revalidatePath(`/clients/${clientId}`);
  return data as DiscoveryResponse;
}

export async function setDataRequirement(
  clientId: string,
  sourceName: string,
  status: "needed" | "in_progress" | "collected",
  notes?: string
): Promise<DataRequirement | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${clientId}` });
  const now = new Date().toISOString();
  const payload = {
    client_id: clientId,
    source_name: sourceName,
    status,
    notes: notes ?? null,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("data_requirements")
    .upsert(payload, { onConflict: "client_id,source_name" })
    .select("*")
    .single();

  if (error) {
    console.error("clients:set-data-requirement", error);
    return null;
  }

  await logAnalyticsEvent({
    eventKey: "client.data.updated",
    payload: { clientId, sourceName, status, userId: user.id },
  });

  revalidatePath(`/clients/${clientId}`);
  return data as DataRequirement;
}

export async function runQRA(
  clientId: string,
  inputs: Record<string, unknown>
): Promise<{ strategies: StrategyVariant[]; run: QRARun | null }> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${clientId}` });
  const strategies = computeStrategies(inputs);

  const insertPayload = {
    client_id: clientId,
    inputs,
    outputs: { strategies },
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from("qra_runs")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    console.error("clients:run-qra", error);
    return { strategies, run: null };
  }

  await logAnalyticsEvent({
    eventKey: "client.qra.run",
    payload: { clientId, strategies: strategies.length, userId: user.id },
  });

  revalidatePath(`/clients/${clientId}`);
  return { strategies, run: data as QRARun };
}

export async function selectStrategy(
  clientId: string,
  key: string,
  body: Record<string, unknown>,
  title?: string
): Promise<ClientStrategy | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${clientId}` });
  const now = new Date().toISOString();

  const archiveError = await supabase
    .from("client_strategies")
    .update({ status: "archived" })
    .eq("client_id", clientId)
    .eq("status", "active");

  if (archiveError.error) {
    console.error("clients:select-strategy.archive", archiveError.error);
  }

  const payload = {
    client_id: clientId,
    key,
    title: title ?? (typeof body.title === "string" ? (body.title as string) : key),
    body,
    status: "active" as const,
    created_at: now,
  };

  const { data, error } = await supabase
    .from("client_strategies")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("clients:select-strategy.insert", error);
    return null;
  }

  const latestRun = await supabase
    .from("qra_runs")
    .update({ selected_strategy_key: key })
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .select("id")
    .maybeSingle();

  if (latestRun.error) {
    console.error("clients:select-strategy.qra-update", latestRun.error);
  }

  await logAnalyticsEvent({
    eventKey: "client.strategy.selected",
    payload: { clientId, key, userId: user.id },
  });

  revalidatePath(`/clients/${clientId}`);
  return data as ClientStrategy;
}

export async function linkDeliverable(input: {
  clientId: string;
  title: string;
  type: string;
  url?: string | null;
  contentId?: string | null;
  share_expires_at?: string | null;
}): Promise<ClientDeliverable | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${input.clientId}` });

  const payload = {
    client_id: input.clientId,
    title: input.title,
    type: input.type,
    url: input.url ?? null,
    content_id: input.contentId ?? null,
    share_expires_at: input.share_expires_at ?? null,
  };

  const { data, error } = await supabase
    .from("client_deliverables")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("clients:link-deliverable", error);
    return null;
  }

  await logAnalyticsEvent({
    eventKey: "client.deliverable.linked",
    payload: { clientId: input.clientId, deliverableId: data.id, userId: user.id },
  });

  revalidatePath(`/clients/${input.clientId}`);
  return data as ClientDeliverable;
}

export async function unlinkDeliverable(id: string): Promise<boolean> {
  const { supabase } = await requireAuth();

  const { error } = await supabase.from("client_deliverables").delete().eq("id", id);

  if (error) {
    console.error("clients:unlink-deliverable", error);
    return false;
  }

  return true;
}

export async function saveFinanceTerms(input: {
  clientId: string;
  arrangement_type: string | null;
  equity_stake_pct?: number | null;
  projection_mrr?: number | null;
}): Promise<Record<string, unknown> | null> {
  const { supabase, user } = await requireAuth({ redirectTo: `/clients/${input.clientId}` });
  const now = new Date().toISOString();

  const payload = {
    client_id: input.clientId,
    arrangement_type: input.arrangement_type,
    equity_stake_pct: input.equity_stake_pct ?? null,
    projection_mrr: input.projection_mrr ?? null,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("finance")
    .upsert(payload, { onConflict: "client_id" })
    .select("*")
    .single();

  if (error) {
    console.error("clients:save-finance-terms", error);
    return null;
  }

  await logAnalyticsEvent({
    eventKey: "client.finance.updated",
    payload: { clientId: input.clientId, userId: user.id },
  });

  revalidatePath(`/clients/${input.clientId}`);
  return data as Record<string, unknown>;
}

export async function getActivity(clientId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const [analytics, emails, calendar, notes] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("id, event_type, created_at, metadata")
      .eq("entity_type", "client")
      .eq("entity_id", clientId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("google_emails")
      .select("id, subject, sender, received_at")
      .eq("client_id", clientId)
      .order("received_at", { ascending: false })
      .limit(50),
    supabase
      .from("google_calendar_events")
      .select("id, summary, start_time, end_time")
      .eq("client_id", clientId)
      .order("start_time", { ascending: false })
      .limit(50),
    supabase
      .from("opportunity_notes")
      .select("id, body, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const items: ActivityItem[] = [];

  if (!analytics.error && analytics.data) {
    items.push(
      ...analytics.data.map((event) => ({
        id: `analytics-${event.id}`,
        type: "event" as const,
        occurred_at: event.created_at,
        title: event.event_type,
        details: event.metadata ?? {},
      }))
    );
  }

  if (!emails.error && emails.data) {
    items.push(
      ...emails.data.map((email) => ({
        id: `email-${email.id}`,
        type: "email" as const,
        occurred_at: email.received_at,
        title: email.subject ?? "Email",
        details: { sender: email.sender },
      }))
    );
  }

  if (!calendar.error && calendar.data) {
    items.push(
      ...calendar.data.map((event) => ({
        id: `meeting-${event.id}`,
        type: "meeting" as const,
        occurred_at: event.start_time,
        title: event.summary ?? "Meeting",
        details: { end_time: event.end_time },
      }))
    );
  }

  if (!notes.error && notes.data) {
    items.push(
      ...notes.data.map((note) => ({
        id: `note-${note.id}`,
        type: "note" as const,
        occurred_at: note.created_at,
        title: "Opportunity Note",
        details: { body: note.body },
      }))
    );
  }

  return items
    .filter((item) => Boolean(item.occurred_at))
    .sort((a, b) => {
      const aDate = a.occurred_at ? new Date(a.occurred_at).getTime() : 0;
      const bDate = b.occurred_at ? new Date(b.occurred_at).getTime() : 0;
      return bDate - aDate;
    });
}
