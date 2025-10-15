'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select } from '@/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Textarea } from '@/ui/textarea'

import { ExecutionTask, ExecutionWeeklySummary, StageStatus } from '../../lib/types'

const STATUS_OPTIONS: Array<{ value: ExecutionTask['status']; label: string }> = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Complete' },
]

const STATUS_LABELS: Record<StageStatus, string> = {
  idle: 'Idle',
  saving: 'Saving…',
  saved: 'Saved',
  running: 'Advisor drafting…',
  error: 'Needs attention',
}

type ExecutionTabProps = {
  tasks: ExecutionTask[]
  status: StageStatus
  weeklySummary: ExecutionWeeklySummary | null
  onChange: (tasks: ExecutionTask[]) => void
  onWeeklySummaryChange: (summary: ExecutionWeeklySummary) => void
  onCompleteReview: () => Promise<void>
}

export default function ExecutionTab({
  tasks,
  status,
  weeklySummary,
  onChange,
  onWeeklySummaryChange,
  onCompleteReview,
}: ExecutionTabProps) {
  const [filter, setFilter] = useState<'all' | ExecutionTask['status']>('all')

  const statusLabel = useMemo(() => STATUS_LABELS[status], [status])

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter((task) => task.status === filter)
  }, [filter, tasks])

  const handleTaskChange = <Key extends keyof ExecutionTask>(id: string | undefined, key: Key, value: ExecutionTask[Key]) => {
    const next = tasks.map((task) => (task.id === id ? { ...task, [key]: value } : task))
    onChange(next)
  }

  const handleAddTask = () => {
    const next = [
      ...tasks,
      {
        id: undefined,
        taskName: 'New Task',
        status: 'todo',
        assignedTo: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        progressNotes: '',
      } satisfies ExecutionTask,
    ]
    onChange(next)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Execution Tracker</h3>
          <p className="text-sm text-white/60">
            Align the operating rhythm across owners, due dates, and advisor recaps. Filters and autosave keep everyone in sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-white/60">Tasks</p>
            <p className="text-lg font-semibold text-white">{tasks.length}</p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{statusLabel}</span>
          <Button variant="secondary" onClick={handleAddTask}>
            Add Task
          </Button>
        </div>
      </header>

      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">
        <span>Filter</span>
        <div className="flex gap-2">
          {['all', ...STATUS_OPTIONS.map((option) => option.value)].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as 'all' | ExecutionTask['status'])}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                filter === value ? 'bg-white text-black' : 'border border-white/30 text-white/70'
              }`}
            >
              {value === 'all'
                ? 'All'
                : STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value}
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-white/10 text-left text-xs uppercase tracking-wide text-white/60">
              <TableHead className="text-white/70">Task</TableHead>
              <TableHead className="text-white/70">Owner</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Start</TableHead>
              <TableHead className="text-white/70">Due</TableHead>
              <TableHead className="text-white/70">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id ?? task.taskName}>
                <TableCell>
                  <Input value={task.taskName} onChange={(event) => handleTaskChange(task.id, 'taskName', event.target.value)} />
                </TableCell>
                <TableCell>
                  <Input value={task.assignedTo} onChange={(event) => handleTaskChange(task.id, 'assignedTo', event.target.value)} />
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onChange={(event) => handleTaskChange(task.id, 'status', event.target.value as ExecutionTask['status'])}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={task.startDate?.slice(0, 10)}
                    onChange={(event) => handleTaskChange(task.id, 'startDate', event.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={task.endDate?.slice(0, 10)}
                    onChange={(event) => handleTaskChange(task.id, 'endDate', event.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    value={task.progressNotes}
                    rows={2}
                    onChange={(event) => handleTaskChange(task.id, 'progressNotes', event.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">Weekly Summary</h4>
            <p className="text-xs text-white/50">AdvisorAI crafts a recap when you complete the review.</p>
          </div>
          <Button onClick={onCompleteReview} disabled={status === 'running'}>
            Complete Review
          </Button>
        </div>
        <Textarea
          rows={5}
          value={weeklySummary?.notes ?? ''}
          onChange={(event) => onWeeklySummaryChange({ notes: event.target.value, advisorSummary: weeklySummary?.advisorSummary })}
          placeholder="Wins, blockers, leading indicators"
        />
        {weeklySummary?.advisorSummary ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-white/80">
            <p className="mb-2 text-xs uppercase tracking-wide text-white/60">Advisor Summary</p>
            <p>{weeklySummary.advisorSummary}</p>
          </div>
        ) : null}
      </section>
    </div>
  )
}
