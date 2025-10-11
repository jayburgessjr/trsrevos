"use client"

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Icons from 'lucide-react'

import { MAIN_NAV, type NavItem } from '@/lib/navigation'
import { cn, isActivePath } from '@/lib/utils'

type HamburgerDrawerProps = {
  open: boolean
  onClose: () => void
}

/**
 * HamburgerDrawer is the slide-over navigation used on mobile and tablet breakpoints.
 * It lists every primary route plus secondary actions so users can jump across the suite.
 */
export default function HamburgerDrawer({ open, onClose }: HamburgerDrawerProps) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 h-full w-full bg-black/40"
        onClick={onClose}
      />
      <aside className="ml-auto flex h-full w-80 max-w-[90vw] flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="text-base font-semibold text-black">Navigation</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <DrawerSection title="Main">
            {MAIN_NAV.map((item) => (
              <DrawerLink
                key={item.href}
                item={item}
                currentPath={pathname ?? ''}
                onNavigate={onClose}
              />
            ))}
          </DrawerSection>
        </nav>
      </aside>
    </div>
  )
}

type DrawerSectionProps = {
  title: string
  children: ReactNode
}

function DrawerSection({ title, children }: DrawerSectionProps) {
  return (
    <section className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</div>
      <ul className="space-y-1">{children}</ul>
    </section>
  )
}

type DrawerLinkProps = {
  item: NavItem
  currentPath: string
  onNavigate: () => void
}

function DrawerLink({ item, currentPath, onNavigate }: DrawerLinkProps) {
  const active = isActivePath(currentPath, item.href)
  const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.Circle) as Icons.LucideIcon

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition-colors',
          active ? 'border-gray-900 bg-gray-900 text-white' : 'text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        )}
        onClick={(event) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return
          }
          onNavigate()
        }}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    </li>
  )
}
