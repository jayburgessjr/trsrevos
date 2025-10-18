'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Textarea } from '@/ui/textarea'
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Send,
  Sparkles,
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ClientDetailProps = {
  clientName: string
}

export default function ClientDetailPageClient({ clientName }: ClientDetailProps) {
  const { projects, documents, content, resources } = useRevosData()
  const [notes, setNotes] = useState('')
  const [notesLoading, setNotesLoading] = useState(true)
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])

  // Load client notes from Supabase
  useEffect(() => {
    const loadNotes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('client_notes')
        .select('notes')
        .eq('client_name', clientName)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        console.error('Error loading notes:', error)
      } else if (data) {
        setNotes(data.notes || '')
      }
      setNotesLoading(false)
    }

    loadNotes()
  }, [clientName])

  // Save notes to Supabase
  const handleSaveNotes = async () => {
    setNotesSaving(true)
    setNotesSaved(false)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('client_notes')
        .upsert({
          id: `client-${clientName}`,
          client_name: clientName,
          notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_name'
        })

      if (error) {
        console.error('Error saving notes:', error)
        alert('Failed to save notes. Please try again.')
      } else {
        setNotesSaved(true)
        setTimeout(() => setNotesSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes. Please try again.')
    } finally {
      setNotesSaving(false)
    }
  }

  // Get client-specific data
  const clientData = useMemo(() => {
    const clientProjects = projects.filter(p => p.client === clientName)
    const projectIds = clientProjects.map(p => p.id)
    const clientDocuments = documents.filter(d => projectIds.includes(d.projectId || ''))
    const clientContent = content.filter(c => projectIds.includes(c.sourceProjectId || ''))
    const clientResources = resources.filter(r =>
      r.relatedProjectIds.some(id => projectIds.includes(id))
    )

    const totalRevenue = clientProjects.reduce((sum, p) => sum + (p.revenueTarget || 0), 0)
    const activeProjects = clientProjects.filter(p => p.status === 'Active')
    const completedProjects = clientProjects.filter(p => p.status === 'Delivered' || p.status === 'Closed')

    // Calculate date range
    const startDates = clientProjects
      .map(p => new Date(p.startDate))
      .filter(d => !isNaN(d.getTime()))
    const earliestStart = startDates.length > 0
      ? new Date(Math.min(...startDates.map(d => d.getTime())))
      : null

    return {
      projects: clientProjects,
      documents: clientDocuments,
      content: clientContent,
      resources: clientResources,
      totalRevenue,
      monthlyRevenue: Math.round(totalRevenue / 12),
      activeProjects: activeProjects.length,
      totalProjects: clientProjects.length,
      completedProjects: completedProjects.length,
      documentsCount: clientDocuments.length,
      contentCount: clientContent.length,
      resourcesCount: clientResources.length,
      earliestStart,
      projectTypes: [...new Set(clientProjects.map(p => p.type))],
    }
  }, [clientName, projects, documents, content, resources])

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage = { role: 'user' as const, content: chatMessage }
    setChatHistory([...chatHistory, newMessage])

    // Simulate AI response (you'll integrate with TRS Brain API later)
    setTimeout(() => {
      const context = `Client: ${clientName}\nTotal Revenue: $${clientData.totalRevenue.toLocaleString()}\nActive Projects: ${clientData.activeProjects}\nDocuments: ${clientData.documentsCount}`

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: `Based on ${clientName}'s data, I can help you with that. This client has ${clientData.activeProjects} active projects generating $${clientData.totalRevenue.toLocaleString()} in annual revenue. What specific information would you like to know?`
      }])
    }, 1000)

    setChatMessage('')
  }

  if (clientData.totalProjects === 0) {
    return (
      <div className="space-y-4">
        <Link href="/clients-revos" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Client not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/clients-revos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Link>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Building2 className="h-8 w-8 text-[#015e32]" />
            {clientName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{clientData.projectTypes.join(', ')}</span>
            {clientData.earliestStart && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Client since {clientData.earliestStart.toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${clientData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${clientData.monthlyRevenue.toLocaleString()}/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientData.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientData.totalProjects} total • {clientData.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientData.documentsCount}</div>
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
            <div className="text-2xl font-bold">{clientData.resourcesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientData.contentCount} content pieces
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="projects" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Start Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <Link href="/projects" className="hover:underline">
                              {project.name}
                            </Link>
                          </TableCell>
                          <TableCell>{project.type}</TableCell>
                          <TableCell>
                            <Badge variant={project.status === 'Active' ? 'default' : 'outline'}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>${project.revenueTarget?.toLocaleString()}</TableCell>
                          <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientData.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">
                            <Link href="/documents" className="hover:underline">
                              {doc.title}
                            </Link>
                          </TableCell>
                          <TableCell>{doc.type}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.status}</Badge>
                          </TableCell>
                          <TableCell>v{doc.version}</TableCell>
                          <TableCell>{new Date(doc.updatedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {clientData.documents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No documents yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Client Name</p>
                        <p className="text-base font-semibold">{clientName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Project Types</p>
                        <p className="text-base font-semibold">{clientData.projectTypes.join(', ')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                        <p className="text-base font-semibold">{clientData.totalProjects}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                        <p className="text-base font-semibold">{clientData.activeProjects}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-base font-semibold">${clientData.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                        <p className="text-base font-semibold">${clientData.monthlyRevenue.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                        <p className="text-base font-semibold">{clientData.documentsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Content Pieces</p>
                        <p className="text-base font-semibold">{clientData.contentCount}</p>
                      </div>
                    </div>

                    {clientData.earliestStart && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Client Since</p>
                        <p className="text-base font-semibold">
                          {clientData.earliestStart.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(clientData.projects.flatMap(p => p.team))].map(member => (
                          <Badge key={member} variant="secondary">{member}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Client Notes
                    </label>
                    {notesLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes about this client..."
                          rows={10}
                          className="w-full"
                          disabled={notesSaving}
                        />
                        <div className="flex items-center gap-3 mt-4">
                          <Button
                            onClick={handleSaveNotes}
                            disabled={notesSaving}
                            className="bg-[#015e32] hover:bg-[#01753d]"
                          >
                            {notesSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Notes'
                            )}
                          </Button>
                          {notesSaved && (
                            <span className="text-sm text-emerald-600 font-medium">
                              Notes saved successfully!
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
                Ask questions about {clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 gap-4">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] max-h-[600px]">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Start a conversation about this client. Ask about projects, revenue, documents, or insights.
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
                  placeholder="Ask about this client..."
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
