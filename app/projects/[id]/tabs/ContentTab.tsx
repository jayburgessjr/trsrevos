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
        return 'border border-orange-500 bg-green-700 text-white'
      case 'Review':
        return 'border border-orange-500 bg-green-800 text-white'
      case 'Published':
        return 'border border-orange-500 bg-green-600 text-white'
      default:
        return 'border border-orange-500 bg-green-800 text-white'
    }
  }

  const handleCreateContent = () => {
    // TODO: Implement content creation
    alert('Content creation coming soon!')
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Content</h2>
          <p className="mt-1 text-sm text-green-200">
            {filteredContent.length} of {content.length} content piece{content.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateContent}
          className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
        >
          <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
          New Content
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-200" />
          <input
            type="text"
            placeholder="Search content..."
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
          <option value="Published">Published</option>
        </select>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-orange-500 bg-green-950 px-4 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
        <div className="rounded-lg border-2 border-dashed border-orange-500 bg-green-900 py-12 text-center">
          <FolderOpen className="mx-auto mb-4 h-12 w-12 text-white" />
          <h3 className="mb-2 text-lg font-medium text-white">No content found</h3>
          <p className="mb-4 text-green-200">
            {content.length === 0
              ? 'Get started by creating your first content piece'
              : 'Try adjusting your search or filters'}
          </p>
          {content.length === 0 && (
            <button
              onClick={handleCreateContent}
              className="group inline-flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
              Create Content
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-orange-500 bg-green-800 p-6 transition-shadow hover:bg-orange-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white" />
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-green-100">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-white">Type:</span> {item.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-white">Updated:</span>{' '}
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Content Preview */}
                  {item.final_text && (
                    <div className="mt-3 rounded-lg border border-orange-500 bg-green-900 p-4">
                      <div className="mb-2 text-xs font-medium text-green-100">Published Content Preview</div>
                      <p className="text-sm text-green-100 line-clamp-3">{item.final_text}</p>
                    </div>
                  )}

                  {!item.final_text && item.draft && (
                    <div className="mt-3 rounded-lg border border-orange-500 bg-green-900 p-4">
                      <div className="mb-2 text-xs font-medium text-green-100">Draft Preview</div>
                      <p className="text-sm text-green-100 line-clamp-3">{item.draft}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/content/${item.id}`}
                    className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                  >
                    <Eye className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
                    View
                  </Link>
                  <Link
                    href={`/content/${item.id}/edit`}
                    className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                  >
                    <Edit className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Total Content</div>
          <div className="text-2xl font-bold text-white">{content.length}</div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Published</div>
          <div className="text-2xl font-bold text-white">
            {content.filter((c) => c.status === 'Published').length}
          </div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">In Review</div>
          <div className="text-2xl font-bold text-white">
            {content.filter((c) => c.status === 'Review').length}
          </div>
        </div>
      </div>
    </div>
  )
}
