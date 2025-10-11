import type {
  Project,
  CreateProjectInput,
  ProjectHealth,
  ProjectStatus,
  ProjectUpdate,
  ProjectMilestone,
  ProjectStats,
} from "./types";
import { getClient } from "../clients/store";

const PROJECTS = new Map<string, Project>();
const PROJECT_UPDATES: ProjectUpdate[] = [];
const PROJECT_MILESTONES: ProjectMilestone[] = [];

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

  PROJECT_UPDATES.push(
    {
      id: "update-1",
      projectId: "proj-1",
      projectName: "RevenueOS Expansion",
      authorId: "user-1",
      authorName: "Jay Burgess",
      status: "On Track",
      summary: "Completed architecture workshops and aligned rollout timeline with ACME leadership.",
      riskLevel: "low",
      createdAt: "2025-10-09T09:00:00Z",
    },
    {
      id: "update-2",
      projectId: "proj-2",
      projectName: "Algorithm Implementation",
      authorId: "user-2",
      authorName: "Morgan Lee",
      status: "At Risk",
      summary: "Data integration dependency delayed; mitigation plan in review with data science.",
      riskLevel: "medium",
      createdAt: "2025-10-10T14:30:00Z",
    },
    {
      id: "update-3",
      projectId: "proj-4",
      projectName: "Churn Remediation",
      authorId: "user-3",
      authorName: "Riley Chen",
      status: "Critical",
      summary: "Security assessment uncovered additional scope; escalation with exec sponsor scheduled.",
      riskLevel: "high",
      createdAt: "2025-10-11T17:15:00Z",
    },
  );

  PROJECT_MILESTONES.push(
    {
      id: "milestone-1",
      projectId: "proj-1",
      projectName: "RevenueOS Expansion",
      ownerId: "user-1",
      ownerName: "Jay Burgess",
      title: "Rollout Playbook Finalized",
      status: "In Progress",
      confidence: 80,
      dueDate: "2025-10-20",
      description: "Finalize playbook with cross-functional teams",
      createdAt: "2025-10-01T12:00:00Z",
      updatedAt: "2025-10-08T12:00:00Z",
    },
    {
      id: "milestone-2",
      projectId: "proj-2",
      projectName: "Algorithm Implementation",
      ownerId: "user-2",
      ownerName: "Morgan Lee",
      title: "Data Integration Complete",
      status: "Planned",
      confidence: 55,
      dueDate: "2025-10-24",
      description: "Complete ingestion of historical pricing data",
      createdAt: "2025-09-28T12:00:00Z",
      updatedAt: "2025-10-05T12:00:00Z",
    },
    {
      id: "milestone-3",
      projectId: "proj-3",
      projectName: "Discovery & Data Intake",
      ownerId: "user-4",
      ownerName: "Taylor Kim",
      title: "Discovery Report Signed",
      status: "Complete",
      confidence: 100,
      dueDate: "2025-10-18",
      description: "Secure sign-off on discovery findings",
      createdAt: "2025-09-20T12:00:00Z",
      updatedAt: "2025-10-10T12:00:00Z",
    },
  );
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

export function getProjectStats(): ProjectStats {
  const projects = listProjects();
  const active = projects.filter((p) => p.status === "Active").length;
  const onTrack = projects.filter((p) => p.health === "green").length;
  const atRisk = projects.filter((p) => p.health === "red").length;
  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;
  const totalBudget = projects.reduce((sum, project) => sum + (project.budget ?? 0), 0);
  const totalSpent = projects.reduce((sum, project) => sum + (project.spent ?? 0), 0);
  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const upcomingMilestones = PROJECT_MILESTONES.filter((milestone) =>
    milestone.dueDate ? new Date(milestone.dueDate) >= new Date() : false,
  ).length;

  return {
    active,
    onTrack,
    atRisk,
    avgProgress,
    totalBudget,
    totalSpent,
    budgetUtilization,
    upcomingMilestones,
  };
}

export function listProjectUpdates(): ProjectUpdate[] {
  return [...PROJECT_UPDATES].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export function listProjectMilestones(): ProjectMilestone[] {
  return [...PROJECT_MILESTONES].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}
