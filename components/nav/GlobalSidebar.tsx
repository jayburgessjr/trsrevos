"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Icons from "lucide-react"
import { MAIN_NAV } from "@/lib/navigation"

export default function GlobalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex shrink-0 border-r border-gray-200 bg-white" style={{ width: 232 }}>
      <nav className="p-2 text-sm w-full">
        <div className="px-2 py-2 text-xs uppercase tracking-wide text-gray-500 font-medium">General</div>
        <div className="space-y-1">
          {MAIN_NAV.map((item) => {
            const Icon = (Icons as any)[item.icon] ?? (Icons as any).Circle
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-600">
                  <Icon size={14} />
                </span>
                <span>{item.label}</span>
                <span className="ml-auto" />
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
