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

export type ProjectDeliveryUpdateApproval = {
  approverId: string;
  approverName: string;
  status: "Pending" | "Approved" | "Rejected";
  respondedAt?: string | null;
};

export type ProjectDeliveryUpdate = {
  id: string;
  projectId: string;
  projectName: string;
  authorId: string;
  authorName: string;
  status: string;
  blockers?: string | null;
  decisions?: string | null;
  reminderCadence?: "Daily" | "Weekly" | "Biweekly" | "Monthly" | null;
  nextReviewAt?: string | null;
  approvalState: "Pending" | "Approved" | "Escalated";
  approvals: ProjectDeliveryUpdateApproval[];
  createdAt: string;
};

export type CreateProjectDeliveryUpdateInput = {
  projectId: string;
  status: string;
  blockers?: string;
  decisions?: string;
  reminderCadence?: "Daily" | "Weekly" | "Biweekly" | "Monthly";
  nextReviewAt?: string;
  requiresApproval?: boolean;
  approverIds?: string[];
};

export type ProjectChangeOrder = {
  id: string;
  projectId: string;
  projectName: string;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  opportunityId?: string | null;
  opportunityName?: string | null;
  title: string;
  description?: string | null;
  value: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  submittedAt: string;
  approvedAt?: string | null;
  ownerId?: string | null;
  ownerName?: string | null;
};

export type CreateProjectChangeOrderInput = {
  projectId: string;
  title: string;
  description?: string;
  value: number;
  invoiceId?: string;
  opportunityId?: string;
  status?: "Draft" | "Submitted" | "Approved" | "Rejected";
};

export type ClientRoiNarrative = {
  id: string;
  clientId: string;
  clientName: string;
  periodStart: string;
  periodEnd: string;
  roiPercent: number;
  arrImpact: number;
  highlights: string[];
  surveyScore?: number | null;
  sentiment?: "Promoter" | "Passive" | "Detractor" | null;
  sharedWith: string[];
  sharedAt?: string | null;
  generatedAt: string;
};

export type CreateClientRoiNarrativeInput = {
  clientId: string;
  periodStart: string;
  periodEnd: string;
  roiPercent: number;
  arrImpact: number;
  highlights: string[];
  surveyScore?: number;
  sentiment?: "Promoter" | "Passive" | "Detractor";
  shareTargets?: string[];
};

export type ClientHealthSnapshot = {
  clientId: string;
  clientName: string;
  snapshotDate: string;
  health?: number | null;
  churnRisk?: number | null;
  trsScore?: number | null;
  notes?: string | null;
  sentiment: "Positive" | "Neutral" | "Caution";
};
