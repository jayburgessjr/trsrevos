import { allEvents } from "./store"

export async function emitEvent(actorId: string, entity: string, action: string, meta?: Record<string, unknown>) {
  allEvents().push({ entity, action, ts: new Date().toISOString(), meta: { actorId, ...(meta || {}) } })
}
