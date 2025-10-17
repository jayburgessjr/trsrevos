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

const documentTypes = ['Audit Report', 'Intervention Blueprint', 'Proposal', 'Enablement Asset']
const documentStatuses = ['Draft', 'In Review', 'Final'] as const

type FormState = {
  title: string
  projectId: string
  type: string
  description: string
  fileUrl: string
  tags: string
}

const initialForm: FormState = {
  title: '',
  projectId: '',
  type: documentTypes[0],
  description: '',
  fileUrl: '',
  tags: '',
}

export default function DocumentsPageClient() {
  const { documents, projects, createDocument, updateDocumentStatus } = useRevosData()
  const [form, setForm] = useState<FormState>(initialForm)
  const [filter, setFilter] = useState<string>('All')

  const filteredDocuments = useMemo(() => {
    if (filter === 'All') return documents
    return documents.filter((document) => document.status === filter)
  }, [documents, filter])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim()) return
    createDocument({
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: form.projectId || projects[0]?.id || 'unassigned',
      type: form.type,
      fileUrl: form.fileUrl || '#',
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    setForm(initialForm)
  }

  const handleStatusChange = (documentId: string, status: string) => {
    if (!documentStatuses.includes(status as (typeof documentStatuses)[number])) return
    updateDocumentStatus({ id: documentId, status: status as (typeof documentStatuses)[number] })
  }

  const tagCloud = useMemo(() => {
    return documents.reduce<Record<string, number>>((acc, doc) => {
      doc.tags.forEach((tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1
      })
      return acc
    }, {})
  }, [documents])

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Add Document</CardTitle>
            <CardDescription>Attach deliverables, blueprints, and playbooks to projects.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Revenue Blueprint – Client"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project</label>
                <Select
                  value={form.projectId || projects[0]?.id || ''}
                  onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</label>
                <Select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">File URL</label>
                <Input
                  value={form.fileUrl}
                  onChange={(event) => setForm((current) => ({ ...current, fileUrl: event.target.value }))}
                  placeholder="https://storage.trs.dev/..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags</label>
                <Input
                  value={form.tags}
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="Comma separated"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="What does this document deliver?"
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  Upload Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            <CardDescription>Focus on drafts, reviews, or final outputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
            <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="All">All Documents</option>
              {documentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Documents</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{documents.length}</p>
            </div>
            <div className="space-y-2">
              {Object.entries(tagCloud).map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm">
                  <span className="text-sm text-muted-foreground">#{tag}</span>
                  <Badge variant="outline">
                    {count}
                  </Badge>
                </div>
              ))}
              {Object.keys(tagCloud).length === 0 && <p className="text-xs text-muted-foreground">No tags yet.</p>}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Document Library</CardTitle>
          <CardDescription>Version-controlled record of every deliverable.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6">Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No documents found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="px-6">
                      <div className="font-medium text-foreground">{document.title}</div>
                      <Link href={document.fileUrl} className="text-xs text-emerald-600 underline">
                        Open file
                      </Link>
                    </TableCell>
                    <TableCell>{projects.find((project) => project.id === document.projectId)?.name ?? 'Unlinked'}</TableCell>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>
                      <Select
                        value={document.status}
                        onChange={(event) => handleStatusChange(document.id, event.target.value)}
                      >
                        {documentStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>v{document.version}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{document.summary}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
