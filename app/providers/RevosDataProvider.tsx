'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

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

// Load initial state from localStorage or use mock data
const loadInitialState = (): RevosState => {
  if (typeof window === 'undefined') {
    // Server-side: use mock data
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
      // Merge with mock agents (always use latest agent definitions)
      return {
        ...parsed,
        agents: mockAgents,
      }
    }
  } catch (error) {
    console.error('Failed to load stored data:', error)
  }

  // Fallback to mock data
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
  | { type: 'createProject'; payload: CreateProjectInput }
  | { type: 'updateProjectStatus'; payload: UpdateProjectStatusInput }
  | { type: 'createDocument'; payload: CreateDocumentInput }
  | { type: 'updateDocumentStatus'; payload: UpdateDocumentStatusInput }
  | { type: 'createContent'; payload: CreateContentInput }
  | { type: 'updateContentStatus'; payload: UpdateContentStatusInput }
  | { type: 'createResource'; payload: CreateResourceInput }
  | { type: 'runAgent'; payload: RunAgentInput }

type RevosContextValue = RevosState & {
  createProject: (input: CreateProjectInput) => void
  updateProjectStatus: (input: UpdateProjectStatusInput) => void
  createDocument: (input: CreateDocumentInput) => void
  updateDocumentStatus: (input: UpdateDocumentStatusInput) => void
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
    case 'createContent': {
      const newContent: ContentItem = {
        id: randomId(),
        title: action.payload.title,
        type: action.payload.type,
        sourceProjectId: action.payload.sourceProjectId,
        draft: action.payload.draft,
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

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save data to localStorage:', error)
      }
    }
  }, [state])

  const createProject = useCallback((input: CreateProjectInput) => {
    dispatch({ type: 'createProject', payload: input })
  }, [])

  const updateProjectStatus = useCallback((input: UpdateProjectStatusInput) => {
    dispatch({ type: 'updateProjectStatus', payload: input })
  }, [])

  const createDocument = useCallback((input: CreateDocumentInput) => {
    dispatch({ type: 'createDocument', payload: input })
  }, [])

  const updateDocumentStatus = useCallback((input: UpdateDocumentStatusInput) => {
    dispatch({ type: 'updateDocumentStatus', payload: input })
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
      createContent,
      updateContentStatus,
      createResource,
      runAgent,
    }),
    [state, createProject, updateProjectStatus, createDocument, updateDocumentStatus, createContent, updateContentStatus, createResource, runAgent],
  )

  return <RevosContext.Provider value={value}>{children}</RevosContext.Provider>
}

export function useRevosData() {
  const context = useContext(RevosContext)
  if (!context) {
    throw new Error('useRevosData must be used within RevosDataProvider')
  }
  return context
}
