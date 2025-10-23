'use client'

import { Activity, FileText, Package, FolderOpen, Users, Calendar, Edit } from 'lucide-react'
import type { ProjectWorkspaceProject } from '../ProjectWorkspace'

interface ActivityTabProps {
  project: ProjectWorkspaceProject
}

// Mock activity data - in production this would come from an activity log table
const mockActivities = [
  {
    id: '1',
    type: 'project_created',
    description: 'Project created',
    user: 'System',
    timestamp: new Date().toISOString(),
    icon: Calendar,
  },
  {
    id: '2',
    type: 'project_updated',
    description: 'Project status changed to Active',
    user: 'Jay Burgess',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    icon: Edit,
  },
  {
    id: '3',
    type: 'document_added',
    description: 'Revenue Audit Report added',
    user: 'Jay Burgess',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    icon: FileText,
  },
  {
    id: '4',
    type: 'team_updated',
    description: 'Team member added',
    user: 'Jay Burgess',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    icon: Users,
  },
]

export default function ActivityTab({ project }: ActivityTabProps) {
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_created':
        return 'bg-green-100 text-green-600'
      case 'project_updated':
        return 'bg-blue-100 text-blue-600'
      case 'document_added':
        return 'bg-purple-100 text-purple-600'
      case 'team_updated':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Project Activity</h2>
        <p className="text-sm text-gray-500 mt-1">Timeline of all project events and updates</p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="space-y-6">
          {mockActivities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-500">Project activity will appear here as events occur</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

              {/* Activity items */}
              <div className="space-y-6">
                {mockActivities.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-base font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              by {activity.user}
                            </p>
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Milestones */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Milestones</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Project Start</span>
            </div>
            <span className="text-sm text-gray-500">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
            </span>
          </div>

          {project.end_date && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Project End</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Edit className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Last Updated</span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-gray-900">{mockActivities.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Documents</div>
          <div className="text-2xl font-bold text-purple-600">
            {mockActivities.filter((a) => a.type === 'document_added').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Updates</div>
          <div className="text-2xl font-bold text-blue-600">
            {mockActivities.filter((a) => a.type === 'project_updated').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Team Changes</div>
          <div className="text-2xl font-bold text-orange-600">
            {mockActivities.filter((a) => a.type === 'team_updated').length}
          </div>
        </div>
      </div>
    </div>
  )
}
