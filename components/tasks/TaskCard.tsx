'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/ui/card'
import { Badge } from '@/ui/badge'
import {
  Calendar,
  Clock,
  User,
  Tag,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import type { Task, TaskStatus } from '@/lib/revos/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

const statusIcons = {
  'To Do': Circle,
  'In Progress': Clock,
  'Blocked': AlertCircle,
  'Done': CheckCircle2,
}

const statusColors = {
  'To Do': 'text-gray-500',
  'In Progress': 'text-blue-500',
  'Blocked': 'text-red-500',
  'Done': 'text-green-500',
}

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800 border-gray-300',
  'Medium': 'bg-blue-100 text-blue-800 border-blue-300',
  'High': 'bg-orange-100 text-orange-800 border-orange-300',
  'Urgent': 'bg-red-100 text-red-800 border-red-300',
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { updateTask } = useRevosData()
  const [isExpanded, setIsExpanded] = useState(false)

  const StatusIcon = statusIcons[task.status]

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask({
      id: task.id,
      status: newStatus,
    })
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      task.status === 'Done' && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="pt-1">
                <StatusIcon className={cn("h-5 w-5", statusColors[task.status])} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-foreground cursor-pointer hover:text-[#fd8216] transition-colors",
                    task.status === 'Done' && "line-through text-muted-foreground"
                  )}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {task.title}
                </h3>
                {task.description && isExpanded && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignedTo}</span>
              </div>
            )}

            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600 font-semibold"
              )}>
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                {isOverdue && <span className="text-xs">(Overdue)</span>}
              </div>
            )}

            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {task.actualHours ? `${task.actualHours}h / ${task.estimatedHours}h` : `${task.estimatedHours}h`}
                </span>
              </div>
            )}

            {task.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="h-3 w-3" />
                {task.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status Selector & Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
