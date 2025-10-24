'use client'

import { X, Download, FileText } from 'lucide-react'
import { Button } from '@/ui/button'
import type { Document } from '@/lib/revos/types'

type DocumentViewerModalProps = {
  document: Document
  onClose: () => void
}

export default function DocumentViewerModal({ document, onClose }: DocumentViewerModalProps) {
  const handleDownloadPDF = () => {
    // Create a simple HTML document for PDF conversion
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${document.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #015e32;
              border-bottom: 3px solid #fd8216;
              padding-bottom: 10px;
            }
            .meta {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .meta-item {
              margin: 5px 0;
            }
            .content {
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .tag {
              display: inline-block;
              background: #015e32;
              color: white;
              padding: 3px 8px;
              border-radius: 3px;
              margin: 2px;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${document.title}</h1>
          <div class="meta">
            <div class="meta-item"><strong>Type:</strong> ${document.type}</div>
            <div class="meta-item"><strong>Status:</strong> ${document.status}</div>
            <div class="meta-item"><strong>Version:</strong> ${document.version}</div>
            <div class="meta-item"><strong>Last Updated:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</div>
            ${document.tags.length > 0 ? `<div class="meta-item"><strong>Tags:</strong> ${document.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>` : ''}
          </div>
          <div class="content">
            ${document.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
          </div>
          ${document.summary ? `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;"><strong>Summary:</strong><br>${document.summary}</div>` : ''}
        </body>
      </html>
    `

    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-[#121212] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#015e32]" />
            <h2 className="text-2xl font-bold text-foreground">{document.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="p-6 border-b border-border bg-gray-50 dark:bg-[#0a0a0a]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-semibold text-foreground">{document.type}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <p className="font-semibold text-foreground">{document.status}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Version:</span>
              <p className="font-semibold text-foreground">v{document.version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated:</span>
              <p className="font-semibold text-foreground">
                {new Date(document.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {document.tags.length > 0 && (
            <div className="mt-4">
              <span className="text-muted-foreground text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {document.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#015e32] text-white text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {document.description.split('\n\n').map((paragraph, index) => {
              // Handle bold markdown
              const formatted = paragraph.replace(
                /\*\*(.*?)\*\*/g,
                '<strong>$1</strong>'
              )
              return (
                <p
                  key={index}
                  className="mb-4 text-foreground"
                  dangerouslySetInnerHTML={{ __html: formatted }}
                />
              )
            })}
          </div>
          {document.summary && (
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-semibold text-foreground mb-2">Summary</h3>
              <p className="text-muted-foreground">{document.summary}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-gray-50 dark:bg-[#0a0a0a] flex gap-3">
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-[#015e32] hover:bg-[#01753d] text-white"
          >
            <Download className="h-4 w-4" />
            Download HTML
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
