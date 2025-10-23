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
        return 'border border-orange-500 bg-green-700 text-white'
      case 'Pending':
        return 'border border-orange-500 bg-green-800 text-white'
      case 'Delivered':
        return 'border border-orange-500 bg-green-600 text-white'
      case 'Closed':
        return 'border border-orange-500 bg-green-900 text-white'
      default:
        return 'border border-orange-500 bg-green-800 text-white'
    }
  }

  const getTypeColor = (type: ProjectType) => {
    switch (type) {
      case 'Audit':
        return 'border border-orange-500 bg-green-700 text-white'
      case 'Blueprint':
        return 'border border-orange-500 bg-green-800 text-white'
      case 'Advisory':
        return 'border border-orange-500 bg-green-600 text-white'
      case 'Internal':
        return 'border border-orange-500 bg-green-900 text-white'
      default:
        return 'border border-orange-500 bg-green-800 text-white'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header - White Card */}
      <div className="rounded-2xl border border-orange-500 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/projects"
            className="group flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500 bg-[#004d29] text-white transition-colors hover:bg-orange-500"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600">Client: {project.client}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500 text-white border border-orange-500">
              {project.type}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#004d29] text-white border border-orange-500">
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                flex items-center gap-2 whitespace-nowrap rounded-lg border border-orange-500 px-4 py-2 text-sm font-medium transition-colors
                ${
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-900 hover:bg-orange-500 hover:text-white'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${activeTab === tab.key ? 'text-white' : 'text-gray-600'}`} />
              {tab.label}
            </button>
          )
        })}
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
