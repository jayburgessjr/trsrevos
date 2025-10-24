export type ProjectType = 'Audit' | 'Blueprint' | 'Advisory' | 'Internal'
export type ProjectStatus = 'Pending' | 'Active' | 'Delivered' | 'Closed'

export type DocumentStatus = 'Draft' | 'In Review' | 'Final'

export type ContentStatus = 'Draft' | 'Published'

export type AgentCategory =
  | 'Summarization'
  | 'Reporting'
  | 'Enablement'
  | 'Communication'

export type ResourceType = 'File' | 'Link'

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type Task = {
  id: string
  title: string
  description: string
  projectId: string
  assignedTo?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  tags: string[]
  parentTaskId?: string
  estimatedHours?: number
  actualHours?: number
}

export type Project = {
  id: string
  name: string
  client: string
  type: ProjectType
  team: string[]
  startDate: string
  endDate?: string
  status: ProjectStatus
  quickbooksInvoiceUrl?: string
  documents: string[]
  agents: string[]
  resources: string[]
  revenueTarget: number
}

export type Document = {
  id: string
  title: string
  description: string
  projectId: string
  version: number
  type: string
  status: DocumentStatus
  tags: string[]
  fileUrl: string
  summary: string
  updatedAt: string
}

export type Agent = {
  id: string
  name: string
  category: AgentCategory
  description: string
  prompt: string
  defaultOutputType: 'Document' | 'Content'
}

export type ContentItem = {
  id: string
  title: string
  type: 'Case Study' | 'Post' | 'Email' | 'Slide' | 'Research'
  client?: string
  sourceProjectId?: string
  draft: string
  finalText?: string
  status: ContentStatus
  createdAt: string
}

export type Resource = {
  id: string
  name: string
  description: string
  type: ResourceType
  link: string
  tags: string[]
  relatedProjectIds: string[]
}

export type AutomationLog = {
  id: string
  agentId: string
  projectId?: string
  outputType: 'Document' | 'Content'
  summary: string
  createdAt: string
}

export type InvoiceSummary = {
  id: string
  projectId: string
  amount: number
  status: 'Draft' | 'Sent' | 'Paid'
  dueDate: string
  paidDate?: string
}

export type RevosState = {
  projects: Project[]
  documents: Document[]
  agents: Agent[]
  content: ContentItem[]
  resources: Resource[]
  automationLogs: AutomationLog[]
  invoices: InvoiceSummary[]
  tasks: Task[]
}

export type CreateProjectInput = Omit<Project, 'id' | 'documents' | 'agents' | 'resources'> & {
  documents?: string[]
  agents?: string[]
  resources?: string[]
}

export type UpdateProjectStatusInput = {
  id: string
  status: ProjectStatus
}

export type CreateDocumentInput = {
  title: string
  description: string
  projectId: string
  type: string
  tags: string[]
  fileUrl: string
}

export type UpdateDocumentStatusInput = {
  id: string
  status: DocumentStatus
}

export type CreateContentInput = {
  title: string
  type: ContentItem['type']
  client?: string
  sourceProjectId?: string
  draft: string
  finalText?: string
}

export type UpdateContentStatusInput = {
  id: string
  status: ContentStatus
  finalText?: string
}

export type CreateResourceInput = {
  name: string
  description: string
  type: ResourceType
  link: string
  tags: string[]
  relatedProjectIds: string[]
}

export type RunAgentInput = {
  agentId: string
  projectId?: string
  notes?: string
}

export type CreateTaskInput = {
  title: string
  description: string
  projectId: string
  assignedTo?: string
  priority: TaskPriority
  dueDate?: string
  tags?: string[]
  parentTaskId?: string
  estimatedHours?: number
}

export type UpdateTaskInput = {
  id: string
  title?: string
  description?: string
  assignedTo?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
  actualHours?: number
}
