'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation Item Type
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  external?: boolean;
}

/**
 * Sidebar Props
 */
export interface SidebarProps {
  /** Navigation items to display */
  items: NavItem[];
  /** Logo or branding component */
  logo?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Custom className */
  className?: string;
  /** Collapsed state */
  collapsed?: boolean;
  /** Callback when nav item is clicked */
  onNavClick?: (item: NavItem) => void;
}

/**
 * TRS Sidebar Component
 *
 * Persistent navigation sidebar matching the TRS design system.
 * Features active state detection, badge support, and collapse functionality.
 *
 * @example
 * ```tsx
 * <Sidebar
 *   items={[
 *     { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
 *     { label: 'Clients', href: '/clients' },
 *   ]}
 *   logo={<img src="/logo.svg" alt="TRS" />}
 * />
 * ```
 */
export function Sidebar({
  items,
  logo,
  footer,
  className = '',
  collapsed = false,
  onNavClick,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen
        bg-trs-surface border-r border-trs-border
        flex flex-col
        transition-all duration-base ease-smooth
        ${collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'}
        ${className}
      `}
    >
      {/* Logo / Branding */}
      {logo && (
        <div
          className={`
            flex items-center justify-center
            h-header border-b border-trs-border
            px-6
          `}
        >
          {logo}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <ul className="space-y-1">
          {items.map((item, index) => {
            const active = isActive(item.href);

            return (
              <li key={item.href + index}>
                <Link
                  href={item.href}
                  onClick={() => onNavClick?.(item)}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className={`
                    flex items-center gap-3
                    px-4 py-3
                    rounded-trs-base
                    font-medium text-sm
                    transition-all duration-fast
                    ${
                      active
                        ? 'bg-trs-accent text-white shadow-trs-card'
                        : 'text-trs-text-secondary hover:bg-trs-surface-hover hover:text-trs-text-primary'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  {/* Icon */}
                  {item.icon && (
                    <span className="flex-shrink-0 w-5 h-5">
                      {item.icon}
                    </span>
                  )}

                  {/* Label */}
                  {!collapsed && (
                    <span className="flex-1">
                      {item.label}
                    </span>
                  )}

                  {/* Badge */}
                  {!collapsed && item.badge && (
                    <span
                      className={`
                        px-2 py-0.5
                        rounded-full
                        text-xs font-semibold
                        ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-trs-accent text-white'
                        }
                      `}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {footer && !collapsed && (
        <div className="border-t border-trs-border p-4">
          {footer}
        </div>
      )}
    </aside>
  );
}

/**
 * Default TRS Navigation Items
 *
 * Standard navigation structure for TRS applications.
 * Can be customized or extended per app.
 */
export const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Clients', href: '/clients' },
  { label: 'Projects', href: '/projects' },
  { label: 'Documents', href: '/documents' },
  { label: 'Agents', href: '/agents' },
  { label: 'TRS Brain', href: '/trs-brain' },
  { label: 'Calculators', href: '/calculators' },
  { label: 'Content', href: '/content' },
  { label: 'Resources', href: '/resources' },
];

export default Sidebar;
