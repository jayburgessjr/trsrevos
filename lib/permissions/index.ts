import type { User, UserRole, Permission, ResourcePermission } from '@/lib/revos/types'

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission> = {
  Admin: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
  },
  Manager: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canShare: true,
  },
  Member: {
    canView: true,
    canEdit: true,
    canDelete: false,
    canShare: false,
  },
  Viewer: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
  },
}

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  action: keyof Permission,
  resourcePermissions: ResourcePermission[]
): boolean {
  // If no user, deny access
  if (!user) return false

  // Admins have all permissions
  if (user.role === 'Admin') return true

  // Check for resource-specific permission
  const resourcePermission = resourcePermissions.find(
    (rp) => rp.resourceType === resourceType && rp.resourceId === resourceId && rp.userId === user.id
  )

  if (resourcePermission) {
    return resourcePermission.permission[action]
  }

  // Fall back to default role permissions
  return DEFAULT_PERMISSIONS[user.role][action]
}

/**
 * Get effective permission for a user on a resource
 */
export function getEffectivePermission(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  resourcePermissions: ResourcePermission[]
): Permission {
  if (!user) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canShare: false,
    }
  }

  // Admins have all permissions
  if (user.role === 'Admin') {
    return DEFAULT_PERMISSIONS.Admin
  }

  // Check for resource-specific permission
  const resourcePermission = resourcePermissions.find(
    (rp) => rp.resourceType === resourceType && rp.resourceId === resourceId && rp.userId === user.id
  )

  if (resourcePermission) {
    return resourcePermission.permission
  }

  // Fall back to default role permissions
  return DEFAULT_PERMISSIONS[user.role]
}

/**
 * Check if a user can view a resource
 */
export function canView(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  resourcePermissions: ResourcePermission[]
): boolean {
  return hasPermission(user, resourceType, resourceId, 'canView', resourcePermissions)
}

/**
 * Check if a user can edit a resource
 */
export function canEdit(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  resourcePermissions: ResourcePermission[]
): boolean {
  return hasPermission(user, resourceType, resourceId, 'canEdit', resourcePermissions)
}

/**
 * Check if a user can delete a resource
 */
export function canDelete(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  resourcePermissions: ResourcePermission[]
): boolean {
  return hasPermission(user, resourceType, resourceId, 'canDelete', resourcePermissions)
}

/**
 * Check if a user can share a resource
 */
export function canShare(
  user: User | null,
  resourceType: 'project' | 'document' | 'content',
  resourceId: string,
  resourcePermissions: ResourcePermission[]
): boolean {
  return hasPermission(user, resourceType, resourceId, 'canShare', resourcePermissions)
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'Admin':
      return 'Full access to all features and resources'
    case 'Manager':
      return 'Can manage projects, documents, and team members'
    case 'Member':
      return 'Can view and edit assigned resources'
    case 'Viewer':
      return 'Read-only access to assigned resources'
  }
}
