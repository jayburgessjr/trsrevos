"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

import {
  listProjects as listProjectsFallback,
  getProject as getProjectFallback,
  getProjectsByClient as getProjectsByClientFallback,
  createProject as createProjectFallback,
  updateProject as updateProjectFallback,
  deleteProject as deleteProjectFallback,
  getProjectStats as getProjectStatsFallback,
  listProjectUpdates as listProjectUpdatesFallback,
  listProjectMilestones as listProjectMilestonesFallback,
  listDeliveryUpdates as listDeliveryUpdatesFallback,
  createDeliveryUpdate as createDeliveryUpdateFallback,
  updateDeliveryApproval as updateDeliveryApprovalFallback,
  listChangeOrders as listChangeOrdersFallback,
  createChangeOrder as createChangeOrderFallback,
  updateChangeOrderStatus as updateChangeOrderStatusFallback,
  listClientRoiNarratives as listClientRoiNarrativesFallback,
  createClientRoiNarrative as createClientRoiNarrativeFallback,
  shareClientRoiNarrative as shareClientRoiNarrativeFallback,
} from "./store";
import type {
  CreateProjectInput,
  Project,
  ProjectMilestone,
  ProjectStats,
  ProjectUpdate,
  ProjectStatus,
  ProjectHealth,
  ProjectDeliveryUpdate,
  ProjectDeliveryUpdateApproval,
  CreateProjectDeliveryUpdateInput,
  ProjectChangeOrder,
  CreateProjectChangeOrderInput,
  ClientRoiNarrative,
  CreateClientRoiNarrativeInput,
} from "./types";
import type { RevOSPhase } from "@/core/clients/types";

const hasSupabaseCredentials = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type SingleOrMany<T> = T | T[] | null;

const unwrapSingle = <T>(value: SingleOrMany<T>): T | null =>
  Array.isArray(value) ? value[0] ?? null : value;

type ProjectRecord = {
  id: string;
  name: string;
  client_id: string;
  description: string | null;
  owner_id: string | null;
  status: ProjectStatus | null;
  phase: RevOSPhase | null;
  health: ProjectHealth | null;
  progress: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  budget: number | null;
  spent: number | null;
  deliverables: string[] | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  client: SingleOrMany<{ id: string; name: string | null; phase: RevOSPhase | null }>;
  owner: SingleOrMany<{ id: string; name: string | null }>;
};

const normalizeProject = (record: ProjectRecord): Project => {
  const defaultPhase: RevOSPhase = "Discovery";
  const fallbackDate = new Date().toISOString();
  const client = unwrapSingle(record.client);
  const owner = unwrapSingle(record.owner);

  return {
    id: record.id,
    name: record.name,
    clientId: record.client_id,
    clientName: client?.name ?? "Unknown Client",
    description: record.description ?? undefined,
    owner: owner?.name ?? "Unassigned",
    ownerId: owner?.id ?? undefined,
    status: (record.status ?? "Active") as ProjectStatus,
    phase: (record.phase ?? client?.phase ?? defaultPhase) as RevOSPhase,
    health: (record.health ?? "yellow") as ProjectHealth,
    progress: record.progress ?? 0,
    startDate: record.start_date ?? fallbackDate.split("T")[0],
    dueDate: record.due_date ?? undefined,
    completedDate: record.completed_date ?? undefined,
    budget: record.budget !== null ? Number(record.budget) : undefined,
    spent: record.spent !== null ? Number(record.spent) : undefined,
    deliverables: record.deliverables ?? undefined,
    notes: record.notes ?? undefined,
    createdAt: record.created_at ?? fallbackDate,
    updatedAt: record.updated_at ?? fallbackDate,
  };
};

type ProjectUpdateRecord = {
  id: string;
  project_id: string;
  status: string | null;
  summary: string | null;
  risk_level: string | null;
  created_at: string;
  project: SingleOrMany<{ id: string; name: string | null }>;
  author: SingleOrMany<{ id: string; name: string | null }>;
};

type ProjectMilestoneRecord = {
  id: string;
  project_id: string;
  owner_id: string | null;
  title: string;
  status: string;
  confidence: number | null;
  due_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  project: SingleOrMany<{ id: string; name: string | null }>;
  owner: SingleOrMany<{ id: string; name: string | null }>;
};

type ProjectDeliveryUpdateRecord = {
  id: string;
  project_id: string;
  author_id: string | null;
  status: string | null;
  blockers: string | null;
  decisions: string | null;
  reminder_cadence: string | null;
  next_review_at: string | null;
  approval_state: string | null;
  approver_chain: Array<{
    approver_id: string;
    approver_name: string | null;
    status: string | null;
    responded_at: string | null;
  }> | null;
  created_at: string;
  project: SingleOrMany<{ id: string; name: string | null }>;
  author: SingleOrMany<{ id: string; full_name: string | null; name?: string | null }>;
};

type ProjectChangeOrderRecord = {
  id: string;
  project_id: string;
  invoice_id: string | null;
  opportunity_id: string | null;
  title: string;
  description: string | null;
  value: number | null;
  status: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  owner_id: string | null;
  created_at: string;
  project: SingleOrMany<{ id: string; name: string | null }>;
  invoice: SingleOrMany<{ id: string; invoice_number: string | null }>;
  opportunity: SingleOrMany<{ id: string; name: string | null }>;
  owner: SingleOrMany<{ id: string; full_name: string | null; name?: string | null }>;
};

type ClientRoiNarrativeRecord = {
  id: string;
  client_id: string;
  period_start: string | null;
  period_end: string | null;
  roi_percent: number | null;
  arr_impact: number | null;
  highlights: string[] | null;
  survey_score: number | null;
  sentiment: string | null;
  shared_with: string[] | null;
  shared_at: string | null;
  generated_at: string | null;
  client: SingleOrMany<{ id: string; name: string | null }>;
};

const REMINDER_CADENCE_VALUES = new Set([
  "Daily",
  "Weekly",
  "Biweekly",
  "Monthly",
]);

const APPROVAL_STATE_VALUES = new Set(["Pending", "Approved", "Escalated"]);

const CHANGE_ORDER_STATUS_VALUES = new Set(["Draft", "Submitted", "Approved", "Rejected"]);

const ROI_SENTIMENT_VALUES = new Set(["Promoter", "Passive", "Detractor"]);

export async function actionListProjects(): Promise<Project[]> {
  if (!hasSupabaseCredentials()) {
    return listProjectsFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        name,
        client_id,
        description,
        owner_id,
        status,
        phase,
        health,
        progress,
        start_date,
        due_date,
        completed_date,
        budget,
        spent,
        deliverables,
        notes,
        created_at,
        updated_at,
        client:clients!projects_client_id_fkey(id, name, phase),
        owner:users!projects_owner_id_fkey(id, name)
      `,
    )
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching projects from Supabase", error);
    return listProjectsFallback();
  }

  return data.map((record) => normalizeProject(record as ProjectRecord));
}

export async function actionGetProject(id: string): Promise<Project | null> {
  if (!hasSupabaseCredentials()) {
    return getProjectFallback(id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        name,
        client_id,
        description,
        owner_id,
        status,
        phase,
        health,
        progress,
        start_date,
        due_date,
        completed_date,
        budget,
        spent,
        deliverables,
        notes,
        created_at,
        updated_at,
        client:clients!projects_client_id_fkey(id, name, phase),
        owner:users!projects_owner_id_fkey(id, name)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Error fetching project", error);
    return getProjectFallback(id);
  }

  return normalizeProject(data as ProjectRecord);
}

export async function actionGetProjectsByClient(clientId: string): Promise<Project[]> {
  if (!hasSupabaseCredentials()) {
    return getProjectsByClientFallback(clientId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id,
        name,
        client_id,
        description,
        owner_id,
        status,
        phase,
        health,
        progress,
        start_date,
        due_date,
        completed_date,
        budget,
        spent,
        deliverables,
        notes,
        created_at,
        updated_at,
        client:clients!projects_client_id_fkey(id, name, phase),
        owner:users!projects_owner_id_fkey(id, name)
      `,
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching projects by client", error);
    return getProjectsByClientFallback(clientId);
  }

  return data.map((record) => normalizeProject(record as ProjectRecord));
}

export async function actionCreateProject(
  input: CreateProjectInput,
): Promise<{ ok: boolean; project?: Project; error?: string }> {
  if (!hasSupabaseCredentials()) {
    try {
      const project = createProjectFallback(input);
      return { ok: true, project };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Failed to create project" };
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      client_id: input.clientId,
      description: input.description,
      owner_id: null,
      status: "Active",
      phase: input.phase,
      health: "green",
      progress: 0,
      due_date: input.dueDate,
      budget: input.budget,
      deliverables: input.deliverables,
    })
    .select(
      `
        id,
        name,
        client_id,
        description,
        owner_id,
        status,
        phase,
        health,
        progress,
        start_date,
        due_date,
        completed_date,
        budget,
        spent,
        deliverables,
        notes,
        created_at,
        updated_at,
        client:clients!projects_client_id_fkey(id, name, phase),
        owner:users!projects_owner_id_fkey(id, name)
      `,
    )
    .single();

  if (error || !data) {
    console.error("Error creating project", error);
    return { ok: false, error: error?.message ?? "Failed to create project" };
  }

  revalidatePath("/projects");
  revalidatePath(`/clients/${input.clientId}?tab=Projects`);

  return { ok: true, project: normalizeProject(data as ProjectRecord) };
}

export async function actionUpdateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "clientId" | "clientName" | "createdAt" | "owner">>,
): Promise<{ ok: boolean; project?: Project | null; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const project = updateProjectFallback(id, updates as any);
    return { ok: true, project };
  }

  const supabase = await createClient();
  const mappedUpdates: Record<string, unknown> = {
    status: updates.status,
    phase: updates.phase,
    health: updates.health,
    progress: updates.progress,
    due_date: updates.dueDate,
    completed_date: updates.completedDate,
    budget: updates.budget,
    spent: updates.spent,
    deliverables: updates.deliverables,
    notes: updates.notes,
  };

  const { data, error } = await supabase
    .from("projects")
    .update({
      ...mappedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(
      `
        id,
        name,
        client_id,
        description,
        owner_id,
        status,
        phase,
        health,
        progress,
        start_date,
        due_date,
        completed_date,
        budget,
        spent,
        deliverables,
        notes,
        created_at,
        updated_at,
        client:clients!projects_client_id_fkey(id, name, phase),
        owner:users!projects_owner_id_fkey(id, name)
      `,
    )
    .maybeSingle();

  if (error) {
    console.error("Error updating project", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/projects");
  if (data?.client_id) {
    revalidatePath(`/clients/${data.client_id}?tab=Projects`);
  }

  return { ok: true, project: data ? normalizeProject(data as ProjectRecord) : null };
}

export async function actionDeleteProject(id: string): Promise<{ ok: boolean }> {
  if (!hasSupabaseCredentials()) {
    const deleted = deleteProjectFallback(id);
    return { ok: deleted };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project", error);
    return { ok: false };
  }

  revalidatePath("/projects");
  return { ok: true };
}

export async function actionGetProjectStats(): Promise<ProjectStats> {
  if (!hasSupabaseCredentials()) {
    return getProjectStatsFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("status, health, progress, budget, spent");

  if (error || !data) {
    console.error("Error fetching project stats", error);
    return getProjectStatsFallback();
  }

  const active = data.filter((project) => project.status === "Active").length;
  const onTrack = data.filter((project) => project.health === "green").length;
  const atRisk = data.filter((project) => project.health === "red").length;
  const avgProgress =
    data.length > 0
      ? Math.round(data.reduce((sum, project) => sum + (project.progress ?? 0), 0) / data.length)
      : 0;
  const totalBudget = data.reduce((sum, project) => sum + Number(project.budget ?? 0), 0);
  const totalSpent = data.reduce((sum, project) => sum + Number(project.spent ?? 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const milestones = await actionListProjectMilestones();
  const now = new Date();
  const futureMilestones = milestones.filter((milestone) => {
    if (!milestone.dueDate) return false;
    const due = new Date(milestone.dueDate);
    return due >= now;
  }).length;

  return {
    active,
    onTrack,
    atRisk,
    avgProgress,
    totalBudget,
    totalSpent,
    budgetUtilization,
    upcomingMilestones: futureMilestones,
  };
}

export async function actionListProjectUpdates(): Promise<ProjectUpdate[]> {
  if (!hasSupabaseCredentials()) {
    return listProjectUpdatesFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_updates")
    .select(
      `
        id,
        project_id,
        status,
        summary,
        risk_level,
        created_at,
        project:projects!project_updates_project_id_fkey(id, name),
        author:users!project_updates_author_id_fkey(id, name)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(25);

  if (error || !data) {
    console.error("Error fetching project updates", error);
    return listProjectUpdatesFallback();
  }

  return (data as ProjectUpdateRecord[]).map((update) => {
    const project = unwrapSingle(update.project);
    const author = unwrapSingle(update.author);

    return {
      id: update.id,
      projectId: update.project_id,
      projectName: project?.name ?? "Unknown Project",
      authorId: author?.id ?? "",
      authorName: author?.name ?? "Unknown",
      status: update.status,
      summary: update.summary,
      riskLevel: update.risk_level,
      createdAt: update.created_at,
    };
  });
}

export async function actionListProjectMilestones(): Promise<ProjectMilestone[]> {
  if (!hasSupabaseCredentials()) {
    return listProjectMilestonesFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_milestones")
    .select(
      `
        id,
        project_id,
        owner_id,
        title,
        status,
        confidence,
        due_date,
        description,
        created_at,
        updated_at,
        project:projects!project_milestones_project_id_fkey(id, name),
        owner:users!project_milestones_owner_id_fkey(id, name)
      `,
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(25);

  if (error || !data) {
    console.error("Error fetching project milestones", error);
    return listProjectMilestonesFallback();
  }

  return (data as ProjectMilestoneRecord[]).map((milestone) => {
    const project = unwrapSingle(milestone.project);
    const owner = unwrapSingle(milestone.owner);

    return {
      id: milestone.id,
      projectId: milestone.project_id,
      projectName: project?.name ?? "Unknown Project",
      ownerId: owner?.id,
      ownerName: owner?.name ?? undefined,
      title: milestone.title,
      status: milestone.status as ProjectMilestone["status"],
      confidence: milestone.confidence,
      dueDate: milestone.due_date,
      description: milestone.description,
      createdAt: milestone.created_at,
      updatedAt: milestone.updated_at,
    };
  });
}

export async function actionSubmitProjectAgentPrompt({
  prompt,
  projectId,
  userId,
}: {
  prompt: string;
  projectId?: string;
  userId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabaseCredentials()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("analytics_events").insert({
    event_type: "project_agent_prompt",
    entity_type: projectId ? "project" : null,
    entity_id: projectId ?? null,
    metadata: {
      prompt,
    },
    user_id: userId ?? null,
  });

  if (error) {
    console.error("Error logging project agent prompt", error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

function normalizeReminderCadence(
  value: string | null,
): ProjectDeliveryUpdate["reminderCadence"] {
  if (!value) return null;
  return REMINDER_CADENCE_VALUES.has(value)
    ? (value as ProjectDeliveryUpdate["reminderCadence"])
    : null;
}

function normalizeApprovalState(
  value: string | null,
  approvals: number,
): ProjectDeliveryUpdate["approvalState"] {
  if (value && APPROVAL_STATE_VALUES.has(value)) {
    return value as ProjectDeliveryUpdate["approvalState"];
  }
  return approvals > 0 ? "Pending" : "Approved";
}

function normalizeChangeOrderStatus(
  value: string | null,
): ProjectChangeOrder["status"] {
  if (value && CHANGE_ORDER_STATUS_VALUES.has(value)) {
    return value as ProjectChangeOrder["status"];
  }
  return "Submitted";
}

function normalizeRoiSentiment(
  value: string | null,
): ClientRoiNarrative["sentiment"] {
  if (value && ROI_SENTIMENT_VALUES.has(value)) {
    return value as ClientRoiNarrative["sentiment"];
  }
  return null;
}

function normalizeDeliveryUpdate(record: ProjectDeliveryUpdateRecord): ProjectDeliveryUpdate {
  const project = unwrapSingle(record.project);
  const author = unwrapSingle(record.author);
  const approvals = Array.isArray(record.approver_chain)
    ? record.approver_chain.map((entry) => ({
        approverId: entry.approver_id,
        approverName: entry.approver_name ?? "Approver",
        status: (entry.status ?? "Pending") as ProjectDeliveryUpdateApproval["status"],
        respondedAt: entry.responded_at,
      }))
    : [];

  return {
    id: record.id,
    projectId: record.project_id,
    projectName: project?.name ?? "Unknown Project",
    authorId: author?.id ?? "",
    authorName: author?.full_name ?? author?.name ?? "Unknown",
    status: record.status ?? "On Track",
    blockers: record.blockers,
    decisions: record.decisions,
    reminderCadence: normalizeReminderCadence(record.reminder_cadence),
    nextReviewAt: record.next_review_at,
    approvalState: normalizeApprovalState(record.approval_state, approvals.length),
    approvals,
    createdAt: record.created_at,
  };
}

function normalizeChangeOrder(record: ProjectChangeOrderRecord): ProjectChangeOrder {
  const project = unwrapSingle(record.project);
  const invoice = unwrapSingle(record.invoice);
  const opportunity = unwrapSingle(record.opportunity);
  const owner = unwrapSingle(record.owner);

  return {
    id: record.id,
    projectId: record.project_id,
    projectName: project?.name ?? "Unknown Project",
    invoiceId: record.invoice_id,
    invoiceNumber: invoice?.invoice_number ?? record.invoice_id,
    opportunityId: record.opportunity_id,
    opportunityName: opportunity?.name ?? record.opportunity_id ?? null,
    title: record.title,
    description: record.description,
    value: Number(record.value ?? 0),
    status: normalizeChangeOrderStatus(record.status),
    submittedAt: record.submitted_at ?? record.created_at ?? new Date().toISOString(),
    approvedAt: record.approved_at,
    ownerId: record.owner_id ?? owner?.id ?? null,
    ownerName: owner?.full_name ?? owner?.name ?? null,
  };
}

function normalizeClientRoiNarrative(record: ClientRoiNarrativeRecord): ClientRoiNarrative {
  const client = unwrapSingle(record.client);
  const fallbackDate = new Date().toISOString().split("T")[0];

  return {
    id: record.id,
    clientId: record.client_id,
    clientName: client?.name ?? "Unknown Client",
    periodStart: record.period_start ?? fallbackDate,
    periodEnd: record.period_end ?? fallbackDate,
    roiPercent: Number(record.roi_percent ?? 0),
    arrImpact: Number(record.arr_impact ?? 0),
    highlights: record.highlights ?? [],
    surveyScore: record.survey_score,
    sentiment: normalizeRoiSentiment(record.sentiment),
    sharedWith: record.shared_with ?? [],
    sharedAt: record.shared_at,
    generatedAt: record.generated_at ?? new Date().toISOString(),
  };
}

type CreateDeliveryUpdatePayload = CreateProjectDeliveryUpdateInput & {
  authorId?: string;
};

export async function actionListDeliveryUpdates(): Promise<ProjectDeliveryUpdate[]> {
  if (!hasSupabaseCredentials()) {
    return listDeliveryUpdatesFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_delivery_updates")
    .select(
      `
        id,
        project_id,
        author_id,
        status,
        blockers,
        decisions,
        reminder_cadence,
        next_review_at,
        approval_state,
        approver_chain,
        created_at,
        project:projects!project_delivery_updates_project_id_fkey(id, name),
        author:users!project_delivery_updates_author_id_fkey(id, full_name)
      `,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("Error fetching delivery updates", error);
    return listDeliveryUpdatesFallback();
  }

  return (data as ProjectDeliveryUpdateRecord[]).map((record) => normalizeDeliveryUpdate(record));
}

export async function actionCreateDeliveryUpdate(
  input: CreateDeliveryUpdatePayload,
): Promise<{ ok: boolean; update?: ProjectDeliveryUpdate; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const update = createDeliveryUpdateFallback(input);
    return { ok: true, update };
  }

  const supabase = await createClient();
  const approvalState = input.requiresApproval && (input.approverIds?.length ?? 0) > 0 ? "Pending" : "Approved";
  const approverChain = (input.approverIds ?? []).map((approverId) => ({
    approver_id: approverId,
    approver_name: null,
    status: input.requiresApproval ? "Pending" : "Approved",
    responded_at: input.requiresApproval ? null : new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("project_delivery_updates")
    .insert({
      project_id: input.projectId,
      author_id: input.authorId ?? null,
      status: input.status,
      blockers: input.blockers ?? null,
      decisions: input.decisions ?? null,
      reminder_cadence: input.reminderCadence ?? null,
      next_review_at: input.nextReviewAt ?? null,
      approval_state: approvalState,
      approver_chain: approverChain,
    })
    .select(
      `
        id,
        project_id,
        author_id,
        status,
        blockers,
        decisions,
        reminder_cadence,
        next_review_at,
        approval_state,
        approver_chain,
        created_at,
        project:projects!project_delivery_updates_project_id_fkey(id, name),
        author:users!project_delivery_updates_author_id_fkey(id, full_name)
      `,
    )
    .maybeSingle();

  if (error || !data) {
    console.error("Error creating delivery update", error);
    const fallback = createDeliveryUpdateFallback(input);
    return { ok: false, update: fallback, error: error?.message };
  }

  revalidatePath("/projects");
  return { ok: true, update: normalizeDeliveryUpdate(data as ProjectDeliveryUpdateRecord) };
}

export async function actionUpdateDeliveryApproval(
  id: string,
  approverId: string,
  status: "Approved" | "Rejected",
): Promise<{ ok: boolean; update?: ProjectDeliveryUpdate; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const update = updateDeliveryApprovalFallback(id, approverId, status);
    return { ok: Boolean(update), update: update ?? undefined };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_delivery_updates")
    .select("approver_chain, approval_state")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error("Error loading delivery update approvals", error);
    return { ok: false, error: error?.message };
  }

  const chain = Array.isArray(data.approver_chain) ? [...data.approver_chain] : [];
  const updatedChain = chain.map((entry: any) => {
    if (entry.approver_id !== approverId) return entry;
    return {
      ...entry,
      status,
      responded_at: new Date().toISOString(),
    };
  });

  const approvalState = normalizeApprovalState(
    data.approval_state,
    updatedChain.length,
  );
  const resolvedState =
    updatedChain.some((entry: any) => entry.status === "Rejected")
      ? "Escalated"
      : updatedChain.every((entry: any) => entry.status === "Approved")
      ? "Approved"
      : approvalState;

  const { error: updateError } = await supabase
    .from("project_delivery_updates")
    .update({ approver_chain: updatedChain, approval_state: resolvedState })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating delivery approval", updateError);
    return { ok: false, error: updateError.message };
  }

  const { data: refreshed, error: refreshError } = await supabase
    .from("project_delivery_updates")
    .select(
      `
        id,
        project_id,
        author_id,
        status,
        blockers,
        decisions,
        reminder_cadence,
        next_review_at,
        approval_state,
        approver_chain,
        created_at,
        project:projects!project_delivery_updates_project_id_fkey(id, name),
        author:users!project_delivery_updates_author_id_fkey(id, full_name)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (refreshError || !refreshed) {
    console.error("Error refreshing delivery update", refreshError);
    return { ok: false, error: refreshError?.message };
  }

  revalidatePath("/projects");
  return { ok: true, update: normalizeDeliveryUpdate(refreshed as ProjectDeliveryUpdateRecord) };
}

type CreateChangeOrderPayload = CreateProjectChangeOrderInput & {
  ownerId?: string;
};

export async function actionListChangeOrders(): Promise<ProjectChangeOrder[]> {
  if (!hasSupabaseCredentials()) {
    return listChangeOrdersFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_change_orders")
    .select(
      `
        id,
        project_id,
        invoice_id,
        opportunity_id,
        title,
        description,
        value,
        status,
        submitted_at,
        approved_at,
        owner_id,
        project:projects!project_change_orders_project_id_fkey(id, name),
        invoice:invoices!project_change_orders_invoice_id_fkey(id, invoice_number),
        opportunity:opportunities!project_change_orders_opportunity_id_fkey(id, name),
        owner:users!project_change_orders_owner_id_fkey(id, full_name)
      `,
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error || !data) {
    console.error("Error fetching change orders", error);
    return listChangeOrdersFallback();
  }

  return (data as ProjectChangeOrderRecord[]).map((record) => normalizeChangeOrder(record));
}

export async function actionCreateChangeOrder(
  input: CreateChangeOrderPayload,
): Promise<{ ok: boolean; changeOrder?: ProjectChangeOrder; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const changeOrder = createChangeOrderFallback(input);
    return { ok: true, changeOrder };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_change_orders")
    .insert({
      project_id: input.projectId,
      invoice_id: input.invoiceId ?? null,
      opportunity_id: input.opportunityId ?? null,
      title: input.title,
      description: input.description ?? null,
      value: input.value,
      status: input.status ?? "Submitted",
      owner_id: input.ownerId ?? null,
      submitted_at: new Date().toISOString(),
    })
    .select(
      `
        id,
        project_id,
        invoice_id,
        opportunity_id,
        title,
        description,
        value,
        status,
        submitted_at,
        approved_at,
        owner_id,
        project:projects!project_change_orders_project_id_fkey(id, name),
        invoice:invoices!project_change_orders_invoice_id_fkey(id, invoice_number),
        opportunity:opportunities!project_change_orders_opportunity_id_fkey(id, name),
        owner:users!project_change_orders_owner_id_fkey(id, full_name)
      `,
    )
    .maybeSingle();

  if (error || !data) {
    console.error("Error creating change order", error);
    const fallback = createChangeOrderFallback(input);
    return { ok: false, changeOrder: fallback, error: error?.message };
  }

  revalidatePath("/projects");
  return { ok: true, changeOrder: normalizeChangeOrder(data as ProjectChangeOrderRecord) };
}

export async function actionUpdateChangeOrderStatus(
  id: string,
  status: ProjectChangeOrder["status"],
): Promise<{ ok: boolean; changeOrder?: ProjectChangeOrder; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const updated = updateChangeOrderStatusFallback(id, status);
    return { ok: Boolean(updated), changeOrder: updated ?? undefined };
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = { status };
  if (status === "Approved") {
    payload.approved_at = new Date().toISOString();
  }

  const { error } = await supabase.from("project_change_orders").update(payload).eq("id", id);

  if (error) {
    console.error("Error updating change order status", error);
    return { ok: false, error: error.message };
  }

  const { data, error: fetchError } = await supabase
    .from("project_change_orders")
    .select(
      `
        id,
        project_id,
        invoice_id,
        opportunity_id,
        title,
        description,
        value,
        status,
        submitted_at,
        approved_at,
        owner_id,
        project:projects!project_change_orders_project_id_fkey(id, name),
        invoice:invoices!project_change_orders_invoice_id_fkey(id, invoice_number),
        opportunity:opportunities!project_change_orders_opportunity_id_fkey(id, name),
        owner:users!project_change_orders_owner_id_fkey(id, full_name)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !data) {
    console.error("Error fetching updated change order", fetchError);
    return { ok: false, error: fetchError?.message };
  }

  revalidatePath("/projects");
  return { ok: true, changeOrder: normalizeChangeOrder(data as ProjectChangeOrderRecord) };
}

export async function actionListClientRoiNarratives(): Promise<ClientRoiNarrative[]> {
  if (!hasSupabaseCredentials()) {
    return listClientRoiNarrativesFallback();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_roi_reports")
    .select(
      `
        id,
        client_id,
        period_start,
        period_end,
        roi_percent,
        arr_impact,
        highlights,
        survey_score,
        sentiment,
        shared_with,
        shared_at,
        generated_at,
        client:clients!client_roi_reports_client_id_fkey(id, name)
      `,
    )
    .order("generated_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error("Error fetching ROI narratives", error);
    return listClientRoiNarrativesFallback();
  }

  return (data as ClientRoiNarrativeRecord[]).map((record) => normalizeClientRoiNarrative(record));
}

export async function actionCreateClientRoiNarrative(
  input: CreateClientRoiNarrativeInput,
): Promise<{ ok: boolean; narrative?: ClientRoiNarrative; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const narrative = createClientRoiNarrativeFallback(input);
    return { ok: true, narrative };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_roi_reports")
    .insert({
      client_id: input.clientId,
      period_start: input.periodStart,
      period_end: input.periodEnd,
      roi_percent: input.roiPercent,
      arr_impact: input.arrImpact,
      highlights: input.highlights,
      survey_score: input.surveyScore ?? null,
      sentiment: input.sentiment ?? null,
      shared_with: input.shareTargets ?? [],
      shared_at: (input.shareTargets?.length ?? 0) > 0 ? new Date().toISOString() : null,
      generated_at: new Date().toISOString(),
    })
    .select(
      `
        id,
        client_id,
        period_start,
        period_end,
        roi_percent,
        arr_impact,
        highlights,
        survey_score,
        sentiment,
        shared_with,
        shared_at,
        generated_at,
        client:clients!client_roi_reports_client_id_fkey(id, name)
      `,
    )
    .maybeSingle();

  if (error || !data) {
    console.error("Error creating ROI narrative", error);
    const fallback = createClientRoiNarrativeFallback(input);
    return { ok: false, narrative: fallback, error: error?.message };
  }

  revalidatePath("/projects");
  return { ok: true, narrative: normalizeClientRoiNarrative(data as ClientRoiNarrativeRecord) };
}

export async function actionShareClientRoiNarrative(
  id: string,
  shareTargets: string[],
): Promise<{ ok: boolean; narrative?: ClientRoiNarrative; error?: string }> {
  if (!hasSupabaseCredentials()) {
    const narrative = shareClientRoiNarrativeFallback(id, shareTargets);
    return { ok: Boolean(narrative), narrative: narrative ?? undefined };
  }

  const supabase = await createClient();
  const sharedAt = new Date().toISOString();
  const { error } = await supabase
    .from("client_roi_reports")
    .update({
      shared_with: shareTargets,
      shared_at: sharedAt,
    })
    .eq("id", id);

  if (error) {
    console.error("Error sharing ROI narrative", error);
    return { ok: false, error: error.message };
  }

  const { data, error: fetchError } = await supabase
    .from("client_roi_reports")
    .select(
      `
        id,
        client_id,
        period_start,
        period_end,
        roi_percent,
        arr_impact,
        highlights,
        survey_score,
        sentiment,
        shared_with,
        shared_at,
        generated_at,
        client:clients!client_roi_reports_client_id_fkey(id, name)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !data) {
    console.error("Error loading ROI narrative", fetchError);
    return { ok: false, error: fetchError?.message };
  }

  revalidatePath("/projects");
  return { ok: true, narrative: normalizeClientRoiNarrative(data as ClientRoiNarrativeRecord) };
}
