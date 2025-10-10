"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { MAIN_NAV } from "@/lib/navigation"
import { canSee, Role } from "@/core/flags/flags"

const DEFAULT_ROLE: Role = "SuperAdmin"

export default function AdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`relative hidden h-full shrink-0 border-r border-gray-200 bg-white transition-all duration-200 md:flex ${
        open ? "w-56" : "w-14"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="absolute top-3 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-xs text-gray-600 hover:bg-gray-50"
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        ≡
      </button>
      <nav className="flex w-full flex-col gap-1 p-2 text-sm">
        {MAIN_NAV.map((item) => {
          if (!canSee(DEFAULT_ROLE, item.roles)) return null

          const iconKey = item.icon as keyof typeof Icons
          const Icon = (Icons[iconKey] as LucideIcon | undefined) ?? Icons.Circle
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors ${
                active ? "border border-gray-200 bg-white text-black" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-600">
                <Icon size={14} />
              </span>
              {open && <span className="text-sm font-medium text-black">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
