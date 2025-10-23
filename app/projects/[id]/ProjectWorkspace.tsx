'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, FolderOpen, Package, Activity, DollarSign, Settings } from 'lucide-react'

import OverviewTab from './tabs/OverviewTab'
import DocumentsTab from './tabs/DocumentsTab'
import ResourcesTab from './tabs/ResourcesTab'
import ContentTab from './tabs/ContentTab'
import ActivityTab from './tabs/ActivityTab'
import FinancialsTab from './tabs/FinancialsTab'

export type TabKey = 'overview' | 'documents' | 'resources' | 'content' | 'activity' | 'financials'

export type ProjectType = 'Audit' | 'Blueprint' | 'Advisory' | 'Internal'
export type ProjectStatus = 'Pending' | 'Active' | 'Delivered' | 'Closed'

export interface ProjectWorkspaceProject {
  id: string
  name: string
  client: string
  type: ProjectType
  status: ProjectStatus
  team: string[]
  start_date: string
  end_date: string | null
  quickbooks_invoice_url: string | null
  revenue_target: number
  documents: string[]
  agents: string[]
  resources: string[]
  created_at: string
  updated_at: string
}

export interface ProjectDocument {
  id: string
  project_id: string
  title: string
  description: string
  type: string
  tags: string[]
  file_url: string | null
  version: number
  status: 'Draft' | 'Review' | 'Approved'
  summary: string | null
  updated_at: string
  created_at: string
}

export interface ProjectResource {
  id: string
  name: string
  description: string
  type: string
  link: string | null
  tags: string[]
  related_project_ids: string[]
  created_at: string
  updated_at: string
}

export interface ProjectContent {
  id: string
  title: string
  type: string
  source_project_id: string | null
  draft: string | null
  final_text: string | null
  status: 'Draft' | 'Review' | 'Published'
  created_at: string
  updated_at: string
}

interface ProjectWorkspaceProps {
  project: ProjectWorkspaceProject
  documents: ProjectDocument[]
  resources: ProjectResource[]
  content: ProjectContent[]
  initialTab: TabKey
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: Settings },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'resources', label: 'Resources', icon: Package },
  { key: 'content', label: 'Content', icon: FolderOpen },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'financials', label: 'Financials', icon: DollarSign },
]

export default function ProjectWorkspace({
  project,
  documents,
  resources,
  content,
  initialTab,
}: ProjectWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    router.push(`/projects/${project.id}?tab=${tab}`, { scroll: false })
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Delivered':
        return 'bg-blue-100 text-blue-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case 'Audit':
        return 'bg-purple-100 text-purple-800'
      case 'Blueprint':
        return 'bg-blue-100 text-blue-800'
      case 'Advisory':
        return 'bg-orange-100 text-orange-800'
      case 'Internal':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/projects"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">Client: {project.client}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(project.type)}`}>
            {project.type}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
                  flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.key
                      ? 'border-[#fd8216] text-[#fd8216]'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'documents' && <DocumentsTab project={project} documents={documents} />}
        {activeTab === 'resources' && <ResourcesTab project={project} resources={resources} />}
        {activeTab === 'content' && <ContentTab project={project} content={content} />}
        {activeTab === 'activity' && <ActivityTab project={project} />}
        {activeTab === 'financials' && <FinancialsTab project={project} />}
      </div>
    </div>
  )
}
