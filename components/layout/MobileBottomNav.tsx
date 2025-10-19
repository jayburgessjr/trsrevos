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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#004d28] border-t-2 border-[#fd8216] md:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all',
                isActive
                  ? 'bg-[#015e32] text-[#fd8216]'
                  : 'text-white/70 hover:text-white hover:bg-[#015e32]/50'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
