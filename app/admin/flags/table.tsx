'use client'

import * as React from 'react'
import { FeatureFlag, setFlagEnabled } from '@/core/flags/flags'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { showToast } from '@/ui/toast'

type FlagsTableProps = {
  initialFlags: FeatureFlag[]
}

export function FlagsTable({ initialFlags }: FlagsTableProps) {
  const [flags, setFlags] = React.useState(initialFlags)

  const toggleFlag = React.useCallback(
    (key: string) => {
      setFlags((prev) =>
        prev.map((flag) =>
          flag.key === key
            ? { ...flag, enabled: !flag.enabled }
            : flag,
        ),
      )
      const updated = setFlagEnabled(key, !flags.find((flag) => flag.key === key)?.enabled)
      showToast({
        title: `Flag ${key}`,
        description: updated?.enabled ? 'Enabled for eligible roles.' : 'Disabled for now.',
      })
    },
    [flags],
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Flag</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Audience</TableHead>
          <TableHead className="text-right">Enabled</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flags.map((flag) => (
          <TableRow key={flag.key}>
            <TableCell className="font-medium text-[color:var(--color-text)]">{flag.label}</TableCell>
            <TableCell className="text-sm text-[color:var(--color-text-muted)]">{flag.description}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {flag.audience.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant={flag.enabled ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleFlag(flag.key)}
              >
                {flag.enabled ? 'On' : 'Off'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
