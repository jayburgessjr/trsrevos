'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MAIN_NAV, AUX_NAV } from '@/lib/navigation'
import { canSee, Role, FLAGS } from '@/core/flags/flags'

export default function Sidebar({ role = 'SuperAdmin' as Role }) {
  const pathname = usePathname()

  const Item = ({ label, href, flag, roles }: any) => {
    if (!canSee(role, roles)) return null
    if (flag && !FLAGS[flag]) return null

    const active = pathname === href || (href !== '/' && pathname.startsWith(href))

    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
          active
            ? 'bg-[var(--trs-accent)] text-white'
            : 'hover:bg-gray-50 dark:hover:bg-neutral-900'
        }`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-neutral-700" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <aside className="hidden md:block w-72 border-r border-gray-200 dark:border-neutral-800">
      <div className="p-3">
        <div className="mb-2">
          <input
            className="w-full rounded-md border px-3 py-2 text-sm placeholder:text-gray-400 border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:placeholder:text-neutral-500"
            placeholder="Search accounts, deals…"
          />
        </div>

        <nav className="space-y-1">
          {MAIN_NAV.map((i) => (
            <Item key={i.href} {...i} />
          ))}
          {AUX_NAV.map((i) => (
            <Item key={i.href} {...i} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
