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
import CommentThread from '@/components/comments/CommentThread'

type DocumentDetailClientProps = {
  documentId: string
}

export default function DocumentDetailClient({ documentId }: DocumentDetailClientProps) {
  const router = useRouter()
  const { documents, projects } = useRevosData()
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [savedNotes, setSavedNotes] = useState('')

  const document = useMemo(() => {
    return documents.find((doc) => doc.id === documentId)
  }, [documents, documentId])

  const project = useMemo(() => {
    if (!document?.projectId) return null
    return projects.find((proj) => proj.id === document.projectId)
  }, [document, projects])

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Document Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The document you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => router.push('/documents')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
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

  const handleDownloadHTML = () => {
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${document.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #015e32;
              border-bottom: 3px solid #fd8216;
              padding-bottom: 10px;
            }
            .meta {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .meta-item {
              margin: 5px 0;
            }
            .content {
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .tag {
              display: inline-block;
              background: #015e32;
              color: white;
              padding: 3px 8px;
              border-radius: 3px;
              margin: 2px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${document.title}</h1>
          <div class="meta">
            <div class="meta-item"><strong>Type:</strong> ${document.type}</div>
            <div class="meta-item"><strong>Status:</strong> ${document.status}</div>
            <div class="meta-item"><strong>Version:</strong> v${document.version}</div>
            <div class="meta-item"><strong>Last Updated:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</div>
            ${document.tags.length > 0 ? `<div class="meta-item"><strong>Tags:</strong> ${document.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>` : ''}
          </div>
          <div class="content">
            ${document.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
          </div>
          ${document.summary ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;"><strong>Summary:</strong><br>${document.summary}</div>` : ''}
        </body>
      </html>
    `

    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/documents')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#015e32]" />
                <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
              </div>
            </div>
            <Button
              onClick={handleDownloadHTML}
              className="flex items-center gap-2 bg-[#015e32] hover:bg-[#01753d] text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Quick Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>
                {project ? (
                  <span className="text-foreground font-medium">{project.name}</span>
                ) : (
                  <span>Unlinked</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>v{document.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Document Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info Card */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Document Information</CardTitle>
                <CardDescription>Metadata and version details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Document Type
                    </label>
                    <p className="mt-1 text-foreground font-medium">{document.type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          document.status === 'Final'
                            ? 'default'
                            : document.status === 'In Review'
                            ? 'warning'
                            : 'outline'
                        }
                      >
                        {document.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Version
                    </label>
                    <p className="mt-1 text-foreground font-medium">v{document.version}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Last Updated
                    </label>
                    <p className="mt-1 text-foreground font-medium">
                      {new Date(document.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Linked Project
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
                  {document.tags.length > 0 && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tags
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-[#015e32]/10 text-[#015e32]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Content Card */}
            <Card>
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg font-semibold">Document Content</CardTitle>
                <CardDescription>Full formatted document preview</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {document.description.split('\n\n').map((paragraph, index) => {
                    // Handle bold markdown
                    const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    return (
                      <p
                        key={index}
                        className="mb-4 text-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    )
                  })}
                </div>
                {document.summary && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      AI Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{document.summary}</p>
                  </div>
                )}
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
                    <CardDescription className="text-xs">Add internal notes about this document</CardDescription>
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
                      placeholder="Add notes about this document, tracking information, usage context, etc."
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
                        No notes yet. Click Edit to add notes about this document.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TRS Brain Chat Card */}
            <TRSBrainChat documentContext={document} />

            {/* Document Discussion */}
            <CommentThread
              documentId={document.id}
              title="Document Discussion"
              description="Discuss this document with your team - ask questions, share feedback, and collaborate"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
