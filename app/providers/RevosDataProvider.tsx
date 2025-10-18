'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

import {
  mockAgents,
  mockAutomationLogs,
  mockContent,
  mockDocuments,
  mockInvoices,
  mockProjects,
  mockResources,
} from '@/lib/revos/mock-data'
import type {
  CreateContentInput,
  CreateDocumentInput,
  CreateProjectInput,
  CreateResourceInput,
  RevosState,
  RunAgentInput,
  UpdateContentStatusInput,
  UpdateDocumentStatusInput,
  UpdateProjectStatusInput,
} from '@/lib/revos/types'
import { type Agent, type AutomationLog, type ContentItem, type Document, type Project, type Resource } from '@/lib/revos/types'

const randomId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const STORAGE_KEY = 'trs-revos-data'
const MIGRATION_KEY = 'trs-revos-migrated'

// Load initial state - will be replaced with Supabase data after mount
const loadInitialState = (): RevosState => {
  if (typeof window === 'undefined') {
    return {
      projects: mockProjects,
      documents: mockDocuments,
      agents: mockAgents,
      content: mockContent,
      resources: mockResources,
      automationLogs: mockAutomationLogs,
      invoices: mockInvoices,
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        agents: mockAgents,
      }
    }
  } catch (error) {
    console.error('Failed to load stored data:', error)
  }

  return {
    projects: mockProjects,
    documents: mockDocuments,
    agents: mockAgents,
    content: mockContent,
    resources: mockResources,
    automationLogs: mockAutomationLogs,
    invoices: mockInvoices,
  }
}

const initialState: RevosState = loadInitialState()

type Action =
  | { type: 'setProjects'; payload: Project[] }
  | { type: 'setDocuments'; payload: Document[] }
  | { type: 'setResources'; payload: Resource[] }
  | { type: 'setContent'; payload: ContentItem[] }
  | { type: 'createProject'; payload: CreateProjectInput }
  | { type: 'updateProjectStatus'; payload: UpdateProjectStatusInput }
  | { type: 'createDocument'; payload: CreateDocumentInput }
  | { type: 'updateDocumentStatus'; payload: UpdateDocumentStatusInput }
  | { type: 'updateDocumentProject'; payload: { id: string; projectId: string } }
  | { type: 'createContent'; payload: CreateContentInput }
  | { type: 'updateContentStatus'; payload: UpdateContentStatusInput }
  | { type: 'createResource'; payload: CreateResourceInput }
  | { type: 'runAgent'; payload: RunAgentInput }

type RevosContextValue = RevosState & {
  createProject: (input: CreateProjectInput) => Promise<void>
  updateProjectStatus: (input: UpdateProjectStatusInput) => Promise<void>
  createDocument: (input: CreateDocumentInput) => Promise<void>
  updateDocumentStatus: (input: UpdateDocumentStatusInput) => Promise<void>
  updateDocumentProject: (input: { id: string; projectId: string }) => Promise<void>
  createContent: (input: CreateContentInput) => void
  updateContentStatus: (input: UpdateContentStatusInput) => void
  createResource: (input: CreateResourceInput) => void
  runAgent: (input: RunAgentInput) => void
}

const RevosContext = createContext<RevosContextValue | undefined>(undefined)

const summariseDocument = (description: string) => {
  if (description.length <= 180) return description
  return `${description.slice(0, 177)}...`
}

function reducer(state: RevosState, action: Action): RevosState {
  switch (action.type) {
    case 'setProjects':
      return { ...state, projects: action.payload }
    case 'setDocuments':
      return { ...state, documents: action.payload }
    case 'setResources':
      return { ...state, resources: action.payload }
    case 'setContent':
      return { ...state, content: action.payload }
    case 'createProject': {
      const projectId = randomId()
      const newProject: Project = {
        id: projectId,
        documents: action.payload.documents ?? [],
        agents: action.payload.agents ?? [],
        resources: action.payload.resources ?? [],
        name: action.payload.name,
        client: action.payload.client,
        type: action.payload.type,
        team: action.payload.team,
        startDate: action.payload.startDate,
        endDate: action.payload.endDate,
        status: action.payload.status,
        quickbooksInvoiceUrl: action.payload.quickbooksInvoiceUrl,
        revenueTarget: action.payload.revenueTarget,
      }
      return { ...state, projects: [newProject, ...state.projects] }
    }
    case 'updateProjectStatus': {
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? { ...project, status: action.payload.status } : project,
        ),
      }
    }
    case 'createDocument': {
      const documentId = randomId()
      const newDocument: Document = {
        id: documentId,
        projectId: action.payload.projectId,
        title: action.payload.title,
        description: action.payload.description,
        type: action.payload.type,
        tags: action.payload.tags,
        fileUrl: action.payload.fileUrl,
        version: 1,
        status: 'Draft',
        summary: summariseDocument(action.payload.description),
        updatedAt: new Date().toISOString(),
      }
      return {
        ...state,
        documents: [newDocument, ...state.documents],
        projects: state.projects.map((project) =>
          project.id === action.payload.projectId
            ? { ...project, documents: Array.from(new Set([...project.documents, documentId])) }
            : project,
        ),
      }
    }
    case 'updateDocumentStatus': {
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.payload.id ? { ...document, status: action.payload.status } : document,
        ),
      }
    }
    case 'updateDocumentProject': {
      return {
        ...state,
        documents: state.documents.map((document) =>
          document.id === action.payload.id ? { ...document, projectId: action.payload.projectId } : document,
        ),
      }
    }
    case 'createContent': {
      const newContent: ContentItem = {
        id: randomId(),
        title: action.payload.title,
        type: action.payload.type,
        sourceProjectId: action.payload.sourceProjectId,
        draft: action.payload.draft,
        finalText: action.payload.finalText,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      }
      return { ...state, content: [newContent, ...state.content] }
    }
    case 'updateContentStatus': {
      return {
        ...state,
        content: state.content.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status, finalText: action.payload.finalText ?? item.finalText }
            : item,
        ),
      }
    }
    case 'createResource': {
      const newResource: Resource = {
        id: randomId(),
        name: action.payload.name,
        description: action.payload.description,
        type: action.payload.type,
        link: action.payload.link,
        tags: action.payload.tags,
        relatedProjectIds: action.payload.relatedProjectIds,
      }
      return { ...state, resources: [newResource, ...state.resources] }
    }
    case 'runAgent': {
      const agent = state.agents.find((item) => item.id === action.payload.agentId)
      if (!agent) return state

      const log: AutomationLog = {
        id: randomId(),
        agentId: agent.id,
        projectId: action.payload.projectId,
        outputType: agent.defaultOutputType,
        summary:
          action.payload.notes?.trim().length
            ? action.payload.notes
            : `${agent.name} executed for ${action.payload.projectId ?? 'unassigned context'}.`,
        createdAt: new Date().toISOString(),
      }

      const updates: Partial<RevosState> = {
        automationLogs: [log, ...state.automationLogs],
      }

      if (agent.defaultOutputType === 'Document') {
        const doc: Document = {
          id: randomId(),
          projectId: action.payload.projectId ?? 'unassigned',
          title: `${agent.name} Output`,
          description: 'AI generated deliverable awaiting review.',
          type: 'AI Artifact',
          tags: ['AI'],
          fileUrl: '#',
          version: 1,
          status: 'Draft',
          summary: 'Output generated automatically by TRS Agent.',
          updatedAt: new Date().toISOString(),
        }
        updates.documents = [doc, ...state.documents]
        if (action.payload.projectId) {
          updates.projects = state.projects.map((project) =>
            project.id === action.payload.projectId
              ? { ...project, documents: Array.from(new Set([...project.documents, doc.id])), agents: Array.from(new Set([...project.agents, agent.id])) }
              : project,
          )
        }
      } else {
        const content: ContentItem = {
          id: randomId(),
          title: `${agent.name} Draft`,
          type: 'Post',
          sourceProjectId: action.payload.projectId,
          draft: 'Draft generated by TRS Agent. Refine before publishing.',
          status: 'Draft',
          createdAt: new Date().toISOString(),
        }
        updates.content = [content, ...state.content]
      }

      return { ...state, ...updates }
    }
    default:
      return state
  }
}

export function RevosDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(true)

  // Load projects from Supabase
  const loadProjects = useCallback(async () => {
    console.log('Loading projects from Supabase...')
    const { data: projects, error: projectsError } = await supabase
      .from('revos_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error loading projects:', projectsError)
    } else if (projects) {
      console.log(`Loaded ${projects.length} projects from Supabase`)
      const transformedProjects: Project[] = projects.map((p) => ({
        id: p.id,
        name: p.name,
        client: p.client,
        type: p.type as Project['type'],
        status: p.status as Project['status'],
        team: p.team || [],
        startDate: p.start_date,
        endDate: p.end_date || undefined,
        quickbooksInvoiceUrl: p.quickbooks_invoice_url || undefined,
        revenueTarget: Number(p.revenue_target) || 0,
        documents: p.documents || [],
        agents: p.agents || [],
        resources: p.resources || [],
      }))

      console.log('Dispatching projects to state:', transformedProjects)
      dispatch({ type: 'setProjects', payload: transformedProjects })
    }
  }, [])

  // Load documents from Supabase
  const loadDocuments = useCallback(async () => {
    console.log('Loading documents from Supabase...')
    const { data: documents, error: documentsError } = await supabase
      .from('revos_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (documentsError) {
      console.error('Error loading documents:', documentsError)
    } else if (documents) {
      console.log(`Loaded ${documents.length} documents from Supabase`)
      const transformedDocuments: Document[] = documents.map((d) => ({
        id: d.id,
        projectId: d.project_id,
        title: d.title,
        description: d.description,
        type: d.type,
        tags: d.tags || [],
        fileUrl: d.file_url || '#',
        version: d.version || 1,
        status: d.status as Document['status'],
        summary: d.summary || '',
        updatedAt: d.updated_at,
      }))

      console.log('Dispatching documents to state:', transformedDocuments)
      dispatch({ type: 'setDocuments', payload: transformedDocuments })
    }
  }, [])

  // Load data from Supabase on mount and migrate localStorage if needed
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const hasMigrated = localStorage.getItem(MIGRATION_KEY)

        // Load projects and documents from Supabase
        await loadProjects()
        await loadDocuments()

        // If not migrated yet and there's localStorage data, migrate it
        if (!hasMigrated) {
          const localData = localStorage.getItem(STORAGE_KEY)
          if (localData) {
            const parsed = JSON.parse(localData)

            // Migrate projects if any exist
            if (parsed.projects && parsed.projects.length > 0) {
              console.log('Migrating', parsed.projects.length, 'projects from localStorage to Supabase...')

              for (const project of parsed.projects) {
                // Check if project already exists in Supabase
                const { data: existing } = await supabase
                  .from('revos_projects')
                  .select('id')
                  .eq('id', project.id)
                  .single()

                if (!existing) {
                  await supabase.from('revos_projects').insert({
                    id: project.id,
                    name: project.name,
                    client: project.client,
                    type: project.type,
                    status: project.status,
                    team: project.team,
                    start_date: project.startDate,
                    end_date: project.endDate,
                    quickbooks_invoice_url: project.quickbooksInvoiceUrl,
                    revenue_target: project.revenueTarget,
                    documents: project.documents,
                    agents: project.agents,
                    resources: project.resources,
                  })
                }
              }

              console.log('✓ Migration complete!')
            }
          }

          // Mark as migrated
          localStorage.setItem(MIGRATION_KEY, 'true')
        }
      } catch (error) {
        console.error('Error loading from Supabase:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFromSupabase()
  }, [loadProjects, loadDocuments])

  // Subscribe to realtime changes for projects
  useEffect(() => {
    const channel = supabase
      .channel('revos_projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revos_projects'
        },
        (payload) => {
          console.log('Project change detected:', payload)
          // Reload projects when any change occurs
          loadProjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadProjects])

  // Subscribe to realtime changes for documents
  useEffect(() => {
    const channel = supabase
      .channel('revos_documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revos_documents'
        },
        (payload) => {
          console.log('Document change detected:', payload)
          // Reload documents when any change occurs
          loadDocuments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadDocuments])

  // Keep localStorage as backup (but Supabase is source of truth)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save backup to localStorage:', error)
      }
    }
  }, [state, isLoading])

  const createProject = useCallback(async (input: CreateProjectInput) => {
    const projectId = randomId()
    const newProject: Project = {
      id: projectId,
      documents: input.documents ?? [],
      agents: input.agents ?? [],
      resources: input.resources ?? [],
      name: input.name,
      client: input.client,
      type: input.type,
      team: input.team,
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status,
      quickbooksInvoiceUrl: input.quickbooksInvoiceUrl,
      revenueTarget: input.revenueTarget,
    }

    // Optimistic update
    dispatch({ type: 'createProject', payload: input })

    // Save to Supabase
    try {
      const { error } = await supabase.from('revos_projects').insert({
        id: projectId,
        name: input.name,
        client: input.client,
        type: input.type,
        status: input.status,
        team: input.team,
        start_date: input.startDate,
        end_date: input.endDate,
        quickbooks_invoice_url: input.quickbooksInvoiceUrl,
        revenue_target: input.revenueTarget,
        documents: input.documents ?? [],
        agents: input.agents ?? [],
        resources: input.resources ?? [],
      })

      if (error) {
        console.error('Error creating project in Supabase:', error)
      }
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }, [])

  const updateProjectStatus = useCallback(async (input: UpdateProjectStatusInput) => {
    // Optimistic update
    dispatch({ type: 'updateProjectStatus', payload: input })

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('revos_projects')
        .update({ status: input.status })
        .eq('id', input.id)

      if (error) {
        console.error('Error updating project status in Supabase:', error)
      }
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }, [])

  const createDocument = useCallback(async (input: CreateDocumentInput) => {
    const documentId = randomId()

    // Optimistic update
    dispatch({ type: 'createDocument', payload: input })

    // Save to Supabase
    try {
      const { error } = await supabase.from('revos_documents').insert({
        id: documentId,
        project_id: input.projectId,
        title: input.title,
        description: input.description,
        type: input.type,
        tags: input.tags,
        file_url: input.fileUrl,
        version: 1,
        status: 'Draft',
        summary: summariseDocument(input.description),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error creating document in Supabase:', error)
      }
    } catch (error) {
      console.error('Error saving document:', error)
    }
  }, [])

  const updateDocumentStatus = useCallback(async (input: UpdateDocumentStatusInput) => {
    // Optimistic update
    dispatch({ type: 'updateDocumentStatus', payload: input })

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('revos_documents')
        .update({ status: input.status, updated_at: new Date().toISOString() })
        .eq('id', input.id)

      if (error) {
        console.error('Error updating document status in Supabase:', error)
      }
    } catch (error) {
      console.error('Error updating document status:', error)
    }
  }, [])

  const updateDocumentProject = useCallback(async (input: { id: string; projectId: string }) => {
    // Optimistic update
    dispatch({ type: 'updateDocumentProject', payload: input })

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('revos_documents')
        .update({ project_id: input.projectId || null, updated_at: new Date().toISOString() })
        .eq('id', input.id)

      if (error) {
        console.error('Error updating document project in Supabase:', error)
      }
    } catch (error) {
      console.error('Error updating document project:', error)
    }
  }, [])

  const createContent = useCallback((input: CreateContentInput) => {
    dispatch({ type: 'createContent', payload: input })
  }, [])

  const updateContentStatus = useCallback((input: UpdateContentStatusInput) => {
    dispatch({ type: 'updateContentStatus', payload: input })
  }, [])

  const createResource = useCallback((input: CreateResourceInput) => {
    dispatch({ type: 'createResource', payload: input })
  }, [])

  const runAgent = useCallback((input: RunAgentInput) => {
    dispatch({ type: 'runAgent', payload: input })
  }, [])

  const value = useMemo<RevosContextValue>(
    () => ({
      ...state,
      createProject,
      updateProjectStatus,
      createDocument,
      updateDocumentStatus,
      updateDocumentProject,
      createContent,
      updateContentStatus,
      createResource,
      runAgent,
    }),
    [state, createProject, updateProjectStatus, createDocument, updateDocumentStatus, updateDocumentProject, createContent, updateContentStatus, createResource, runAgent],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  return <RevosContext.Provider value={value}>{children}</RevosContext.Provider>
}

export function useRevosData() {
  const context = useContext(RevosContext)
  if (!context) {
    throw new Error('useRevosData must be used within RevosDataProvider')
  }
  return context
}
