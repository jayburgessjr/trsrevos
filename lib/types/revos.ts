// lib/types/revos.ts
// Type helpers for the TRS-RevOS execution layer domain tables.

export type ProjectLifecycleStatus =
  | 'Pending'
  | 'Active'
  | 'Delivered'
  | 'Closed'
  | 'Archived';

export type ProjectType = 'Audit' | 'Blueprint' | 'Advisory' | 'Internal';

export interface ProjectRecord {
  id: string;
  client_id: string | null;
  name: string;
  status: ProjectLifecycleStatus | string | null;
  phase: string | null;
  health: string | null;
  start_date: string | null;
  end_date: string | null;
  owner_id: string | null;
  progress: number | null;
  budget: number | null;
  spent: number | null;
  project_type: ProjectType | string | null;
  hubspot_deal_id: string | null;
  quickbooks_invoice_url: string | null;
  quickbooks_invoice_id: string | null;
  kickoff_notes: string | null;
  completed_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberRecord {
  id: string;
  project_id: string;
  user_id: string;
  role: string | null;
  allocation: number | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectLinkRecord {
  id: string;
  project_id: string;
  link_type: string;
  label: string | null;
  url: string;
  created_by: string | null;
  created_at: string;
}

export type DocumentLifecycleStatus = 'draft' | 'review' | 'final';

export interface DocumentRecord {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  document_type: string | null;
  status: DocumentLifecycleStatus | string | null;
  tags: string[];
  current_version_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersionRecord {
  id: string;
  document_id: string;
  version: number;
  file_path: string;
  file_checksum: string | null;
  file_size: number | null;
  mime_type: string | null;
  ai_summary: string | null;
  ai_embedding: number[] | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
}

export interface DocumentTagRecord {
  id: string;
  document_id: string;
  tag: string;
  created_at: string;
}

export interface ResourceRecord {
  id: string;
  name: string;
  description: string | null;
  resource_type: string | null;
  file_path: string | null;
  external_url: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectResourceRecord {
  id: string;
  project_id: string;
  resource_id: string;
  linked_at: string;
  created_by: string | null;
}

export interface DocumentResourceRecord {
  id: string;
  document_id: string;
  resource_id: string;
  linked_at: string;
  created_by: string | null;
}

export type ContentStatus = 'Draft' | 'In Review' | 'Published' | 'Archived';

export interface ContentItemRecord {
  id: string;
  project_id: string | null;
  source_document_id: string | null;
  title: string;
  content_type: string;
  draft_text: string | null;
  final_text: string | null;
  status: ContentStatus | string | null;
  generated_by_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectAgentRunRecord {
  id: string;
  project_id: string | null;
  agent_key: string;
  definition_id: string | null;
  run_id: string | null;
  input_payload: Record<string, unknown> | null;
  output_document_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface AutomationEventRecord {
  id: string;
  project_id: string | null;
  source_system: string;
  event_key: string;
  status: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
}

export interface RevOsDashboardSnapshot {
  generatedAt: string;
  activeProjects: number;
  pendingProjects: number;
  deliveredProjects: number;
  activeClients: number;
  revenueInProgress: number;
  documentsByType: Record<string, number>;
  automationEvents: number;
  agentsRunThisMonth: number;
  automationHoursSaved: number;
}

