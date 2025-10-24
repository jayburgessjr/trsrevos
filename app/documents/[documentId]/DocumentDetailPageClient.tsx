'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, MessageSquare, Sparkles, Tag, UserCircle } from 'lucide-react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Textarea } from '@/ui/textarea'

import type { Document } from '@/lib/revos/types'

type DocumentDetailPageClientProps = {
  documentId: string
}

type Comment = {
  id: string
  author: string
  role: string
  timestamp: string
  message: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const createDownloadableHtml = (document: Document) => {
  return `
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
              background: #ffffff;
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
            <div class="meta-item"><strong>Version:</strong> ${document.version}</div>
            <div class="meta-item"><strong>Last Updated:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</div>
            ${
              document.tags.length > 0
                ? `<div class="meta-item"><strong>Tags:</strong> ${document.tags
                    .map((tag) => `<span class="tag">${tag}</span>`)
                    .join(' ')}</div>`
                : ''
            }
          </div>
          <div class="content">
            ${document.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
          </div>
          ${
            document.summary
              ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;"><strong>Summary:</strong><br>${
                  document.summary
                }</div>`
              : ''
          }
        </body>
      </html>
    `
}

const formatParagraphs = (description: string) => {
  return description.split('\n\n').map((paragraph, index) => {
    const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />')
    return (
      <p
        key={`${paragraph.slice(0, 20)}-${index}`}
        className="text-sm leading-relaxed text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    )
  })
}

const generateAssistantResponse = (document: Document, prompt: string) => {
  const lowerPrompt = prompt.toLowerCase()
  if (lowerPrompt.includes('summary')) {
    return document.summary
      ? `Here’s the executive summary: ${document.summary}`
      : 'This document does not have a stored summary yet. Focus on the key paragraphs in the brief.'
  }

  if (lowerPrompt.includes('next step') || lowerPrompt.includes('next steps')) {
    return `Recommend positioning the next step around reinforcing the ${document.type.toLowerCase()} with client stakeholders and aligning execution owners for version ${document.version + 1}.`
  }

  return `The document "${document.title}" is currently ${document.status.toLowerCase()} and was last updated on ${new Date(
    document.updatedAt,
  ).toLocaleDateString()}. ${document.summary || 'Review the detailed narrative in the left column for context.'}`
}

export default function DocumentDetailPageClient({ documentId }: DocumentDetailPageClientProps) {
  const { documents, projects } = useRevosData()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatMessage, setChatMessage] = useState('')

  const document = useMemo(() => documents.find((item) => item.id === documentId), [documents, documentId])
  const project = useMemo(
    () => (document ? projects.find((proj) => proj.id === document.projectId) : undefined),
    [document, projects],
  )

  useEffect(() => {
    if (!document) {
      setComments([])
      setChatHistory([])
      return
    }

    setComments([
      {
        id: `${document.id}-comment-1`,
        author: 'Morgan Black',
        role: 'Revenue Scientist',
        timestamp: '2 hours ago',
        message: `Please ensure the ${document.type.toLowerCase()} callouts tie back to the ${project?.name ?? 'engagement'} revenue targets.`,
      },
      {
        id: `${document.id}-comment-2`,
        author: 'Avery Lane',
        role: 'Engagement Manager',
        timestamp: 'Yesterday',
        message: 'Add a section on stakeholder readiness before we circulate to the client leadership team.',
      },
      {
        id: `${document.id}-comment-3`,
        author: 'Jordan Wells',
        role: 'Client Partner',
        timestamp: '2 days ago',
        message: 'Can we link supporting data sources for the activation metrics in appendix A?',
      },
    ])

    setChatHistory([
      {
        role: 'assistant',
        content: `Hi! I’m the TRS Brain. Ask anything about "${document.title}" and I’ll point you to the right insight.`,
      },
    ])
  }, [document, project?.name])

  const handleDownload = () => {
    if (!document) return
    const content = createDownloadableHtml(document)
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleAddComment = () => {
    const trimmed = newComment.trim()
    if (!trimmed) return

    setComments((previous) => [
      {
        id: `${documentId}-comment-${Date.now()}`,
        author: 'You',
        role: 'Contributor',
        timestamp: 'Just now',
        message: trimmed,
      },
      ...previous,
    ])
    setNewComment('')
  }

  const handleSendMessage = () => {
    const trimmed = chatMessage.trim()
    if (!trimmed || !document) return

    setChatHistory((previous) => {
      const updated = [...previous, { role: 'user', content: trimmed }]
      const assistantResponse = generateAssistantResponse(document, trimmed)
      return [...updated, { role: 'assistant', content: assistantResponse }]
    })
    setChatMessage('')
  }

  if (!document) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="w-fit px-0 text-muted-foreground hover:text-foreground">
          <Link href="/documents" className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to documents
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Document not found</CardTitle>
            <CardDescription>The requested document is no longer available. Select a record from the library to continue.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" asChild className="w-fit px-0 text-muted-foreground hover:text-foreground">
            <Link href="/documents" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to documents
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{document.title}</h1>
          <p className="text-sm text-muted-foreground">
            {project ? (
              <>
                Linked to{' '}
                <Link href={`/projects/${project.id}`} className="text-emerald-600 hover:text-emerald-700">
                  {project.name}
                </Link>
              </>
            ) : (
              'No project link assigned'
            )}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <a href={document.fileUrl} target="_blank" rel="noreferrer">
              <MessageSquare className="mr-2 h-4 w-4" />
              View source file
            </a>
          </Button>
          <Button onClick={handleDownload} className="bg-[#015e32] hover:bg-[#01753d] text-white">
            <Download className="mr-2 h-4 w-4" />
            Download HTML
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="h-fit">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg font-semibold text-foreground">Document briefing</CardTitle>
            <CardDescription>Complete narrative for this deliverable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</p>
                <p className="text-sm font-medium text-foreground">{document.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="text-sm font-medium text-foreground">{document.status}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Version</p>
                <p className="text-sm font-medium text-foreground">v{document.version}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(document.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project</p>
                <p className="text-sm font-medium text-foreground">{project?.name ?? 'Unassigned'}</p>
              </div>
              {document.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {document.summary && (
              <div className="rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Executive summary</p>
                <p className="mt-2 text-sm text-muted-foreground">{document.summary}</p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full content</p>
              <div className="space-y-4">{formatParagraphs(document.description)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="h-fit">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-[#fd8216]" />
                Comments
              </CardTitle>
              <CardDescription>Coordinate feedback before publishing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Leave a note for the team..."
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Add comment
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet. Start the conversation above.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">{comment.role}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="mt-3 text-sm text-foreground">{comment.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-[#fd8216]" />
                TRS Brain
              </CardTitle>
              <CardDescription>Ask for context, next steps, or summaries.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 py-6">
              <div className="flex-1 space-y-3 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">TRS Brain is ready when you are.</p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-[#015e32] text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder={`Ask about ${document.title}...`}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="bg-[#015e32] hover:bg-[#01753d] text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
