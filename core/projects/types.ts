import type { RevOSPhase } from "../clients/types";

export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Cancelled";

export type ProjectHealth = "green" | "yellow" | "red";

export type Project = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  description?: string;
  owner: string;
  ownerId?: string;
  status: ProjectStatus;
  phase: RevOSPhase;
  health: ProjectHealth;
  progress: number;
  startDate: string;
  dueDate?: string;
  completedDate?: string;
  budget?: number;
  spent?: number;
  deliverables?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  clientId: string;
  description?: string;
  owner: string;
  phase: RevOSPhase;
  dueDate?: string;
  budget?: number;
  deliverables?: string[];
};

export type ProjectUpdate = {
  id: string;
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string;
  status?: string | null;
  summary?: string | null;
  riskLevel?: string | null;
  createdAt: string;
};

export type ProjectMilestone = {
  id: string;
  projectId: string;
  projectName: string;
  ownerId?: string | null;
  ownerName?: string | null;
  title: string;
  status: "Planned" | "In Progress" | "Complete" | "Blocked";
  confidence?: number | null;
  dueDate?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStats = {
  active: number;
  onTrack: number;
  atRisk: number;
  avgProgress: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  upcomingMilestones: number;
};
