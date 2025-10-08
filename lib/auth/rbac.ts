export type TrsRole = 'SuperAdmin' | 'Principal' | 'Operator' | 'Analyst' | 'Viewer'

export type TrsModule =
  | 'deliverables'
  | 'governance'
  | 'agents'
  | 'ai-engine'
  | 'gap-map'
  | 'exec-room'
  | 'partner'
  | 'kpis'

export const ROLE_PRECEDENCE: TrsRole[] = [
  'SuperAdmin',
  'Principal',
  'Operator',
  'Analyst',
  'Viewer'
]

const MODULE_ACCESS: Record<TrsModule, TrsRole[]> = {
  deliverables: ['SuperAdmin', 'Principal', 'Operator', 'Analyst'],
  governance: ['SuperAdmin', 'Principal'],
  agents: ['SuperAdmin', 'Principal', 'Operator', 'Analyst'],
  'ai-engine': ['SuperAdmin', 'Principal', 'Operator'],
  'gap-map': ['SuperAdmin', 'Principal', 'Operator', 'Analyst'],
  'exec-room': ['SuperAdmin', 'Principal'],
  partner: ['SuperAdmin', 'Principal', 'Operator'],
  kpis: ['SuperAdmin', 'Principal', 'Operator', 'Analyst', 'Viewer']
}

const NAV_ORDER: TrsModule[] = [
  'deliverables',
  'governance',
  'agents',
  'ai-engine',
  'gap-map',
  'exec-room',
  'partner',
  'kpis'
]

export function canAccessModule(role: TrsRole, module: TrsModule): boolean {
  if (role === 'SuperAdmin') {
    return true
  }

  return MODULE_ACCESS[module]?.includes(role) ?? false
}

export function getModulesForRole(role: TrsRole): TrsModule[] {
  return NAV_ORDER.filter((module) => canAccessModule(role, module))
}

export function isRole(role: string): role is TrsRole {
  return ROLE_PRECEDENCE.includes(role as TrsRole)
}

export const moduleAccessMap = MODULE_ACCESS
