"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Briefcase, FileText, PieChart, Settings, Users } from "lucide-react"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: PieChart },
  { label: "Pipeline", href: "/pipeline", icon: BarChart2 },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Settings", href: "/settings", icon: Settings },
]

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
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
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
