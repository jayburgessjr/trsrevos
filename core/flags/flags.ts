export type Role = 'admin' | 'revops' | 'finance' | 'partner'

export type User = {
  id: string
  name: string
  role: Role
}

export type FeatureFlag = {
  key: string
  label: string
  description: string
  enabled: boolean
  audience: Role[]
}

const flagStore = new Map<string, FeatureFlag>([
  [
    'daily-plan-v1',
    {
      key: 'daily-plan-v1',
      label: 'Daily plan orchestrator',
      description: 'Expose morning briefing prioritization experience.',
      enabled: true,
      audience: ['admin', 'revops'],
    },
  ],
  [
    'share-spaces',
    {
      key: 'share-spaces',
      label: 'Shareable spaces',
      description: 'Allow tokenized links for cross-tenant previews.',
      enabled: false,
      audience: ['admin', 'partner'],
    },
  ],
  [
    'finance-dash-v2',
    {
      key: 'finance-dash-v2',
      label: 'Finance dashboard v2',
      description: 'Preview capital efficiency workbook.',
      enabled: false,
      audience: ['admin', 'finance'],
    },
  ],
])

export function listFlags() {
  return Array.from(flagStore.values())
}

export function setFlagEnabled(key: string, enabled: boolean) {
  const current = flagStore.get(key)
  if (!current) return
  flagStore.set(key, { ...current, enabled })
  return flagStore.get(key)
}

export function canUse(user: User, key: string) {
  const flag = flagStore.get(key)
  if (!flag) return false
  if (!flag.enabled) return false
  return flag.audience.includes(user.role)
}

export function requireRole(user: User, allowedRoles: Role[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Not authorized for this route')
  }
}
