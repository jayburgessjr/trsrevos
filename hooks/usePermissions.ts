import { useMemo } from 'react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import { canView, canEdit, canDelete, canShare, getEffectivePermission } from '@/lib/permissions'
import type { Permission } from '@/lib/revos/types'

export function usePermissions(
  resourceType: 'project' | 'document' | 'content',
  resourceId: string
) {
  const { currentUser, resourcePermissions } = useRevosData()

  const permissions = useMemo<Permission>(() => {
    return getEffectivePermission(currentUser, resourceType, resourceId, resourcePermissions)
  }, [currentUser, resourceType, resourceId, resourcePermissions])

  const checks = useMemo(() => ({
    canView: canView(currentUser, resourceType, resourceId, resourcePermissions),
    canEdit: canEdit(currentUser, resourceType, resourceId, resourcePermissions),
    canDelete: canDelete(currentUser, resourceType, resourceId, resourcePermissions),
    canShare: canShare(currentUser, resourceType, resourceId, resourcePermissions),
  }), [currentUser, resourceType, resourceId, resourcePermissions])

  return {
    permissions,
    ...checks,
    isAdmin: currentUser?.role === 'Admin',
    currentUser,
  }
}
