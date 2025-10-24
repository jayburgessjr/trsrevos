'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

type DeleteConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  itemName: string
  itemType: 'client' | 'document' | 'project' | 'content'
  title?: string
  description?: string
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  title,
  description,
}: DeleteConfirmationModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (confirmText !== itemName) return

    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
      setConfirmText('')
    } catch (error) {
      console.error('Error deleting item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      onClose()
    }
  }

  const defaultTitle = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
  const defaultDescription =
    itemType === 'client'
      ? 'This will permanently delete this client and all associated projects and documents. This action cannot be undone.'
      : itemType === 'project'
      ? 'This will permanently delete this project and all associated documents. This action cannot be undone.'
      : 'This will permanently delete this item. This action cannot be undone.'

  const isConfirmEnabled = confirmText === itemName && !isDeleting

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-[#121212] rounded-lg shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{title || defaultTitle}</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-muted-foreground">{description || defaultDescription}</p>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
              To confirm deletion, type the {itemType} name:
            </p>
            <p className="text-sm font-mono font-bold text-amber-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/40 px-3 py-2 rounded mb-3">
              {itemName}
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${itemName}" to confirm`}
              disabled={isDeleting}
              className="font-mono"
              autoFocus
            />
          </div>

          {confirmText && confirmText !== itemName && (
            <p className="text-sm text-red-600 dark:text-red-400">
              The name does not match. Please type the exact name.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-gray-50 dark:bg-[#0a0a0a] flex gap-3">
          <Button onClick={handleClose} variant="outline" className="flex-1" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
