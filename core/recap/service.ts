import { getEventsByDate } from '@/core/events/store'

export type Recap = {
  id: string
  userId: string
  date: string
  dollarsAdvanced: number
  itemsShipped: number
  risks: string[]
  firstActionTomorrow: string
  markdown: string
  generatedAt: string
}

export async function generateRecap(userId: string, date: Date): Promise<Recap> {
  const day = date.toISOString().slice(0, 10)
  const events = getEventsByDate(day)

  // Derive metrics from events (stub logic - replace with real computation)
  const dollarsAdvanced = events.filter((e) => e.entity === 'pipeline').length * 25000
  const itemsShipped = events.filter((e) => e.entity === 'plan' && e.action === 'completed').length || 3
  const risks = ['Client renewal at risk - needs follow-up', 'Pipeline coverage below 100%']
  const firstActionTomorrow = 'Review top 3 opportunities and update forecast'

  const markdown = `# Daily Recap – ${day}

## Progress
- **Dollars Advanced**: $${dollarsAdvanced.toLocaleString()}
- **Items Shipped**: ${itemsShipped}
- **Focus Sessions**: ${events.filter((e) => e.entity === 'focus').length}

## Risks & Blockers
${risks.map((r) => `- ${r}`).join('\n')}

## Tomorrow's First Action
${firstActionTomorrow}

---
Generated at ${new Date().toLocaleTimeString()}
`

  return {
    id: `${userId}-${day}`,
    userId,
    date: day,
    dollarsAdvanced,
    itemsShipped,
    risks,
    firstActionTomorrow,
    markdown,
    generatedAt: new Date().toISOString(),
  }
}
