import type {
  Project,
  CreateProjectInput,
  ProjectHealth,
  ProjectStatus,
  ProjectUpdate,
  ProjectMilestone,
  ProjectStats,
  ProjectDeliveryUpdate,
  ProjectDeliveryUpdateApproval,
  ProjectChangeOrder,
  ClientRoiNarrative,
} from "./types";
import { getClient } from "../clients/store";

const PROJECTS = new Map<string, Project>();
const PROJECT_UPDATES: ProjectUpdate[] = [];
const PROJECT_MILESTONES: ProjectMilestone[] = [];
const PROJECT_DELIVERY_UPDATES: ProjectDeliveryUpdate[] = [];
const PROJECT_CHANGE_ORDERS: ProjectChangeOrder[] = [];
const CLIENT_ROI_NARRATIVES: ClientRoiNarrative[] = [];

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

  const approvalPending: ProjectDeliveryUpdateApproval = {
    approverId: "approver-ops-1",
    approverName: "Dana Lee",
    status: "Pending",
    respondedAt: null,
  };

  PROJECT_DELIVERY_UPDATES.push(
    {
      id: "delivery-update-1",
      projectId: "proj-1",
      projectName: "RevenueOS Expansion",
      authorId: "user-ops",
      authorName: "Operations Desk",
      status: "On Track",
      blockers: "Security questionnaire awaiting sign-off",
      decisions: "Phased rollout approved for ACME manufacturing sites",
      reminderCadence: "Weekly",
      nextReviewAt: "2025-10-18",
      approvalState: "Pending",
      approvals: [approvalPending],
      createdAt: "2025-10-11T15:00:00Z",
    },
    {
      id: "delivery-update-2",
      projectId: "proj-4",
      projectName: "Churn Remediation",
      authorId: "user-success",
      authorName: "Client Success",
      status: "At Risk",
      blockers: "Awaiting cleansed product usage export from client",
      decisions: "Escalate to executive sponsor with remediation playbook",
      reminderCadence: "Daily",
      nextReviewAt: "2025-10-13",
      approvalState: "Escalated",
      approvals: [
        {
          approverId: "approver-ops-2",
          approverName: "Jamie Cole",
          status: "Rejected",
          respondedAt: "2025-10-11T18:30:00Z",
        },
      ],
      createdAt: "2025-10-11T17:45:00Z",
    },
  );

  PROJECT_CHANGE_ORDERS.push(
    {
      id: "change-order-1",
      projectId: "proj-2",
      projectName: "Algorithm Implementation",
      invoiceId: "inv-993",
      invoiceNumber: "inv-993",
      opportunityId: "opp-22",
      opportunityName: "RevOS renewal",
      title: "Historical data ingestion extension",
      description: "Add 12 months of legacy POS feeds to analytics scope",
      value: 14500,
      status: "Submitted",
      submittedAt: "2025-10-08T17:00:00Z",
      approvedAt: null,
      ownerId: "user-2",
      ownerName: "Morgan Lee",
    },
    {
      id: "change-order-2",
      projectId: "proj-1",
      projectName: "RevenueOS Expansion",
      invoiceId: "inv-882",
      invoiceNumber: "inv-882",
      opportunityId: "opp-1",
      opportunityName: "RevOS rollout",
      title: "Additional enablement workshops",
      description: "Expand onsite enablement to operations + finance cohorts",
      value: 6200,
      status: "Approved",
      submittedAt: "2025-09-28T12:00:00Z",
      approvedAt: "2025-10-02T16:15:00Z",
      ownerId: "user-1",
      ownerName: "Jay Burgess",
    },
  );

  CLIENT_ROI_NARRATIVES.push(
    {
      id: "roi-narrative-1",
      clientId: "acme",
      clientName: "ACME Industries",
      periodStart: "2025-07-01",
      periodEnd: "2025-09-30",
      roiPercent: 138,
      arrImpact: 48000,
      highlights: [
        "Expanded RevOS pricing framework to 4 product lines",
        "Collections cycle shortened by 12 days via dunning automations",
      ],
      surveyScore: 9,
      sentiment: "Promoter",
      sharedWith: ["dana@acme.com", "sam@acme.com"],
      sharedAt: "2025-10-05T14:00:00Z",
      generatedAt: "2025-10-05T12:00:00Z",
    },
    {
      id: "roi-narrative-2",
      clientId: "globex",
      clientName: "Globex Retail",
      periodStart: "2025-07-01",
      periodEnd: "2025-09-30",
      roiPercent: 92,
      arrImpact: 31200,
      highlights: [
        "Personalization engine lifted conversion by 3.4%",
        "Renewal risk mitigated with executive sponsorship playbooks",
      ],
      surveyScore: 7,
      sentiment: "Passive",
      sharedWith: [],
      sharedAt: null,
      generatedAt: "2025-10-06T09:00:00Z",
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

type CreateDeliveryUpdateFallbackInput = {
  projectId: string;
  status: string;
  blockers?: string;
  decisions?: string;
  reminderCadence?: "Daily" | "Weekly" | "Biweekly" | "Monthly";
  nextReviewAt?: string;
  requiresApproval?: boolean;
  approverIds?: string[];
};

export function listDeliveryUpdates(): ProjectDeliveryUpdate[] {
  return [...PROJECT_DELIVERY_UPDATES].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
}

export function createDeliveryUpdate(
  input: CreateDeliveryUpdateFallbackInput,
): ProjectDeliveryUpdate {
  const project = PROJECTS.get(input.projectId);
  const now = new Date().toISOString();
  const approvals: ProjectDeliveryUpdateApproval[] = (input.approverIds ?? []).map(
    (approverId, index) => ({
      approverId,
      approverName: `Approver ${index + 1}`,
      status: input.requiresApproval ? "Pending" : "Approved",
      respondedAt: input.requiresApproval ? null : now,
    }),
  );

  const approvalState: ProjectDeliveryUpdate["approvalState"] = input.requiresApproval
    ? "Pending"
    : "Approved";

  const update: ProjectDeliveryUpdate = {
    id: `delivery-update-${Date.now()}`,
    projectId: input.projectId,
    projectName: project?.name ?? "Unknown Project",
    authorId: "user-ops",
    authorName: "Operations Desk",
    status: input.status,
    blockers: input.blockers,
    decisions: input.decisions,
    reminderCadence: input.reminderCadence ?? null,
    nextReviewAt: input.nextReviewAt ?? null,
    approvalState,
    approvals,
    createdAt: now,
  };

  PROJECT_DELIVERY_UPDATES.unshift(update);
  return update;
}

export function updateDeliveryApproval(
  id: string,
  approverId: string,
  status: "Approved" | "Rejected",
): ProjectDeliveryUpdate | null {
  const index = PROJECT_DELIVERY_UPDATES.findIndex((update) => update.id === id);
  if (index === -1) return null;

  const current = PROJECT_DELIVERY_UPDATES[index];
  const approvals = current.approvals.map((approval) => {
    if (approval.approverId !== approverId) {
      return approval;
    }
    return {
      ...approval,
      status,
      respondedAt: new Date().toISOString(),
    };
  });

  const nextState: ProjectDeliveryUpdate["approvalState"] = approvals.some(
    (approval) => approval.status === "Rejected",
  )
    ? "Escalated"
    : approvals.every((approval) => approval.status === "Approved")
    ? "Approved"
    : "Pending";

  const updated: ProjectDeliveryUpdate = {
    ...current,
    approvals,
    approvalState: nextState,
  };

  PROJECT_DELIVERY_UPDATES[index] = updated;
  return updated;
}

type CreateChangeOrderFallbackInput = {
  projectId: string;
  title: string;
  description?: string;
  value: number;
  invoiceId?: string;
  opportunityId?: string;
  status?: "Draft" | "Submitted" | "Approved" | "Rejected";
};

export function listChangeOrders(): ProjectChangeOrder[] {
  return [...PROJECT_CHANGE_ORDERS].sort((a, b) => (a.submittedAt > b.submittedAt ? -1 : 1));
}

export function createChangeOrder(input: CreateChangeOrderFallbackInput): ProjectChangeOrder {
  const project = PROJECTS.get(input.projectId);
  const client = project ? getClient(project.clientId) : null;
  const now = new Date().toISOString();

  const invoice = client?.invoices?.find((inv) => inv.id === input.invoiceId);
  const opportunity = client?.opportunities?.find((opp) => opp.id === input.opportunityId);

  const changeOrder: ProjectChangeOrder = {
    id: `change-order-${Date.now()}`,
    projectId: input.projectId,
    projectName: project?.name ?? "Unknown Project",
    invoiceId: input.invoiceId ?? null,
    invoiceNumber: invoice?.id ?? input.invoiceId ?? null,
    opportunityId: input.opportunityId ?? null,
    opportunityName: opportunity?.name ?? input.opportunityId ?? null,
    title: input.title,
    description: input.description,
    value: input.value,
    status: input.status ?? "Submitted",
    submittedAt: now,
    approvedAt: null,
    ownerId: project?.ownerId ?? null,
    ownerName: project?.owner ?? "Unassigned",
  };

  PROJECT_CHANGE_ORDERS.unshift(changeOrder);
  return changeOrder;
}

export function updateChangeOrderStatus(
  id: string,
  status: ProjectChangeOrder["status"],
): ProjectChangeOrder | null {
  const index = PROJECT_CHANGE_ORDERS.findIndex((order) => order.id === id);
  if (index === -1) return null;

  const approvedAt = status === "Approved" ? new Date().toISOString() : null;
  const updated: ProjectChangeOrder = {
    ...PROJECT_CHANGE_ORDERS[index],
    status,
    approvedAt,
  };

  PROJECT_CHANGE_ORDERS[index] = updated;
  return updated;
}

type CreateClientRoiNarrativeFallbackInput = {
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

export function listClientRoiNarratives(): ClientRoiNarrative[] {
  return [...CLIENT_ROI_NARRATIVES].sort((a, b) => (a.generatedAt > b.generatedAt ? -1 : 1));
}

export function createClientRoiNarrative(
  input: CreateClientRoiNarrativeFallbackInput,
): ClientRoiNarrative {
  const client = getClient(input.clientId);
  const now = new Date().toISOString();

  const narrative: ClientRoiNarrative = {
    id: `roi-narrative-${Date.now()}`,
    clientId: input.clientId,
    clientName: client?.name ?? "Unknown Client",
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    roiPercent: input.roiPercent,
    arrImpact: input.arrImpact,
    highlights: input.highlights,
    surveyScore: input.surveyScore ?? null,
    sentiment: input.sentiment ?? null,
    sharedWith: input.shareTargets ? [...input.shareTargets] : [],
    sharedAt: input.shareTargets?.length ? now : null,
    generatedAt: now,
  };

  CLIENT_ROI_NARRATIVES.unshift(narrative);
  return narrative;
}

export function shareClientRoiNarrative(
  id: string,
  shareTargets: string[],
): ClientRoiNarrative | null {
  const narrative = CLIENT_ROI_NARRATIVES.find((entry) => entry.id === id);
  if (!narrative) return null;

  const targets = new Set([...narrative.sharedWith, ...shareTargets]);
  narrative.sharedWith = Array.from(targets);
  narrative.sharedAt = new Date().toISOString();
  return narrative;
}
