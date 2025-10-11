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
} from "./store";
import type {
  CreateProjectInput,
  Project,
  ProjectMilestone,
  ProjectStats,
  ProjectUpdate,
  ProjectStatus,
  ProjectHealth,
} from "./types";
import type { RevOSPhase } from "@/core/clients/types";

const hasSupabaseCredentials = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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
  client: { id: string; name: string | null; phase: RevOSPhase | null } | null;
  owner: { id: string; name: string | null } | null;
};

const normalizeProject = (record: ProjectRecord): Project => {
  const defaultPhase: RevOSPhase = "Discovery";
  const fallbackDate = new Date().toISOString();

  return {
    id: record.id,
    name: record.name,
    clientId: record.client_id,
    clientName: record.client?.name ?? "Unknown Client",
    description: record.description ?? undefined,
    owner: record.owner?.name ?? "Unassigned",
    ownerId: record.owner?.id ?? undefined,
    status: (record.status ?? "Active") as ProjectStatus,
    phase: (record.phase ?? record.client?.phase ?? defaultPhase) as RevOSPhase,
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

  return data.map((update) => ({
    id: update.id,
    projectId: update.project_id,
    projectName: update.project?.name ?? "Unknown Project",
    authorId: update.author?.id ?? "",
    authorName: update.author?.name ?? "Unknown",
    status: update.status,
    summary: update.summary,
    riskLevel: update.risk_level,
    createdAt: update.created_at,
  }));
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
    .order("due_date", { ascending: true, nullsLast: true })
    .limit(25);

  if (error || !data) {
    console.error("Error fetching project milestones", error);
    return listProjectMilestonesFallback();
  }

  return data.map((milestone) => ({
    id: milestone.id,
    projectId: milestone.project_id,
    projectName: milestone.project?.name ?? "Unknown Project",
    ownerId: milestone.owner?.id,
    ownerName: milestone.owner?.name ?? undefined,
    title: milestone.title,
    status: milestone.status as ProjectMilestone["status"],
    confidence: milestone.confidence,
    dueDate: milestone.due_date,
    description: milestone.description,
    createdAt: milestone.created_at,
    updatedAt: milestone.updated_at,
  }));
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
