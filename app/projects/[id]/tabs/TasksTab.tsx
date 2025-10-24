'use client'

import TaskList from '@/components/tasks/TaskList'
import type { ProjectWorkspaceProject } from '../ProjectWorkspace'

interface TasksTabProps {
  project: ProjectWorkspaceProject
}

export default function TasksTab({ project }: TasksTabProps) {
  return (
    <div className="space-y-6">
      <TaskList projectId={project.id} />
    </div>
  )
}
