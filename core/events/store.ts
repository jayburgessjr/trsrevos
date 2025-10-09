type Evt = { entity: string; action: string; ts: string; meta?: Record<string, unknown> }

const EVENTS: Evt[] = []

export function allEvents() {
  return EVENTS
}

export function eventsToday() {
  const d = new Date().toISOString().slice(0, 10)
  return EVENTS.filter((e) => e.ts.startsWith(d))
}
