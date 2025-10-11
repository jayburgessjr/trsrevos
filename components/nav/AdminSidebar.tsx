"use client"

import type { ComponentType, SVGProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bot,
  Building2,
  FileText,
  ListChecks,
  Settings as SettingsIcon,
  Sun,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip"

type NavItem = {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const NAV_ITEMS: NavItem[] = [
  { label: "Morning Brief", href: "/", icon: Sun },
  { label: "Pipeline", href: "/pipeline", icon: TrendingUp },
  { label: "Projects", href: "/projects", icon: ListChecks },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Partners", href: "/partners", icon: Building2 },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Agents", href: "/agents", icon: Bot },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden h-full w-[232px] shrink-0 border-r border-gray-200 bg-white xl:flex">
      <TooltipProvider delayDuration={0}>
        <nav className="flex w-full flex-col gap-1 px-3 py-6 text-sm">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-gray-50 ${
                      active ? "font-semibold text-black" : "text-gray-600"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors group-hover:border-gray-300 group-hover:text-black ${
                        active ? "border-gray-300 text-black" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-sm">{item.label}</span>
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 border-l-2 border-black" aria-hidden />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </TooltipProvider>
    </aside>
  )
}
