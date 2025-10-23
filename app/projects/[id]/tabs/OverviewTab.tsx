'use client'

import { useState } from 'react'
import { Calendar, Users, Target, DollarSign, Edit2, Save, X } from 'lucide-react'
import type { ProjectWorkspaceProject, ProjectType, ProjectStatus } from '../ProjectWorkspace'

interface OverviewTabProps {
  project: ProjectWorkspaceProject
}

// Document templates by project type
const PROJECT_TYPE_TEMPLATES: Record<ProjectType, { name: string; description: string; type: string }[]> = {
  Audit: [
    { name: 'Revenue Audit Report', description: 'Comprehensive revenue analysis and findings', type: 'Audit Report' },
    { name: 'Data Requirements Checklist', description: 'Required data sources and access needed', type: 'Checklist' },
    { name: 'QRA Analysis', description: 'Quarterly revenue analysis deep-dive', type: 'Analysis' },
    { name: 'Executive Summary', description: 'High-level findings and recommendations', type: 'Summary' },
    { name: 'Action Items Tracker', description: 'Recommended actions and timeline', type: 'Tracker' },
  ],
  Blueprint: [
    { name: 'Strategic Blueprint', description: 'Complete revenue strategy document', type: 'Blueprint' },
    { name: 'Implementation Roadmap', description: '90-day execution plan', type: 'Roadmap' },
    { name: 'Process Documentation', description: 'Standard operating procedures', type: 'Documentation' },
    { name: 'Metrics Dashboard Spec', description: 'KPIs and tracking requirements', type: 'Specification' },
    { name: 'Team Playbook', description: 'Team roles and responsibilities', type: 'Playbook' },
  ],
  Advisory: [
    { name: 'Monthly Advisory Report', description: 'Regular progress and insights', type: 'Report' },
    { name: 'Meeting Notes Template', description: 'Structured meeting documentation', type: 'Notes' },
    { name: 'Strategy Recommendations', description: 'Ongoing strategic guidance', type: 'Recommendations' },
    { name: 'Performance Review', description: 'Quarterly performance analysis', type: 'Review' },
    { name: 'Growth Opportunities', description: 'Identified opportunities and next steps', type: 'Analysis' },
  ],
  Internal: [
    { name: 'Project Scope', description: 'Internal project definition', type: 'Scope' },
    { name: 'Resource Allocation', description: 'Team and resource planning', type: 'Planning' },
    { name: 'Progress Tracker', description: 'Internal milestones and status', type: 'Tracker' },
    { name: 'Retrospective', description: 'Lessons learned and improvements', type: 'Retrospective' },
    { name: 'Knowledge Base Article', description: 'Internal documentation', type: 'Documentation' },
  ],
}

export default function OverviewTab({ project }: OverviewTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    client: project.client,
    type: project.type,
    status: project.status,
    start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
    revenue_target: project.revenue_target,
    team: project.team.join(', '),
    quickbooks_invoice_url: project.quickbooks_invoice_url || '',
  })

  const [selectedType, setSelectedType] = useState<ProjectType>(project.type)
  const [showTemplates, setShowTemplates] = useState(false)

  const handleSave = async () => {
    // TODO: Implement save functionality with Supabase
    console.log('Saving project:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: project.name,
      client: project.client,
      type: project.type,
      status: project.status,
      start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      revenue_target: project.revenue_target,
      team: project.team.join(', '),
      quickbooks_invoice_url: project.quickbooks_invoice_url || '',
    })
    setIsEditing(false)
  }

  const handleTypeChange = (newType: ProjectType) => {
    setSelectedType(newType)
    setFormData({ ...formData, type: newType })
    setShowTemplates(true)
  }

  const handleCreateDocument = async (template: { name: string; description: string; type: string }) => {
    // TODO: Implement document creation
    console.log('Creating document from template:', template)
    alert(`Creating "${template.name}" document...`)
  }

  const templates = PROJECT_TYPE_TEMPLATES[selectedType] || []

  return (
    <div className="space-y-6">
      {/* Edit Mode Toggle */}
      <div className="flex justify-end">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#fd8216] hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit Project
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#fd8216] hover:bg-[#e67412] rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  />
                ) : (
                  <p className="text-gray-900">{project.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  />
                ) : (
                  <p className="text-gray-900">{project.client}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as ProjectType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  >
                    <option value="Audit">Audit</option>
                    <option value="Blueprint">Blueprint</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Internal">Internal</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{project.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{project.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#fd8216]" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  />
                ) : (
                  <p className="text-gray-900">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
                  />
                ) : (
                  <p className="text-gray-900">
                    {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Team */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#fd8216]" />
              Team
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Comma-separated team members"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
              />
            ) : project.team.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.team.map((member, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {member}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No team members assigned</p>
            )}
          </div>

          {/* Revenue Target */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#fd8216]" />
              Revenue Target
            </h3>
            {isEditing ? (
              <input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => setFormData({ ...formData, revenue_target: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${project.revenue_target?.toLocaleString() || '0'}
              </p>
            )}
          </div>

          {/* QuickBooks */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#fd8216]" />
              QuickBooks Invoice
            </h3>
            {isEditing ? (
              <input
                type="url"
                value={formData.quickbooks_invoice_url}
                onChange={(e) => setFormData({ ...formData, quickbooks_invoice_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd8216] focus:border-[#fd8216]"
              />
            ) : project.quickbooks_invoice_url ? (
              <a
                href={project.quickbooks_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#fd8216] hover:text-[#e67412] underline"
              >
                View Invoice
              </a>
            ) : (
              <p className="text-gray-500 text-sm">No invoice URL set</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Templates (shown when type changes in edit mode) */}
      {showTemplates && isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Documents for {selectedType} Projects
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Click any template below to create that document for this project:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => handleCreateDocument(template)}
                className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-[#fd8216] hover:shadow-sm transition-all"
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">{template.description}</div>
                <div className="text-xs text-gray-400 mt-2">Type: {template.type}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
