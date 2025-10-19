'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { BookOpen, Search, Filter, ExternalLink } from 'lucide-react'
import type { Resource } from '@/lib/resources'

type ResourcesPageClientProps = {
  resources: Resource[]
  categories: string[]
}

export default function ResourcesPageClient({ resources, categories }: ResourcesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        searchTerm === '' ||
        resource.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.metadata.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [resources, searchTerm, selectedCategory])

  const resourcesByCategory = useMemo(() => {
    return filteredResources.reduce<Record<string, Resource[]>>((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = []
      }
      acc[resource.category].push(resource)
      return acc
    }, {})
  }, [filteredResources])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            TRS frameworks, playbooks, and delivery resources
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-5 w-5 text-[#fd8216]" />
          <span className="font-semibold">{resources.length} resources</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5 text-[#fd8216]" />
              Search Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or tags..."
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-5 w-5 text-[#fd8216]" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                selectedCategory === 'all'
                  ? 'border-[#fd8216] bg-[#015e32] text-white'
                  : 'border-border bg-card text-foreground hover:border-[#fd8216]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">All Resources</span>
                <Badge variant="outline" className={selectedCategory === 'all' ? 'bg-white text-[#015e32]' : ''}>
                  {resources.length}
                </Badge>
              </div>
            </button>

            {categories.map((category) => {
              const count = resources.filter((r) => r.category === category).length
              const categoryLabel = category
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-all ${
                    selectedCategory === category
                      ? 'border-[#fd8216] bg-[#015e32] text-white'
                      : 'border-border bg-card text-foreground hover:border-[#fd8216]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{categoryLabel}</span>
                    <Badge
                      variant="outline"
                      className={selectedCategory === category ? 'bg-white text-[#015e32]' : ''}
                    >
                      {count}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Resources by Category - 3 Column Layout */}
      {Object.entries(resourcesByCategory).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No resources found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {Object.entries(resourcesByCategory).map(([category, categoryResources]) => {
            const categoryLabel = category
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            return (
              <Card key={category} className="border-2 border-[#fd8216] flex flex-col">
                <CardHeader className="pb-4 bg-[#015e32] text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold">{categoryLabel}</CardTitle>
                  <CardDescription className="text-white/80">
                    {categoryResources.length} {categoryResources.length === 1 ? 'resource' : 'resources'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <div className="space-y-3">
                    {categoryResources.map((resource) => (
                      <Link
                        key={resource.slug}
                        href={`/resources/view/${resource.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border-2 border-border bg-card hover:border-[#fd8216] hover:shadow-md transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-foreground group-hover:text-[#015e32]">
                                {resource.metadata.title}
                              </h3>
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-[#fd8216] flex-shrink-0" />
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {resource.metadata.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              <span>Updated {resource.metadata.lastUpdated}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Resource Info */}
      <Card className="border-dashed border-2 border-[#fd8216] bg-[#015e32]/5">
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 text-[#fd8216] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Want to add a resource?</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Add markdown (.md) files to the <code className="bg-[#004d28] text-white px-2 py-1 rounded">content/resources/</code> folder.
            They&apos;ll automatically appear here with full formatting, code highlighting, and TRS branding.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
