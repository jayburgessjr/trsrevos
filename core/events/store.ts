export type Event = {
  entity: string
  action: string
  ts: string
  meta?: Record<string, any>
}

const eventLog: Event[] = []

export function appendEvent(event: Omit<Event, 'ts'>): Event {
  const fullEvent: Event = {
    ...event,
    ts: new Date().toISOString(),
  }
  eventLog.push(fullEvent)
  return fullEvent
}

export function getEvents(filters?: { entity?: string; action?: string; since?: string }): Event[] {
  let filtered = eventLog

  if (filters?.entity) {
    filtered = filtered.filter((e) => e.entity === filters.entity)
  }

  if (filters?.action) {
    filtered = filtered.filter((e) => e.action === filters.action)
  }

  if (filters?.since) {
    const since = filters.since
    filtered = filtered.filter((e) => e.ts >= since)
  }

  return filtered
}

export function getEventsByDate(date: string): Event[] {
  return eventLog.filter((e) => e.ts.startsWith(date))
}
