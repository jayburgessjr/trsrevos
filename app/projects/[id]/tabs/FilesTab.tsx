'use client'

import { useState } from 'react'
import FileUploader from '@/components/files/FileUploader'
import FileList from '@/components/files/FileList'
import { FileText } from 'lucide-react'
import type { ProjectWorkspaceProject } from '../ProjectWorkspace'

interface FilesTabProps {
  project: ProjectWorkspaceProject
}

export default function FilesTab({ project }: FilesTabProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    // Trigger re-render of file list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Upload Files</h3>
        </div>
        <p className="mb-4 text-sm text-green-200">
          Upload files to attach them to this project. Files are versioned automatically when you upload
          a file with the same name.
        </p>
        <FileUploader
          resourceType="project"
          resourceId={project.id}
          onUploadComplete={handleUploadComplete}
        />
      </div>

      <div className="rounded-lg border border-orange-500 bg-green-800 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Project Files</h3>
        <FileList key={refreshKey} resourceType="project" resourceId={project.id} />
      </div>
    </div>
  )
}
