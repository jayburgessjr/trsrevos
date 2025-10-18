'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Textarea } from '@/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Loader2, Download, Copy, Eye } from 'lucide-react'
import type { ContentItem } from '@/lib/revos/types'

const contentTypes = ['Case Study', 'Post', 'Email', 'Slide'] as const
const contentStatuses = ['Draft', 'Published'] as const

type FormState = {
  title: string
  type: (typeof contentTypes)[number]
  sourceProjectId: string
  draft: string
}

const initialForm: FormState = {
  title: '',
  type: 'Case Study',
  sourceProjectId: '',
  draft: '',
}

export default function ContentPageClient() {
  const { content, projects, agents, automationLogs, createContent, updateContentStatus } = useRevosData()
  const [form, setForm] = useState<FormState>(initialForm)
  const [generating, setGenerating] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const stats = useMemo(() => {
    return content.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [content])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim() || !form.draft.trim()) return

    setGenerating(true)

    try {
      // Call OpenAI API to generate content
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          instructions: form.draft,
          sourceProject: form.sourceProjectId
            ? projects.find((p) => p.id === form.sourceProjectId)?.name
            : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'Failed to generate content')
        return
      }

      // Create content with generated text as finalText
      createContent({
        title: form.title.trim(),
        type: form.type,
        sourceProjectId: form.sourceProjectId || undefined,
        draft: form.draft.trim(),
        finalText: data.content,
      })

      setForm(initialForm)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleStatusToggle = (id: string, status: 'Draft' | 'Published', draft: string) => {
    const nextStatus = status === 'Draft' ? 'Published' : 'Draft'
    updateContentStatus({ id, status: nextStatus, finalText: nextStatus === 'Published' ? draft : undefined })
  }

  const handleViewContent = (item: ContentItem) => {
    setSelectedContent(item)
    setViewDialogOpen(true)
  }

  const handleCopyContent = (item: ContentItem) => {
    const textToCopy = item.finalText || item.draft
    navigator.clipboard.writeText(textToCopy)
    alert('Content copied to clipboard!')
  }

  const handleDownloadContent = (item: ContentItem) => {
    const textToDownload = item.finalText || item.draft
    const blob = new Blob([textToDownload], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Create Content</CardTitle>
            <CardDescription>Draft case studies, emails, and assets from delivery outputs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Case Study: Client Impact"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</label>
                <Select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as FormState['type'] }))
                  }
                >
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source Project</label>
                <Select
                  value={form.sourceProjectId || projects[0]?.id || ''}
                  onChange={(event) => setForm((current) => ({ ...current, sourceProjectId: event.target.value }))}
                >
                  <option value="">Standalone</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instructions</label>
                <Textarea
                  value={form.draft}
                  onChange={(event) => setForm((current) => ({ ...current, draft: event.target.value }))}
                  placeholder="Describe what content you want to generate... e.g., 'Write a case study highlighting the key wins, include a customer quote about ROI impact'"
                  rows={6}
                  required
                  disabled={generating}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto bg-[#015e32] hover:bg-[#01753d]" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Pipeline Snapshot</CardTitle>
            <CardDescription>Monitor publication readiness and automation triggers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
            {contentStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm">
                <span className="font-medium text-muted-foreground">{status}</span>
                <Badge variant="outline">
                  {stats[status] ?? 0}
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Automation Runs</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{automationLogs.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Publishing Agents</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {agents.filter((agent) => agent.defaultOutputType === 'Content').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Content Library</CardTitle>
          <CardDescription>Track derivative assets across the delivery lifecycle.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No content has been generated yet.
                  </TableCell>
                </TableRow>
              ) : (
                content
                  .slice()
                  .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-6">
                        <button
                          onClick={() => handleViewContent(item)}
                          className="text-left hover:underline"
                        >
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</div>
                        </button>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={item.status === 'Published' ? 'border-emerald-500 text-emerald-600' : ''}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.sourceProjectId
                          ? projects.find((project) => project.id === item.sourceProjectId)?.name ?? 'Unlinked'
                          : 'Standalone'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewContent(item)}
                            title="View content"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyContent(item)}
                            title="Copy content"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadContent(item)}
                            title="Download content"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Content Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedContent.title}</DialogTitle>
                <DialogDescription>
                  {selectedContent.type} • Created {new Date(selectedContent.createdAt).toLocaleDateString()}
                  {selectedContent.sourceProjectId && (
                    <> • {projects.find((p) => p.id === selectedContent.sourceProjectId)?.name || 'Unknown Project'}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedContent.finalText ? (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Generated Content
                      </h3>
                      <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                        {selectedContent.finalText}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Original Instructions
                      </h3>
                      <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                        {selectedContent.draft}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Content
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                      {selectedContent.draft}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyContent(selectedContent)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDownloadContent(selectedContent)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  type="button"
                  className="bg-[#015e32] hover:bg-[#01753d]"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
