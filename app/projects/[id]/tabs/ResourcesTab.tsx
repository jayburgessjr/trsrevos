'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Plus, Search, Filter, ExternalLink, Tag } from 'lucide-react'
import type { ProjectWorkspaceProject, ProjectResource } from '../ProjectWorkspace'

interface ResourcesTabProps {
  project: ProjectWorkspaceProject
  resources: ProjectResource[]
}

export default function ResourcesTab({ project, resources }: ResourcesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Get unique resource types
  const resourceTypes = Array.from(new Set(resources.map((r) => r.type)))

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || resource.type === filterType

    return matchesSearch && matchesType
  })

  const handleCreateResource = () => {
    // TODO: Implement resource creation
    alert('Resource creation coming soon!')
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Resources</h2>
          <p className="mt-1 text-sm text-green-200">
            {filteredResources.length} of {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateResource}
          className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
        >
          <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
          Add Resource
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-200" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-orange-500 bg-green-950 pl-10 pr-4 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-orange-500 bg-green-950 px-4 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="all">All Types</option>
          {resourceTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-orange-500 bg-green-900 py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-white" />
          <h3 className="mb-2 text-lg font-medium text-white">No resources found</h3>
          <p className="mb-4 text-green-200">
            {resources.length === 0
              ? 'Get started by adding your first resource'
              : 'Try adjusting your search or filters'}
          </p>
          {resources.length === 0 && (
            <button
              onClick={handleCreateResource}
              className="group inline-flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Plus className="h-5 w-5 text-white transition-colors group-hover:text-green-900" />
              Add Resource
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-lg border border-orange-500 bg-green-800 p-6 transition-shadow hover:bg-orange-500"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-white" />
                  <h3 className="text-lg font-semibold text-white">{resource.name}</h3>
                </div>
                <span className="rounded-full border border-orange-500 bg-green-700 px-2 py-1 text-xs font-medium text-white">
                  {resource.type}
                </span>
              </div>

              <p className="mb-3 text-green-100">{resource.description}</p>

              {resource.tags && resource.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {resource.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 rounded border border-orange-500 bg-green-700 px-2 py-1 text-xs text-white"
                    >
                      <Tag className="h-3 w-3 text-white" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-3 flex items-center gap-2 text-sm text-green-100">
                <span className="font-medium text-white">Updated:</span>{' '}
                {new Date(resource.updated_at).toLocaleDateString()}
              </div>

              {resource.link && (
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
                >
                  <ExternalLink className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
                  Open Resource
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resource Statistics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Total Resources</div>
          <div className="text-2xl font-bold text-white">{resources.length}</div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">Resource Types</div>
          <div className="text-2xl font-bold text-white">{resourceTypes.length}</div>
        </div>
        <div className="rounded-lg border border-orange-500 bg-green-800 p-4">
          <div className="mb-1 text-sm text-green-200">With Links</div>
          <div className="text-2xl font-bold text-white">
            {resources.filter((r) => r.link).length}
          </div>
        </div>
      </div>
    </div>
  )
}
