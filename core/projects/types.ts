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
