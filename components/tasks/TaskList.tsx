'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Badge } from '@/ui/badge'
import TaskCard from './TaskCard'
import AddTaskDialog from './AddTaskDialog'
import DeleteConfirmationModal from '@/components/common/DeleteConfirmationModal'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import type { Task, TaskStatus, TaskPriority } from '@/lib/revos/types'
import { ArrowUpDown } from 'lucide-react'

interface TaskListProps {
  projectId: string
}

type SortField = 'title' | 'priority' | 'status' | 'dueDate' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function TaskList({ projectId }: TaskListProps) {
  const { tasks, deleteTask } = useRevosData()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  // Get project tasks
  const projectTasks = useMemo(() => {
    return tasks.filter(task => task.projectId === projectId)
  }, [tasks, projectId])

  // Get unique assignees
  const assignees = useMemo(() => {
    const uniqueAssignees = new Set<string>()
    projectTasks.forEach(task => {
      if (task.assignedTo) uniqueAssignees.add(task.assignedTo)
    })
    return Array.from(uniqueAssignees).sort()
  }, [projectTasks])

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = projectTasks

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }

    // Assignee filter
    if (assigneeFilter !== 'All') {
      if (assigneeFilter === 'Unassigned') {
        filtered = filtered.filter(task => !task.assignedTo)
      } else {
        filtered = filtered.filter(task => task.assignedTo === assigneeFilter)
      }
    }

    // Sort
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'status':
          const statusOrder = { 'To Do': 1, 'In Progress': 2, 'Blocked': 3, 'Done': 4 }
          aValue = statusOrder[a.status]
          bValue = statusOrder[b.status]
          break
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [projectTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection])

  // Task stats
  const stats = useMemo(() => {
    const total = projectTasks.length
    const todo = projectTasks.filter(t => t.status === 'To Do').length
    const inProgress = projectTasks.filter(t => t.status === 'In Progress').length
    const blocked = projectTasks.filter(t => t.status === 'Blocked').length
    const done = projectTasks.filter(t => t.status === 'Done').length
    const overdue = projectTasks.filter(t =>
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done'
    ).length

    return { total, todo, inProgress, blocked, done, overdue }
  }, [projectTasks])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDelete = (task: Task) => {
    setTaskToDelete(task)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id)
      setTaskToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and manage project work items</p>
        </div>
        <AddTaskDialog projectId={projectId} />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">To Do</div>
            <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Blocked</div>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Done</div>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Overdue</div>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>
            <Select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}>
              <option value="All">All Assignees</option>
              <option value="Unassigned">Unassigned</option>
              {assignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </Select>
            <Select value={sortField} onChange={(e) => setSortField(e.target.value as SortField)}>
              <option value="createdAt">Sort by: Created</option>
              <option value="dueDate">Sort by: Due Date</option>
              <option value="priority">Sort by: Priority</option>
              <option value="status">Sort by: Status</option>
              <option value="title">Sort by: Title</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || assigneeFilter !== 'All'
                ? 'No tasks match your filters. Try adjusting your search criteria.'
                : 'No tasks yet. Click "Add Task" to create your first task.'}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {taskToDelete && (
        <DeleteConfirmationModal
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={confirmDelete}
          itemName={taskToDelete.title}
          itemType="task"
        />
      )}
    </div>
  )
}
