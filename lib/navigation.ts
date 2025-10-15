export type Role = 'SuperAdmin' | 'Admin' | 'Director' | 'Member' | 'Client'

export type NavItem = {
  label: string
  href: string
  icon: string
  roles?: Role[]
  flag?: string
}

/**
 * MAIN_NAV drives both the desktop sidebar and the hamburger drawer menu.
 * Keep entries ordered by user relevance to reduce scan time on mobile.
 */
export const MAIN_NAV: NavItem[] = [
  {
    label: 'Morning Brief',
    href: '/',
    icon: 'Sun',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'],
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Telemetry',
    href: '/dashboard/telemetry',
    icon: 'Activity',
    roles: ['SuperAdmin', 'Admin', 'Director'],
  },
  {
    label: 'Pipeline',
    href: '/pipeline',
    icon: 'TrendingUp',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: 'Users',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'],
  },
  {
    label: 'Partners',
    href: '/partners',
    icon: 'Building2',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'Kanban',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Content',
    href: '/content',
    icon: 'FileText',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: 'Files',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'],
  },
  {
    label: 'Agents',
    href: '/agents',
    icon: 'Bot',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Playbooks',
    href: '/ops/playbooks',
    icon: 'ListChecks',
    roles: ['SuperAdmin', 'Admin', 'Director'],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: 'PiggyBank',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: 'BookOpen',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'],
  },
  {
    label: 'Revenue Clear',
    href: '/resources?tab=Revenue%20Clear',
    icon: 'Calculator',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Morning Brief', href: '/', icon: 'Sun' },
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Pipeline', href: '/pipeline', icon: 'TrendingUp' },
  { label: 'Clients', href: '/clients', icon: 'Users' },
  { label: 'Partners', href: '/partners', icon: 'Building2' },
]

export const APP_TITLE = 'TRS Internal SaaS'
