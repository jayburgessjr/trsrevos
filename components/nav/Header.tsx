"use client"

import type { ChangeEvent } from 'react'
import { useCallback } from 'react'
import { Search, Menu, Bell, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export type HeaderProps = {
  onMenuToggle?: () => void
  onSearch?: (term: string) => void
}

/**
 * Header renders the cross-application masthead that remains visible on every route.
 * On small screens the hamburger button is shown so users can reveal the drawer.
 * Search collapses to an icon on narrow widths and expands to a full input on `sm`.
 */
export default function Header({ onMenuToggle, onSearch }: HeaderProps) {
  const handleInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (onSearch) {
        onSearch(event.target.value)
      }
    },
    [onSearch]
  )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex flex-1 items-center gap-3">
          <span className="text-base font-semibold text-black sm:text-lg">TRS RevenueOS</span>

          <div className="relative hidden w-full max-w-md items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 sm:flex">
            <Search className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search clients, projects, or docs"
              className="h-6 w-full bg-transparent text-sm text-black placeholder:text-gray-400 focus:outline-none"
              onChange={handleInput}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black sm:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(
              'group flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black'
            )}
            aria-label="Open profile menu"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
              TRS
            </span>
            <span className="hidden sm:inline">Profile</span>
            <ChevronDown className="h-4 w-4 text-gray-500 transition group-hover:text-gray-700" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
