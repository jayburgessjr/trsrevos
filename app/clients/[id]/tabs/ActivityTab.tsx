'use client'

import { ActivityItem } from '@/core/clients/types'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'

const TYPE_LABELS: Record<ActivityItem['type'], string> = {
  event: 'Product Event',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
}

type ActivityTabProps = {
  items: ActivityItem[]
}

const formatTimestamp = (value: string | null) => {
  if (!value) return 'Unknown'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ActivityTab({ items }: ActivityTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Client activity timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 rounded-lg border border-[color:var(--color-outline)] px-4 py-3">
                <Badge variant="outline">{TYPE_LABELS[item.type] ?? item.type}</Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[color:var(--color-text)]">{item.title}</p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{formatTimestamp(item.occurred_at)}</p>
                  {item.details ? (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-[color:var(--color-surface-muted)] px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
                      {JSON.stringify(item.details, null, 2)}
                    </pre>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-[color:var(--color-outline)] px-4 py-8 text-center text-sm text-[color:var(--color-text-muted)]">
            No recent activity for this client.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
