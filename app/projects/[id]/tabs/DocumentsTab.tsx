'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Filter, ExternalLink, Eye, Download } from 'lucide-react'
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
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    const matchesType = filterType === 'all' || doc.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: ProjectDocument['status']) => {
    switch (status) {
      case 'Draft':
        return 'border border-orange-500 bg-green-700 text-white'
      case 'Review':
        return 'border border-orange-500 bg-green-800 text-white'
      case 'Approved':
        return 'border border-orange-500 bg-green-600 text-white'
      default:
        return 'border border-orange-500 bg-green-800 text-white'
    }
  }

  const handleCreateDocument = () => {
    // TODO: Implement document creation
    alert('Document creation coming soon!')
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Documents</h2>
          <p className="mt-1 text-sm text-green-200">
            {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateDocument}
          className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
        >
          <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
          New Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-200" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-orange-500 bg-green-950 pl-10 pr-4 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="rounded-lg border border-orange-500 bg-green-950 px-4 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
          className="rounded-lg border border-orange-500 bg-green-950 px-4 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">All Types</option>
          {documentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-orange-500 bg-green-900 py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-white" />
          <h3 className="mb-2 text-lg font-medium text-white">No documents found</h3>
          <p className="mb-4 text-green-200">
            {documents.length === 0
              ? 'Get started by creating your first document'
              : 'Try adjusting your search or filters'}
          </p>
          {documents.length === 0 && (
            <button
              onClick={handleCreateDocument}
              className="group inline-flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
              Create Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-orange-500 bg-green-800 p-6 transition-shadow hover:bg-orange-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>

                  <p className="mb-3 text-green-100">{doc.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-green-100">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-white">Type:</span> {doc.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-white">Version:</span> {doc.version}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-white">Updated:</span>{' '}
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded border border-orange-500 bg-green-700 px-2 py-1 text-xs text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                  >
                    <Eye className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
                    View
                  </Link>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                    >
                      <Download className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
                      File
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Total Documents</div>
          <div className="text-2xl font-bold text-white">{documents.length}</div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Approved</div>
          <div className="text-2xl font-bold text-white">
            {documents.filter((d) => d.status === 'Approved').length}
          </div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">In Review</div>
          <div className="text-2xl font-bold text-white">
            {documents.filter((d) => d.status === 'Review').length}
          </div>
        </div>
      </div>
    </div>
  )
}
