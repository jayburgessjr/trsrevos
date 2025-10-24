'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Select } from '@/ui/select'
import { Share2, Trash2, Eye, Edit, Trash, Users } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import { getEffectivePermission, getRoleDisplayName, getRoleDescription, DEFAULT_PERMISSIONS } from '@/lib/permissions'
import type { Permission } from '@/lib/revos/types'
import { cn } from '@/lib/utils'

interface ShareDialogProps {
  resourceType: 'project' | 'document' | 'content'
  resourceId: string
  resourceName: string
}

export default function ShareDialog({ resourceType, resourceId, resourceName }: ShareDialogProps) {
  const { users, currentUser, resourcePermissions, createResourcePermission, updateResourcePermission, deleteResourcePermission } = useRevosData()
  const [open, setOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<Permission>({
    canView: true,
    canEdit: false,
    canDelete: false,
    canShare: false,
  })

  // Get users who already have access
  const usersWithAccess = useMemo(() => {
    const permissions = resourcePermissions.filter(
      rp => rp.resourceType === resourceType && rp.resourceId === resourceId
    )

    return users
      .filter(u => u.id !== currentUser?.id) // Exclude current user
      .map(user => {
        const permission = permissions.find(p => p.userId === user.id)
        return {
          user,
          permission: permission || null,
          effectivePermission: getEffectivePermission(user, resourceType, resourceId, resourcePermissions),
          permissionId: permission?.id,
        }
      })
      .filter(item => item.permission || item.effectivePermission.canView) // Show users with any access
  }, [users, currentUser, resourcePermissions, resourceType, resourceId])

  // Get users who can be added
  const availableUsers = useMemo(() => {
    return users.filter(u =>
      u.id !== currentUser?.id &&
      !usersWithAccess.some(item => item.user.id === u.id)
    )
  }, [users, currentUser, usersWithAccess])

  const handleAddUser = () => {
    if (!selectedUserId) return

    createResourcePermission({
      resourceType,
      resourceId,
      userId: selectedUserId,
      permission: selectedPermission,
    })

    setSelectedUserId('')
    setSelectedPermission({
      canView: true,
      canEdit: false,
      canDelete: false,
      canShare: false,
    })
  }

  const handleUpdatePermission = (permissionId: string, newPermission: Permission) => {
    updateResourcePermission({
      id: permissionId,
      permission: newPermission,
    })
  }

  const handleRemoveUser = (permissionId: string) => {
    if (confirm('Remove this user\'s access to this resource?')) {
      deleteResourcePermission(permissionId)
    }
  }

  const getPermissionBadge = (permission: Permission) => {
    if (permission.canDelete && permission.canEdit && permission.canShare) {
      return <Badge variant="default" className="bg-red-500">Full Access</Badge>
    }
    if (permission.canEdit) {
      return <Badge variant="default" className="bg-blue-500">Can Edit</Badge>
    }
    if (permission.canView) {
      return <Badge variant="outline">View Only</Badge>
    }
    return <Badge variant="outline" className="bg-gray-200">No Access</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{resourceName}"</DialogTitle>
          <DialogDescription>
            Manage who can view and edit this {resourceType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add User Section */}
          {availableUsers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Add People</h3>
              <div className="grid gap-3">
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {getRoleDisplayName(user.role)}
                    </option>
                  ))}
                </Select>

                {selectedUserId && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium">Set Permissions</p>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermission.canView}
                          onChange={(e) => setSelectedPermission({ ...selectedPermission, canView: e.target.checked })}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">Can View</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermission.canEdit}
                          onChange={(e) => setSelectedPermission({ ...selectedPermission, canEdit: e.target.checked })}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span className="text-sm">Can Edit</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermission.canDelete}
                          onChange={(e) => setSelectedPermission({ ...selectedPermission, canDelete: e.target.checked })}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Trash className="h-4 w-4" />
                          <span className="text-sm">Can Delete</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermission.canShare}
                          onChange={(e) => setSelectedPermission({ ...selectedPermission, canShare: e.target.checked })}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">Can Share</span>
                        </div>
                      </label>
                    </div>
                    <Button onClick={handleAddUser} className="w-full bg-[#015e32] hover:bg-[#01753d]">
                      Add User
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users with Access */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              People with Access ({usersWithAccess.length})
            </h3>

            {usersWithAccess.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg">
                No users have been granted specific access to this resource.
                <br />
                Users can access based on their default role permissions.
              </div>
            ) : (
              <div className="space-y-2">
                {usersWithAccess.map(({ user, permission, effectivePermission, permissionId }) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        {getPermissionBadge(effectivePermission)}
                        <p className="text-xs text-muted-foreground">
                          {permission ? 'Custom' : `Default (${user.role})`}
                        </p>
                      </div>

                      {permissionId && (
                        <button
                          onClick={() => handleRemoveUser(permissionId)}
                          className="text-red-600 hover:text-red-700 p-2"
                          title="Remove access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Permissions Reference */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold text-foreground">Default Role Permissions</h3>
            <div className="grid gap-2 text-xs">
              {Object.entries(DEFAULT_PERMISSIONS).map(([role, permission]) => (
                <div key={role} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <div>
                    <span className="font-medium">{role}</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {getRoleDescription(role as any)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {permission.canView && <Badge variant="outline" className="text-xs">View</Badge>}
                    {permission.canEdit && <Badge variant="outline" className="text-xs">Edit</Badge>}
                    {permission.canDelete && <Badge variant="outline" className="text-xs">Delete</Badge>}
                    {permission.canShare && <Badge variant="outline" className="text-xs">Share</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
