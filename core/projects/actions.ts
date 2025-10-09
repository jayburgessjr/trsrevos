"use server";

import {
  listProjects,
  getProject,
  getProjectsByClient,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} from "./store";
import type { CreateProjectInput, Project } from "./types";

export async function actionListProjects(): Promise<Project[]> {
  return listProjects();
}

export async function actionGetProject(id: string): Promise<Project | null> {
  return getProject(id);
}

export async function actionGetProjectsByClient(clientId: string): Promise<Project[]> {
  return getProjectsByClient(clientId);
}

export async function actionCreateProject(input: CreateProjectInput): Promise<{ ok: boolean; project?: Project; error?: string }> {
  try {
    const project = createProject(input);
    return { ok: true, project };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create project" };
  }
}

export async function actionUpdateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "clientId" | "clientName" | "createdAt">>
): Promise<{ ok: boolean; project?: Project | null }> {
  const project = updateProject(id, updates);
  return { ok: true, project };
}

export async function actionDeleteProject(id: string): Promise<{ ok: boolean }> {
  const deleted = deleteProject(id);
  return { ok: deleted };
}

export async function actionGetProjectStats() {
  return getProjectStats();
}
