'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
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
  Loader2,
  Plus,
  Eye,
  Trash2,
  Edit
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/ui/input'

type ClientNote = {
  id: string
  client_name: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

type ClientDetailProps = {
  clientName: string
}

export default function ClientDetailPageClient({ clientName }: ClientDetailProps) {
  const { projects, documents, content, resources } = useRevosData()
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState<ClientNote | null>(null)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])

  // Load client notes from Supabase
  const loadNotes = useCallback(async () => {
    setNotesLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_name', clientName)
      .order('created_at', { ascending: false })

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading notes:', error)
    } else if (data) {
      setClientNotes(data)
    }
    setNotesLoading(false)
  }, [clientName])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // Create new note
  const handleCreateNote = () => {
    setIsCreatingNote(true)
    setSelectedNote(null)
    setNoteTitle('')
    setNoteContent('')
  }

  // Save note (create or update)
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      alert('Please enter a note title')
      return
    }

    setNotesSaving(true)
    setNotesSaved(false)

    try {
      const supabase = createClient()

      if (selectedNote) {
        // Update existing note
        const { error } = await supabase
          .from('client_notes')
          .update({
            title: noteTitle,
            content: noteContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedNote.id)

        if (error) throw error
      } else {
        // Create new note
        const { error } = await supabase
          .from('client_notes')
          .insert({
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            client_name: clientName,
            title: noteTitle,
            content: noteContent
          })

        if (error) throw error
      }

      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 3000)

      // Reload notes and reset form
      await loadNotes()
      setIsCreatingNote(false)
      setSelectedNote(null)
      setNoteTitle('')
      setNoteContent('')
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setNotesSaving(false)
    }
  }

  // View note
  const handleViewNote = (note: ClientNote) => {
    setSelectedNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setIsCreatingNote(false)
  }

  // Edit note
  const handleEditNote = (note: ClientNote) => {
    setSelectedNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setIsCreatingNote(true)
  }

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      await loadNotes()
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
        setNoteTitle('')
        setNoteContent('')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsCreatingNote(false)
    setSelectedNote(null)
    setNoteTitle('')
    setNoteContent('')
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
                            <Link href={`/projects/${project.id}`} className="hover:underline">
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
                            <Link href={`/documents/${doc.id}`} className="hover:underline">
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
                          <Badge key={member} variant="outline">{member}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-0">
                  {notesLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 h-[600px]">
                      {/* Left Column - Notes List */}
                      <div className="col-span-1 border-r pr-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-sm">All Notes ({clientNotes.length})</h3>
                          <Button
                            onClick={handleCreateNote}
                            size="sm"
                            className="bg-[#015e32] hover:bg-[#01753d]"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            New
                          </Button>
                        </div>

                        {clientNotes.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No notes yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click &quot;New&quot; to create your first note
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {clientNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => handleViewNote(note)}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedNote?.id === note.id
                                    ? 'bg-[#015e32]/10 border-[#015e32]'
                                    : 'hover:bg-muted border-border'
                                }`}
                              >
                                <div className="font-medium text-sm truncate">{note.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(note.created_at).toLocaleDateString()}
                                </div>
                                {note.content && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {note.content}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Column - Note Editor/Viewer */}
                      <div className="col-span-2">
                        {!selectedNote && !isCreatingNote ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              Select a note to view or create a new one
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full">
                            {/* Note Header */}
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold">
                                {isCreatingNote ? (selectedNote ? 'Edit Note' : 'New Note') : 'View Note'}
                              </h3>
                              <div className="flex gap-2">
                                {!isCreatingNote && selectedNote && (
                                  <>
                                    <Button
                                      onClick={() => handleEditNote(selectedNote)}
                                      size="sm"
                                      variant="outline"
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteNote(selectedNote.id)}
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                                {isCreatingNote && (
                                  <Button
                                    onClick={handleCancelEdit}
                                    size="sm"
                                    variant="outline"
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Note Content */}
                            {isCreatingNote ? (
                              <div className="flex flex-col gap-4 flex-1">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Title
                                  </label>
                                  <Input
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Enter note title..."
                                    disabled={notesSaving}
                                  />
                                </div>
                                <div className="flex-1 flex flex-col">
                                  <label className="text-sm font-medium mb-2 block">
                                    Content
                                  </label>
                                  <Textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Enter note content..."
                                    className="flex-1 min-h-[400px]"
                                    disabled={notesSaving}
                                  />
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    onClick={handleSaveNote}
                                    disabled={notesSaving}
                                    className="bg-[#015e32] hover:bg-[#01753d]"
                                  >
                                    {notesSaving ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      'Save Note'
                                    )}
                                  </Button>
                                  {notesSaved && (
                                    <span className="text-sm text-emerald-600 font-medium">
                                      Note saved successfully!
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              selectedNote && (
                                <div className="flex flex-col gap-4">
                                  <div>
                                    <h4 className="text-lg font-semibold">{selectedNote.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Created: {new Date(selectedNote.created_at).toLocaleString()}
                                      {selectedNote.updated_at !== selectedNote.created_at && (
                                        <> • Updated: {new Date(selectedNote.updated_at).toLocaleString()}</>
                                      )}
                                    </p>
                                  </div>
                                  <div className="border rounded-lg p-4 bg-muted/30 whitespace-pre-wrap">
                                    {selectedNote.content || (
                                      <span className="text-muted-foreground italic">No content</span>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
