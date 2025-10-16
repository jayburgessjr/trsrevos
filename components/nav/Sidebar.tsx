'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MAIN_NAV } from '@/lib/navigation'
import { isActivePath } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const currentPath = pathname ?? ''

  return (
    <aside className="hidden w-72 border-r border-slate-200 md:block">
      <div className="p-4">
        <nav className="space-y-1 text-sm">
          {MAIN_NAV.map((item) => {
            const active = isActivePath(currentPath, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                  active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
