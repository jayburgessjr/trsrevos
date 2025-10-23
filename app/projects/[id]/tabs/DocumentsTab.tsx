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
        return 'bg-yellow-100 text-yellow-800'
      case 'Review':
        return 'bg-blue-100 text-blue-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateDocument = () => {
    // TODO: Implement document creation
    alert('Document creation coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Documents</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateDocument}
          className="flex items-center gap-2 px-4 py-2 bg-[#fd8216] hover:bg-[#e67412] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
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
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">
            {documents.length === 0
              ? 'Get started by creating your first document'
              : 'Try adjusting your search or filters'}
          </p>
          {documents.length === 0 && (
            <button
              onClick={handleCreateDocument}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#fd8216] hover:bg-[#e67412] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#fd8216]" />
                    <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{doc.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Type:</span> {doc.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Version:</span> {doc.version}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Updated:</span>{' '}
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {doc.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {doc.summary && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{doc.summary}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#fd8216] hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Documents</div>
          <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {documents.filter((d) => d.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">In Review</div>
          <div className="text-2xl font-bold text-blue-600">
            {documents.filter((d) => d.status === 'Review').length}
          </div>
        </div>
      </div>
    </div>
  )
}
