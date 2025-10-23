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
            className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            <Edit2 className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
            Edit Project
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              <Save className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="group flex items-center gap-2 rounded-lg border border-orange-500 bg-green-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              <X className="h-4 w-4 text-white transition-colors group-hover:text-green-900" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">Project Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                ) : (
                  <p className="text-white">{project.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">Client</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                ) : (
                  <p className="text-white">{project.client}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">Project Type</label>
                {isEditing ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as ProjectType)}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="Audit">Audit</option>
                    <option value="Blueprint">Blueprint</option>
                    <option value="Advisory">Advisory</option>
                    <option value="Internal">Internal</option>
                  </select>
                ) : (
                  <p className="text-white">{project.type}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">Status</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Closed">Closed</option>
                  </select>
                ) : (
                  <p className="text-white">{project.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Calendar className="h-5 w-5 text-white" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                ) : (
                  <p className="text-white">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-green-200">End Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                ) : (
                  <p className="text-white">
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
          <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Users className="h-5 w-5 text-white" />
              Team
            </h3>
            {isEditing ? (
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                placeholder="Comma-separated team members"
                className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            ) : project.team.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.team.map((member, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-orange-500 bg-green-700 px-3 py-1 text-sm text-white"
                  >
                    {member}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-green-200">No team members assigned</p>
            )}
          </div>

          {/* Revenue Target */}
          <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <DollarSign className="h-5 w-5 text-white" />
              Revenue Target
            </h3>
            {isEditing ? (
              <input
                type="number"
                value={formData.revenue_target}
                onChange={(e) => setFormData({ ...formData, revenue_target: parseFloat(e.target.value) })}
                className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            ) : (
              <p className="text-2xl font-bold text-white">
                ${project.revenue_target?.toLocaleString() || '0'}
              </p>
            )}
          </div>

          {/* QuickBooks */}
          <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Target className="h-5 w-5 text-white" />
              QuickBooks Invoice
            </h3>
            {isEditing ? (
              <input
                type="url"
                value={formData.quickbooks_invoice_url}
                onChange={(e) => setFormData({ ...formData, quickbooks_invoice_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-lg border border-orange-500 bg-green-950 px-3 py-2 text-white placeholder:text-green-200 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            ) : project.quickbooks_invoice_url ? (
              <a
                href={project.quickbooks_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline decoration-orange-400 underline-offset-4 hover:text-orange-200"
              >
                View Invoice
              </a>
            ) : (
              <p className="text-sm text-green-200">No invoice URL set</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Templates (shown when type changes in edit mode) */}
      {showTemplates && isEditing && (
        <div className="rounded-lg border border-orange-500 bg-green-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Recommended Documents for {selectedType} Projects
          </h3>
          <p className="mb-4 text-sm text-green-100">
            Click any template below to create that document for this project:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => handleCreateDocument(template)}
                className="group rounded-lg border border-orange-500 bg-green-800 p-4 text-left transition-all hover:bg-orange-500"
              >
                <div className="font-medium text-white transition-colors group-hover:text-green-900">{template.name}</div>
                <div className="mt-1 text-sm text-green-100 transition-colors group-hover:text-white">{template.description}</div>
                <div className="mt-2 text-xs text-green-200 transition-colors group-hover:text-green-900">Type: {template.type}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
