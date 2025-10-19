'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader } from '@/ui/card'
import { ArrowLeft, Calendar, User, FolderOpen } from 'lucide-react'
import type { Resource } from '@/lib/resources'

export default function ResourceViewer({ resource }: { resource: Resource }) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/resources">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>
      </Link>

      {/* Header Card */}
      <Card className="border-2 border-[#fd8216]">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {resource.metadata.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-[#fd8216]" />
                  <span className="font-medium">{resource.metadata.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#fd8216]" />
                  <span>{resource.metadata.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#fd8216]" />
                  <span>Updated {resource.metadata.lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {resource.metadata.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-[#fd8216] text-[#fd8216]">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Content Card */}
      <Card>
        <CardContent className="pt-8">
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-[#015e32] hover:prose-a:text-[#fd8216] prose-code:text-[#015e32] prose-pre:bg-[#004d28] prose-pre:text-white prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b-2 prose-h2:border-[#fd8216] prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-lg prose-blockquote:border-l-4 prose-blockquote:border-[#fd8216] prose-blockquote:bg-[#015e32]/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-table:border-collapse prose-th:bg-[#015e32] prose-th:text-white prose-th:p-3 prose-td:border prose-td:border-slate-300 prose-td:p-3 prose-hr:border-[#fd8216]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {resource.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
