'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'
import { MAIN_NAV, AUX_NAV } from '@/lib/navigation'
import { canSee, Role, FLAGS } from '@/core/flags/flags'

export default function Sidebar({ role = 'SuperAdmin' as Role }) {
  const pathname = usePathname()

  const Item = ({ label, href, icon, flag, roles }: any) => {
    if (!canSee(role, roles)) return null
    if (flag && !FLAGS[flag]) return null

    const Icon = (Icons as any)[icon ?? 'Circle']
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))

    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
          active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
        }`}
      >
        {Icon ? <Icon size={16} /> : null}
        <span>{label}</span>
        {flag ? (
          <span className="ml-auto rounded-full border px-2 py-[2px] text-[10px] text-gray-600">{flag}</span>
        ) : null}
      </Link>
    )
  }

  return (
    <aside className="hidden shrink-0 border-r bg-white md:flex md:w-56 lg:w-64">
      <div className="w-full p-3">
        <div className="px-2 py-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Navigate</div>
        </div>
        <nav className="space-y-1">
          {MAIN_NAV.map((i) => (
            <Item key={i.href} {...i} />
          ))}
        </nav>
        <div className="px-2 py-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">Ops</div>
        </div>
        <nav className="space-y-1">
          {AUX_NAV.map((i) => (
            <Item key={i.href} {...i} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
