"use client"

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'

import { MAIN_NAV } from '@/lib/navigation'

export type SearchOverlayProps = {
  open: boolean
  query: string
  onQueryChange: (value: string) => void
  onClose: () => void
}

export default function SearchOverlay({ open, query, onQueryChange, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => {
      document.body.style.overflow = ''
      window.clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) {
      return MAIN_NAV
    }
    return MAIN_NAV.filter((item) => item.label.toLowerCase().includes(trimmed))
  }, [query])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pb-10 pt-24 sm:pt-28"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search clients, projects, or destinations"
            className="h-10 flex-1 bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
            aria-label="Search across TRS RevenueOS"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            Esc
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto px-2 py-3">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">
              No matches yet. Try searching for pipeline, partners, or a workspace.
            </p>
          ) : (
            <ul className="space-y-1">
              {results.map((item) => {
                const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Search) as Icons.LucideIcon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      onClick={(event) => {
                        if (
                          event.defaultPrevented ||
                          event.button !== 0 ||
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey
                        ) {
                          return
                        }
                        onClose()
                      }}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="flex flex-1 flex-col items-start">
                        <span>{item.label}</span>
                        <span className="text-xs text-gray-500">{item.href}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wide text-gray-400">Go</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
