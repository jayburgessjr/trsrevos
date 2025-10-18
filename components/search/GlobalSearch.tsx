'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Briefcase, X } from 'lucide-react'
import { useRevosData } from '@/app/providers/RevosDataProvider'

type SearchResult = {
  id: string
  title: string
  type: 'project' | 'document'
  description: string
  link: string
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { projects, documents } = useRevosData()

  // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        setResults([])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const searchQuery = query.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search projects
    projects.forEach((project) => {
      const matchesName = project.name.toLowerCase().includes(searchQuery)
      const matchesClient = project.client.toLowerCase().includes(searchQuery)
      const matchesType = project.type.toLowerCase().includes(searchQuery)

      if (matchesName || matchesClient || matchesType) {
        searchResults.push({
          id: project.id,
          title: project.name,
          type: 'project',
          description: `${project.client} • ${project.type} • ${project.status}`,
          link: '/projects'
        })
      }
    })

    // Search documents
    documents.forEach((doc) => {
      const matchesTitle = doc.title.toLowerCase().includes(searchQuery)
      const matchesDescription = doc.description.toLowerCase().includes(searchQuery)
      const matchesType = doc.type.toLowerCase().includes(searchQuery)
      const matchesTags = doc.tags.some(tag => tag.toLowerCase().includes(searchQuery))

      if (matchesTitle || matchesDescription || matchesType || matchesTags) {
        searchResults.push({
          id: doc.id,
          title: doc.title,
          type: 'document',
          description: `${doc.type} • ${doc.status} • v${doc.version}`,
          link: '/documents'
        })
      }
    })

    setResults(searchResults.slice(0, 10)) // Limit to 10 results
    setSelectedIndex(0)
  }, [query, projects, documents])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  const handleSelect = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-muted rounded border border-border">
          <span className="text-xs">⌘K</span>
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
        <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, documents..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  setResults([])
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <kbd className="px-2 py-0.5 text-xs font-mono bg-muted rounded border border-border">
                ESC
              </kbd>
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    result.type === 'project'
                      ? 'bg-[#015e32]/10 text-[#015e32]'
                      : 'bg-[#fd8216]/10 text-[#fd8216]'
                  }`}>
                    {result.type === 'project' ? (
                      <Briefcase className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{result.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold">
                    {result.type}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {/* Empty state */}
          {!query && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start typing to search projects and documents</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
