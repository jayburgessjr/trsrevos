export type RevosPhase = 'Discovery' | 'Data' | 'Algorithm' | 'Architecture' | 'Compounding'
export type ClientRecord = {
  id: string
  name: string
  owner?: string
  status: RevosPhase // mirrors current tab
  createdAt: string
  // Discovery
  gapAnswers: Array<{ id: string; q: string; a: string }>
  // Data
  availableSources: string[]
  collectedSources: string[]
  // Algorithm
  qraNotes?: string // result of QRA strategy pass (stub)
  // Architecture
  kanban: {
    Backlog: string[]
    Doing: string[]
    Review: string[]
    Done: string[]
  }
  // Compounding
  baselineARR?: number // at start
  realizedARR?: number // current realized uplift
  history: Array<{ date: string; arr: number }> // for charts
}
