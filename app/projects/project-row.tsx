'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, type MouseEvent } from 'react'

import { phaseBadgeClasses } from '@/core/clients/constants'
import type { ProjectRowData } from './page'
import { Badge } from '@/ui/badge'
import { TableCell, TableRow } from '@/ui/table'

export function ProjectRow({ project }: { project: ProjectRowData }) {
  const router = useRouter()

  const handleRowClick = useCallback(() => {
    router.push(`/clients/${project.clientId}`)
  }, [project.clientId, router])

  const handleClientLinkClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
  }, [])

  return (
    <TableRow className="cursor-pointer" onClick={handleRowClick}>
      <TableCell className="font-medium text-[color:var(--color-text)]">{project.name}</TableCell>
      <TableCell className="text-sm text-[color:var(--color-text-muted)]">
        <Link
          href={`/clients/${project.clientId}`}
          title="Open client"
          onClick={handleClientLinkClick}
          className="underline-offset-2 hover:text-[color:var(--color-text)] hover:underline"
        >
          {project.clientName}
        </Link>
      </TableCell>
      <TableCell className="text-sm text-[color:var(--color-text-muted)]">{project.owner}</TableCell>
      <TableCell>
        <Badge variant="outline" className={phaseBadgeClasses[project.status]}>
          {project.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
            <div className="h-full bg-[color:var(--color-primary)]" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-xs text-[color:var(--color-text-muted)]">{project.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-[color:var(--color-text-muted)]">
        {new Date(project.dueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell>
        <div
          className={`h-3 w-3 rounded-full ${
            project.health === 'green'
              ? 'bg-[color:var(--color-positive)]'
              : project.health === 'yellow'
              ? 'bg-yellow-500'
              : 'bg-[color:var(--color-negative)]'
          }`}
        />
      </TableCell>
    </TableRow>
  )
}
