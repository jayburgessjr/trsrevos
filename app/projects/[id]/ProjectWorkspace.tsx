'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, FolderOpen, Package, Activity, DollarSign, Settings, Briefcase, Calendar, TrendingUp, Sparkles, MessageSquare, Send } from 'lucide-react'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Textarea } from '@/ui/textarea'

import OverviewTab from './tabs/OverviewTab'
import DocumentsTab from './tabs/DocumentsTab'
import ResourcesTab from './tabs/ResourcesTab'
import ContentTab from './tabs/ContentTab'
import ActivityTab from './tabs/ActivityTab'
import FinancialsTab from './tabs/FinancialsTab'
import TasksTab from './tabs/TasksTab'

export type TabKey = 'overview' | 'documents' | 'tasks' | 'resources' | 'content' | 'activity' | 'financials'

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

export default function ProjectWorkspace({
  project,
  documents,
  resources,
  content,
  initialTab,
}: ProjectWorkspaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab)
    router.push(`/projects/${project.id}?tab=${tab}`, { scroll: false })
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = { role: 'user' as const, content: chatMessage }
    setChatHistory([...chatHistory, newMessage])

    // Simulate AI response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Based on ${project.name}'s data, I can help you with that. This project has ${documents.length} documents, ${resources.length} resources, and ${content.length} content pieces. What specific information would you like to know?`
      }])
    }, 1000)

    setChatMessage('')
  }

  // Calculate project duration
  const startDate = new Date(project.start_date)
  const endDate = project.end_date ? new Date(project.end_date) : null
  const durationDays = endDate
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate monthly revenue
  const monthlyRevenue = Math.round(project.revenue_target / 12)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-[#015e32]" />
            {project.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{project.client}</span>
            <span>•</span>
            <span>{project.type}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Started {startDate.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {durationDays} days in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Target</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${project.revenue_target.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${monthlyRevenue.toLocaleString()}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deliverables created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resources.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {content.length} content pieces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue={initialTab} value={activeTab} onValueChange={(value) => handleTabChange(value as TabKey)} className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview">
                  <OverviewTab project={project} />
                </TabsContent>
                <TabsContent value="documents">
                  <DocumentsTab project={project} documents={documents} />
                </TabsContent>
                <TabsContent value="tasks">
                  <TasksTab project={project} />
                </TabsContent>
                <TabsContent value="resources">
                  <ResourcesTab project={project} resources={resources} />
                </TabsContent>
                <TabsContent value="content">
                  <ContentTab project={project} content={content} />
                </TabsContent>
                <TabsContent value="activity">
                  <ActivityTab project={project} />
                </TabsContent>
                <TabsContent value="financials">
                  <FinancialsTab project={project} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - AI Chat */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-[#fd8216]" />
                TRS Brain Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about {project.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-4">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] max-h-[600px]">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Start a conversation about this project. Ask about documents, resources, team members, or insights.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-[#015e32] text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask about this project..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-[#015e32] hover:bg-[#01753d]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
