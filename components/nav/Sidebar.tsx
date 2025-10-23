'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MAIN_NAV } from '@/lib/navigation'
import { isActivePath } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'

export default function Sidebar() {
  const pathname = usePathname()
  const currentPath = pathname ?? ''
  const { counts, isLoading } = useNotifications()

  const getNotificationCount = (href: string): number => {
    if (isLoading) return 0

    switch (href) {
      case '/clients-revos':
        return counts.newClients
      case '/projects':
        return counts.newProjects
      case '/documents':
        return counts.newDocuments
      default:
        return 0
    }
  }

  return (
    <aside className="hidden w-72 border-r border-slate-200 md:block">
      <div className="p-4">
        <nav className="space-y-1 text-sm">
          {MAIN_NAV.map((item) => {
            const active = isActivePath(currentPath, item.href)
            const notificationCount = getNotificationCount(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                  active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span className="flex-1">{item.label}</span>
                {notificationCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#fd8216] px-1.5 text-xs font-semibold text-white">
                    {notificationCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
