'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, File, FileText, Image, Video, Music, Archive } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'
import type { FileType } from '@/lib/revos/types'

interface FileUploaderProps {
  resourceType: 'project' | 'document' | 'content' | 'task' | 'comment'
  resourceId: string
  onUploadComplete?: () => void
}

// Detect file type from MIME type
function detectFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType === 'text/plain'
  ) return 'document'
  if (
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  ) return 'spreadsheet'
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint')
  ) return 'presentation'
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('gz')
  ) return 'archive'
  return 'other'
}

// Get icon for file type
function getFileTypeIcon(fileType: FileType) {
  switch (fileType) {
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
      return <File className="h-5 w-5" aria-label="File" />
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

export default function FileUploader({ resourceType, resourceId, onUploadComplete }: FileUploaderProps) {
  const { createFile } = useRevosData()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(prev => [...prev, ...files])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)

    try {
      for (const file of selectedFiles) {
        // Convert file to base64
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const base64Data = await base64Promise
        const fileType = detectFileType(file.type)

        // Create file
        createFile({
          name: file.name,
          fileType,
          resourceType,
          resourceId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileData: base64Data,
          tags: [],
        })
      }

      // Reset state
      setSelectedFiles([])
      setUploading(false)

      // Notify parent
      onUploadComplete?.()
    } catch (error) {
      console.error('Failed to upload files:', error)
      setUploading(false)
      alert('Failed to upload files. Please try again.')
    }
  }, [selectedFiles, resourceType, resourceId, createFile, onUploadComplete])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging
            ? 'border-orange-500 bg-orange-50'
            : 'border-orange-300 bg-green-900 hover:border-orange-500 hover:bg-green-800'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className={`mx-auto h-12 w-12 ${isDragging ? 'text-orange-500' : 'text-orange-400'}`} />

        <p className="mt-2 text-sm font-medium text-white">
          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="mt-1 text-xs text-green-200">
          Support for PDFs, images, documents, spreadsheets, and more
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              Selected Files ({selectedFiles.length})
            </p>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-green-200 hover:text-white"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const fileType = detectFileType(file.type)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-orange-500 bg-green-800 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white">
                      {getFileTypeIcon(fileType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-green-200">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-white hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full rounded-lg border border-orange-500 bg-green-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
