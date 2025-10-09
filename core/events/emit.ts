import { appendEvent, Event } from './store'

export function emit(event: Omit<Event, 'ts'>): Event {
  return appendEvent(event)
}
