'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpDown } from 'lucide-react'

import { useRevosData } from '@/app/providers/RevosDataProvider'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Textarea } from '@/ui/textarea'

const documentTypes = [
  'Audit Report',
  'Intervention Blueprint',
  'Proposal',
  'Enablement Asset',
  'Onboarding Resource',
  'Framework Resource',
  'Revenue Modeling Resource'
]
const documentStatuses = ['Draft', 'In Review', 'Final'] as const

type SortField = 'title' | 'type' | 'status' | 'version' | 'updatedAt'
type SortDirection = 'asc' | 'desc'

type FormState = {
  title: string
  projectId: string
  type: string
  description: string
  fileUrl: string
  tags: string
  uploadedFile: File | null
}

const initialForm: FormState = {
  title: '',
  projectId: 'no-project',
  type: documentTypes[0],
  description: '',
  fileUrl: '',
  tags: '',
  uploadedFile: null,
}

export default function DocumentsPageClient() {
  const { documents, projects, createDocument, updateDocumentStatus, updateDocumentProject } = useRevosData()
  const [form, setForm] = useState<FormState>(initialForm)
  const [filter, setFilter] = useState<string>('All')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredDocuments = useMemo(() => {
    let filtered = filter === 'All' ? documents : documents.filter((document) => document.status === filter)

    // Sort the documents
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'type':
          aValue = a.type.toLowerCase()
          bValue = b.type.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'version':
          aValue = a.version ?? 0
          bValue = b.version ?? 0
          break
        case 'updatedAt':
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [documents, filter, sortField, sortDirection])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim()) return

    let fileContent = ''

    // Read file content if a file was uploaded
    if (form.uploadedFile) {
      const reader = new FileReader()
      fileContent = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(form.uploadedFile!)
      })
    }

    createDocument({
      title: form.title.trim(),
      description: form.uploadedFile ? fileContent : form.description.trim(),
      projectId: form.projectId === 'no-project' ? 'unassigned' : form.projectId,
      type: form.type,
      fileUrl: form.uploadedFile ? `#${form.uploadedFile.name}` : '#',
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

  const handleProjectChange = (documentId: string, projectId: string) => {
    updateDocumentProject({ id: documentId, projectId })
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground mt-1">Attach deliverables, blueprints, and playbooks to projects</p>
        </div>
      </div>

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
                  value={form.projectId}
                  onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                >
                  <option value="no-project">No Project (Resource)</option>
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
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upload File (.md, .csv)</label>
                <Input
                  type="file"
                  accept=".md,.csv"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    setForm((current) => ({ ...current, uploadedFile: file }))
                  }}
                  className="cursor-pointer"
                />
                {form.uploadedFile && (
                  <p className="text-xs text-emerald-600">Selected: {form.uploadedFile.name}</p>
                )}
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
                <TableHead className="px-6">
                  <button
                    onClick={() => toggleSort('title')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    Title
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Link to Project</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('type')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('status')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('version')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    Version
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('updatedAt')}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white"
                  >
                    Last Modified
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    No documents found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="px-6">
                      <div className="font-medium text-foreground">
                        <Link
                          href={`/documents/${document.id}`}
                          className="hover:text-emerald-700 text-foreground transition-colors"
                        >
                          {document.title}
                        </Link>
                      </div>
                      <Link
                        href={`/documents/${document.id}`}
                        className="text-xs text-emerald-600 underline hover:text-emerald-700 transition-colors"
                      >
                        Open page
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={document.projectId || ''}
                        onChange={(event) => handleProjectChange(document.id, event.target.value)}
                      >
                        <option value="">Unlinked</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
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
                    <TableCell className="text-xs text-gray-500 dark:text-neutral-400">
                      {document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : '—'}
                    </TableCell>
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
