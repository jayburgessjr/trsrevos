'use client'

import { useState, useMemo } from 'react'
import { Download, Trash2, FileText, Image, Video, Music, Archive, File as FileIcon, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import type { File, FileVersion } from '@/lib/revos/types'

interface FileListProps {
  resourceType: 'project' | 'document' | 'content' | 'task' | 'comment'
  resourceId: string
}

// Get icon for file type
function getFileTypeIcon(file: File) {
  switch (file.fileType) {
    case 'image': return <Image className="h-5 w-5" aria-label="Image file" />
    case 'video': return <Video className="h-5 w-5" aria-label="Video file" />
    case 'audio': return <Music className="h-5 w-5" aria-label="Audio file" />
    case 'archive': return <Archive className="h-5 w-5" aria-label="Archive file" />
    case 'pdf':
    case 'document':
    case 'spreadsheet':
    case 'presentation':
      return <FileText className="h-5 w-5" aria-label="Document file" />
    default:
      return <FileIcon className="h-5 w-5" aria-label="File" />
  }
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function FileVersionItem({ version, users }: { version: FileVersion; users: any[] }) {
  const uploader = users.find(u => u.id === version.uploadedBy)

  const handleDownload = () => {
    // Create a download link
    const link = document.createElement('a')
    link.href = version.storageUrl
    link.download = version.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-500 bg-green-900 p-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-green-200">v{version.versionNumber}</span>
          <span className="text-sm text-white">{version.fileName}</span>
          <span className="text-xs text-green-200">({formatFileSize(version.fileSize)})</span>
        </div>
        <p className="mt-1 text-xs text-green-200">
          Uploaded by {uploader?.name || 'Unknown'} on {formatDate(version.uploadedAt)}
        </p>
        {version.changeNotes && (
          <p className="mt-1 text-xs italic text-green-100">&quot;{version.changeNotes}&quot;</p>
        )}
      </div>
      <button
        onClick={handleDownload}
        className="text-white hover:text-orange-300"
        title="Download this version"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  )
}

function FileItem({ file, users, onDelete }: { file: File; users: any[]; onDelete: (id: string) => void }) {
  const [showVersions, setShowVersions] = useState(false)

  const currentVersion = file.versions.find(v => v.id === file.currentVersionId)
  const olderVersions = file.versions.filter(v => v.id !== file.currentVersionId).sort((a, b) => b.versionNumber - a.versionNumber)

  const handleDownload = () => {
    if (!currentVersion) return
    const link = document.createElement('a')
    link.href = currentVersion.storageUrl
    link.download = currentVersion.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      onDelete(file.id)
    }
  }

  return (
    <div className="rounded-lg border border-orange-500 bg-green-800 overflow-hidden">
      {/* File Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-white">
            {getFileTypeIcon(file)}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white">{file.name}</h3>
            {file.description && (
              <p className="mt-1 text-xs text-green-200">{file.description}</p>
            )}
            {currentVersion && (
              <div className="mt-1 flex items-center gap-2 text-xs text-green-200">
                <span>v{currentVersion.versionNumber}</span>
                <span>•</span>
                <span>{formatFileSize(currentVersion.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(file.updatedAt)}</span>
              </div>
            )}
            {file.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {file.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-full border border-orange-500 bg-green-700 px-2 py-0.5 text-xs text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="rounded-lg border border-orange-500 bg-green-800 p-2 text-white transition-colors hover:bg-orange-500"
            title="Download current version"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg border border-orange-500 bg-green-800 p-2 text-white transition-colors hover:bg-red-600"
            title="Delete file"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {file.versions.length > 1 && (
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="rounded-lg border border-orange-500 bg-green-800 p-2 text-white transition-colors hover:bg-orange-500"
              title="Toggle version history"
            >
              <Clock className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Version History */}
      {showVersions && file.versions.length > 1 && (
        <div className="border-t border-orange-500 bg-green-900 p-4">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-white"
          >
            {showVersions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Version History ({file.versions.length} versions)
          </button>

          <div className="space-y-2">
            <div className="text-xs font-medium text-green-200 mb-2">Current Version:</div>
            {currentVersion && (
              <FileVersionItem version={currentVersion} users={users} />
            )}

            {olderVersions.length > 0 && (
              <>
                <div className="text-xs font-medium text-green-200 mt-4 mb-2">Previous Versions:</div>
                {olderVersions.map(version => (
                  <FileVersionItem key={version.id} version={version} users={users} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FileList({ resourceType, resourceId }: FileListProps) {
  const { files, users, deleteFile } = useRevosData()

  // Filter files for this resource
  const resourceFiles = useMemo(() => {
    return files.filter(
      f => f.resourceType === resourceType &&
           f.resourceId === resourceId &&
           !f.isDeleted
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [files, resourceType, resourceId])

  const handleDelete = (fileId: string) => {
    deleteFile({ id: fileId, permanent: false })
  }

  if (resourceFiles.length === 0) {
    return (
      <div className="rounded-lg border border-orange-500 bg-green-900 p-8 text-center">
        <FileIcon className="mx-auto h-12 w-12 text-green-200" />
        <p className="mt-2 text-sm text-white">No files uploaded yet</p>
        <p className="mt-1 text-xs text-green-200">Upload files to attach them to this {resourceType}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {resourceFiles.map(file => (
        <FileItem
          key={file.id}
          file={file}
          users={users}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
