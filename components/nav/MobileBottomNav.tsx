"use client"

import Link from 'next/link'
import * as Icons from 'lucide-react'

import { BOTTOM_NAV_ITEMS } from '@/lib/navigation'
import { cn, isActivePath } from '@/lib/utils'

type MobileBottomNavProps = {
  currentPath: string
  className?: string
}

/**
 * MobileBottomNav is fixed to the bottom of the viewport on screens smaller than `lg`.
 * It surfaces the five most-used destinations for quick thumb access.
 */
export default function MobileBottomNav({ currentPath, className }: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-2 py-2 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/80',
        className
      )}
      aria-label="Primary navigation"
    >
      <ul className="mx-auto flex max-w-3xl items-center justify-between gap-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon
          const active = isActivePath(currentPath, item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors',
                  active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-gray-900' : 'text-gray-400')} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
