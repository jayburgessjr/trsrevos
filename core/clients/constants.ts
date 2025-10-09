import type { RevosPhase } from './types'

export const REVOS_PHASES: RevosPhase[] = ['Discovery', 'Data', 'Algorithm', 'Architecture', 'Compounding']

export const phaseBadgeClasses: Record<RevosPhase, string> = {
  Discovery: 'border border-[color:var(--color-outline)] bg-[color:var(--color-surface)] text-[color:var(--color-text)]',
  Data: 'border border-blue-100 bg-blue-50 text-blue-600',
  Algorithm: 'border border-purple-100 bg-purple-50 text-purple-600',
  Architecture: 'border border-emerald-100 bg-emerald-50 text-emerald-600',
  Compounding: 'border border-amber-100 bg-amber-50 text-amber-600',
}
