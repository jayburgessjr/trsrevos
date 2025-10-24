'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText, Calendar, Tag, Folder, Edit2, Save, X } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Textarea } from '@/ui/textarea'
import TRSBrainChat from '@/components/documents/TRSBrainChat'
import type { Document } from '@/lib/revos/types'

type ContentDetailClientProps = {
  contentId: string
}

export default function ContentDetailClient({ contentId }: ContentDetailClientProps) {
  const router = useRouter()
  const { content, projects } = useRevosData()
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [savedNotes, setSavedNotes] = useState('')

  const contentItem = useMemo(() => {
    return content.find((item) => item.id === contentId)
  }, [content, contentId])

  const project = useMemo(() => {
    if (!contentItem?.sourceProjectId) return null
    return projects.find((proj) => proj.id === contentItem.sourceProjectId)
  }, [contentItem, projects])

  // Convert content item to document format for TRS Brain compatibility
  const documentContext = useMemo((): Document | undefined => {
    if (!contentItem) return undefined
    return {
      id: contentItem.id,
      title: contentItem.title,
      description: contentItem.finalText || contentItem.draft,
      projectId: contentItem.sourceProjectId || '',
      version: 1,
      type: contentItem.type,
      status: contentItem.status === 'Published' ? 'Final' : 'Draft',
      tags: [contentItem.type, 'Content'],
      fileUrl: '#',
      summary: contentItem.finalText ? contentItem.finalText.substring(0, 200) + '...' : '',
      updatedAt: contentItem.createdAt,
    }
  }, [contentItem])

  if (!contentItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Content Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The content you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/content')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content
          </Button>
        </div>
      </div>
    )
  }

  const handleSaveNotes = () => {
    setSavedNotes(notes)
    setIsEditingNotes(false)
    // TODO: Save notes to database
  }

  const handleCancelEdit = () => {
    setNotes(savedNotes)
    setIsEditingNotes(false)
  }

  const handleDownload = () => {
    const textToDownload = contentItem.finalText || contentItem.draft
    const content = `
      ${contentItem.title}

      Type: ${contentItem.type}
      Status: ${contentItem.status}
      Created: ${new Date(contentItem.createdAt).toLocaleDateString()}
      ${contentItem.client ? `Client: ${contentItem.client}` : ''}
      ${project ? `Project: ${project.name}` : ''}

      ----------------------------------------

      ${textToDownload}
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${contentItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const displayContent = contentItem.finalText || contentItem.draft

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/content')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#015e32]" />
                <h1 className="text-2xl font-bold text-foreground">{contentItem.title}</h1>
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-[#015e32] hover:bg-[#01753d] text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Quick Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {project && (
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>
                  <span className="text-foreground font-medium">{project.name}</span>
                </span>
              </div>
            )}
            {contentItem.client && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{contentItem.client}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(contentItem.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Info Card */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Content Information</CardTitle>
                <CardDescription>Metadata and generation details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Content Type
                    </label>
                    <p className="mt-1 text-foreground font-medium">{contentItem.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={contentItem.status === 'Published' ? 'default' : 'outline'}
                        className={contentItem.status === 'Published' ? 'bg-emerald-600' : ''}
                      >
                        {contentItem.status}
                      </Badge>
                    </div>
                  </div>
                  {contentItem.client && (
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Client
                      </label>
                      <p className="mt-1 text-foreground font-medium">{contentItem.client}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Created Date
                    </label>
                    <p className="mt-1 text-foreground font-medium">
                      {new Date(contentItem.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {contentItem.sourceProjectId && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Source Project
                      </label>
                      <p className="mt-1 text-foreground font-medium">
                        {project ? (
                          <button
                            onClick={() => router.push(`/projects/${project.id}`)}
                            className="text-[#015e32] hover:text-[#fd8216] transition-colors underline"
                          >
                            {project.name}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">Not linked to any project</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructions Card (if exists) */}
            {contentItem.finalText && contentItem.draft && (
              <Card>
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg font-semibold">Original Instructions</CardTitle>
                  <CardDescription>The prompt used to generate this content</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="bg-muted border border-border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {contentItem.draft}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Content Card */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">
                  {contentItem.finalText ? 'Generated Content' : 'Content'}
                </CardTitle>
                <CardDescription>Full content preview</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {displayContent}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notes & TRS Brain (1/3 width) */}
          <div className="space-y-6">
            {/* Notes Card */}
            <Card>
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Notes</CardTitle>
                    <CardDescription className="text-xs">Add internal notes about this content</CardDescription>
                  </div>
                  {!isEditingNotes && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingNotes(true)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this content, performance tracking, distribution channels, etc."
                      rows={8}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        className="flex-1 bg-[#015e32] hover:bg-[#01753d] text-white"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[100px]">
                    {savedNotes ? (
                      <p className="text-sm text-foreground whitespace-pre-wrap">{savedNotes}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes yet. Click Edit to add notes about this content.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TRS Brain Chat Card */}
            <TRSBrainChat documentContext={documentContext} />
          </div>
        </div>
      </div>
    </div>
  )
}
