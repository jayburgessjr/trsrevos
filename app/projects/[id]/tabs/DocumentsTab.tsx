'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Eye, Download } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { ProjectWorkspaceProject, ProjectDocument } from '../ProjectWorkspace'

interface DocumentsTabProps {
  project: ProjectWorkspaceProject
  documents: ProjectDocument[]
}

export default function DocumentsTab({ project, documents }: DocumentsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Draft' | 'Review' | 'Approved'>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Get unique document types
  const documentTypes = Array.from(new Set(documents.map((d) => d.type)))

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    const matchesType = filterType === 'all' || doc.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateDocument = () => {
    // Redirect to documents page with project context
    window.location.href = `/documents?project=${project.id}`
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleCreateDocument}
          className="bg-[#015e32] hover:bg-[#01753d]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Review">Review</option>
          <option value="Approved">Approved</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Types</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Table */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No documents found</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {documents.length === 0
              ? 'Get started by creating your first document'
              : 'Try adjusting your search or filters'}
          </p>
          {documents.length === 0 && (
            <Button
              onClick={handleCreateDocument}
              className="bg-[#015e32] hover:bg-[#01753d]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <Link href={`/documents/${doc.id}`} className="hover:underline flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doc.title}
                  </Link>
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>
                  <Badge variant={doc.status === 'Approved' ? 'default' : 'outline'}>
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>v{doc.version}</TableCell>
                <TableCell>{new Date(doc.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {doc.tags && doc.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {doc.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                        File
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
