'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FolderOpen, Plus, Search, Eye, Edit, FileText } from 'lucide-react'
import type { ProjectWorkspaceProject, ProjectContent } from '../ProjectWorkspace'

interface ContentTabProps {
  project: ProjectWorkspaceProject
  content: ProjectContent[]
}

export default function ContentTab({ project, content }: ContentTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'Draft' | 'Review' | 'Published'>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Get unique content types
  const contentTypes = Array.from(new Set(content.map((c) => c.type)))

  // Filter content
  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesType = filterType === 'all' || item.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: ProjectContent['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Review':
        return 'bg-blue-100 text-blue-800'
      case 'Published':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateContent = () => {
    // TODO: Implement content creation
    alert('Content creation coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Content</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredContent.length} of {content.length} content piece{content.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateContent}
          className="flex items-center gap-2 px-4 py-2 bg-[#fd8216] hover:bg-[#e67412] text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Content
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
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
          <option value="Published">Published</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
        >
          <option value="all">All Types</option>
          {contentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-500 mb-4">
            {content.length === 0
              ? 'Get started by creating your first content piece'
              : 'Try adjusting your search or filters'}
          </p>
          {content.length === 0 && (
            <button
              onClick={handleCreateContent}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#fd8216] hover:bg-[#e67412] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Content
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-[#fd8216]" />
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Type:</span> {item.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Updated:</span>{' '}
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Content Preview */}
                  {item.final_text && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-500 mb-2">Published Content Preview</div>
                      <p className="text-sm text-gray-700 line-clamp-3">{item.final_text}</p>
                    </div>
                  )}

                  {!item.final_text && item.draft && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-lg">
                      <div className="text-xs font-medium text-yellow-700 mb-2">Draft Preview</div>
                      <p className="text-sm text-gray-700 line-clamp-3">{item.draft}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/content/${item.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#fd8216] hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/content/${item.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Content</div>
          <div className="text-2xl font-bold text-gray-900">{content.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Published</div>
          <div className="text-2xl font-bold text-green-600">
            {content.filter((c) => c.status === 'Published').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">In Review</div>
          <div className="text-2xl font-bold text-blue-600">
            {content.filter((c) => c.status === 'Review').length}
          </div>
        </div>
      </div>
    </div>
  )
}
