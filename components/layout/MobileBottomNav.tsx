'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Bot, Calculator, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/clients-revos',
    label: 'Clients',
    icon: Users,
  },
  {
    href: '/agents',
    label: 'Agents',
    icon: Bot,
  },
  {
    href: '/brain',
    label: 'TRS Brain',
    icon: Brain,
  },
  {
    href: '/calculators',
    label: 'Calculators',
    icon: Calculator,
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname() ?? '/'

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-emerald-600'
                  : 'text-neutral-500 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-emerald-600' : 'text-neutral-400')} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
