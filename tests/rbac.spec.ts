import { describe, expect, it } from 'vitest'

import {
  canAccessModule,
  getModulesForRole,
  type TrsModule,
  type TrsRole
} from '../lib/auth/rbac'

const modules: TrsModule[] = [
  'deliverables',
  'governance',
  'agents',
  'ai-engine',
  'gap-map',
  'exec-room',
  'partner',
  'kpis'
]

describe('RBAC matrix', () => {
  it('grants SuperAdmin full access', () => {
    modules.forEach((module) => {
      expect(canAccessModule('SuperAdmin', module)).toBe(true)
    })
  })

  it('keeps Viewer limited to insight surfaces', () => {
    const viewerModules = getModulesForRole('Viewer')
    expect(viewerModules).toEqual(['kpis'])
    expect(canAccessModule('Viewer', 'deliverables')).toBe(false)
    expect(canAccessModule('Viewer', 'governance')).toBe(false)
  })

  it('orders module access by role precedence', () => {
    const precedence: TrsRole[] = ['SuperAdmin', 'Principal', 'Operator', 'Analyst', 'Viewer']
    const module = 'partner'

    const accessVector = precedence.map((role) => canAccessModule(role, module))
    expect(accessVector).toEqual([true, true, true, false, false])
  })
})
