'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Topbar() {
  const path = usePathname()
  const parts = path.split('/').filter(Boolean)

  return (
    <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-12 items-center gap-3 px-4">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-800">
            Home
          </Link>
          {parts.map((p, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span>/</span>
              <span className="capitalize text-gray-800">{p}</span>
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700 sm:inline">
            TRS Score 68
          </span>
          <button data-cmdk className="rounded-md border px-2 py-1 text-xs">
            ⌘K Command
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-200" />
        </div>
      </div>
    </header>
  )
}
