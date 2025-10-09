import type { Project, CreateProjectInput, ProjectHealth, ProjectStatus } from "./types";
import { getClient } from "../clients/store";

const PROJECTS = new Map<string, Project>();

// Seed demo projects
(function seed() {
  const projects: Project[] = [
    {
      id: "proj-1",
      name: "RevenueOS Expansion",
      clientId: "acme",
      clientName: "ACME Industries",
      description: "Full RevenueOS rollout with pricing architecture and compounding playbooks",
      owner: "Jay Burgess",
      status: "Active",
      phase: "Architecture",
      health: "green",
      progress: 68,
      startDate: "2025-09-01",
      dueDate: "2025-11-12",
      budget: 120000,
      spent: 78000,
      deliverables: ["Pricing model", "Architecture blueprint", "Launch playbook"],
      notes: "On track for November launch",
      createdAt: "2025-09-01T00:00:00Z",
      updatedAt: "2025-10-09T00:00:00Z",
    },
    {
      id: "proj-2",
      name: "Algorithm Implementation",
      clientId: "globex",
      clientName: "Globex Retail",
      description: "Build custom pricing algorithms and offer personalization engine",
      owner: "Morgan Lee",
      status: "Active",
      phase: "Algorithm",
      health: "yellow",
      progress: 52,
      startDate: "2025-08-15",
      dueDate: "2025-11-06",
      budget: 95000,
      spent: 48000,
      deliverables: ["Pricing engine", "A/B test framework", "Offer rules"],
      notes: "Data integration delayed by 2 weeks",
      createdAt: "2025-08-15T00:00:00Z",
      updatedAt: "2025-10-09T00:00:00Z",
    },
    {
      id: "proj-3",
      name: "Discovery & Data Intake",
      clientId: "helio",
      clientName: "Helio Systems",
      description: "Revenue discovery workshops and data source integration",
      owner: "Taylor Kim",
      status: "Active",
      phase: "Discovery",
      health: "green",
      progress: 85,
      startDate: "2025-09-10",
      dueDate: "2025-10-20",
      budget: 45000,
      spent: 38000,
      deliverables: ["Discovery report", "Data mappings", "QRA strategy"],
      notes: "Architecture phase starts next week",
      createdAt: "2025-09-10T00:00:00Z",
      updatedAt: "2025-10-09T00:00:00Z",
    },
    {
      id: "proj-4",
      name: "Churn Remediation",
      clientId: "northwave",
      clientName: "Northwave Analytics",
      description: "Emergency project to address data trust issues and prevent churn",
      owner: "Riley Chen",
      status: "Active",
      phase: "Data",
      health: "red",
      progress: 34,
      startDate: "2025-09-25",
      dueDate: "2025-10-28",
      budget: 35000,
      spent: 22000,
      deliverables: ["Data trust audit", "Renewal playbook", "Success plan"],
      notes: "High risk - client relationship strained",
      createdAt: "2025-09-25T00:00:00Z",
      updatedAt: "2025-10-09T00:00:00Z",
    },
  ];

  projects.forEach((p) => PROJECTS.set(p.id, p));
})();

export function listProjects(): Project[] {
  return Array.from(PROJECTS.values());
}

export function getProject(id: string): Project | null {
  return PROJECTS.get(id) ?? null;
}

export function getProjectsByClient(clientId: string): Project[] {
  return listProjects().filter((p) => p.clientId === clientId);
}

export function createProject(input: CreateProjectInput): Project {
  const client = getClient(input.clientId);
  if (!client) {
    throw new Error(`Client not found: ${input.clientId}`);
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: `proj-${Date.now()}`,
    ...input,
    clientName: client.name,
    status: "Active",
    health: "green",
    progress: 0,
    startDate: now.split("T")[0],
    createdAt: now,
    updatedAt: now,
  };

  PROJECTS.set(project.id, project);
  return project;
}

export function updateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "clientId" | "clientName" | "createdAt">>
): Project | null {
  const project = PROJECTS.get(id);
  if (!project) return null;

  const updated = {
    ...project,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  PROJECTS.set(id, updated);
  return updated;
}

export function deleteProject(id: string): boolean {
  return PROJECTS.delete(id);
}

export function getProjectStats() {
  const projects = listProjects();
  const active = projects.filter((p) => p.status === "Active").length;
  const onTrack = projects.filter((p) => p.health === "green").length;
  const atRisk = projects.filter((p) => p.health === "red").length;
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;

  return { active, onTrack, atRisk, avgProgress };
}
