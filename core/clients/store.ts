import { ClientRecord, RevosPhase } from './types'

const CLIENTS = new Map<string, ClientRecord>()

export function seedClients() {
  if (CLIENTS.size) return
  const today = new Date().toISOString().slice(0, 10)
  CLIENTS.set('acme', {
    id: 'acme',
    name: 'ACME Corp',
    owner: 'Jay',
    status: 'Discovery',
    createdAt: today,
    gapAnswers: [],
    availableSources: ['Stripe', 'HubSpot', 'Postgres', 'Mixpanel', 'Billing CSV'],
    collectedSources: ['Stripe'],
    qraNotes: '',
    kanban: {
      Backlog: ['Scope pricing rules', 'Partner CRM skeleton'],
      Doing: ['Daily plan shell'],
      Review: [],
      Done: [],
    },
    baselineARR: 120000,
    realizedARR: 138000,
    history: [
      { date: '2025-07-01', arr: 120000 },
      { date: '2025-08-01', arr: 126000 },
      { date: '2025-09-01', arr: 132000 },
      { date: '2025-10-01', arr: 138000 },
    ],
  })
}

export function getClient(id: string) {
  seedClients()
  return CLIENTS.get(id) || null
}

export function listClients() {
  seedClients()
  return Array.from(CLIENTS.values())
}

export function updateStatus(id: string, phase: RevosPhase) {
  seedClients()
  const c = CLIENTS.get(id)
  if (!c) return null
  c.status = phase
  CLIENTS.set(id, c)
  return c
}

export function saveGapAnswers(id: string, answers: Array<{ id: string; q: string; a: string }>) {
  const c = getClient(id)
  if (!c) return null
  c.gapAnswers = answers
  return c
}

export function toggleCollectedSource(id: string, src: string) {
  const c = getClient(id)
  if (!c) return null
  const set = new Set(c.collectedSources)
  set.has(src) ? set.delete(src) : set.add(src)
  c.collectedSources = Array.from(set)
  return c
}

export function moveKanban(
  id: string,
  card: string,
  from: keyof ClientRecord['kanban'],
  to: keyof ClientRecord['kanban'],
) {
  const c = getClient(id)
  if (!c) return null
  c.kanban[from] = c.kanban[from].filter((x) => x !== card)
  c.kanban[to].push(card)
  return c
}

export function setQRA(id: string, notes: string) {
  const c = getClient(id)
  if (!c) return null
  c.qraNotes = notes
  return c
}
