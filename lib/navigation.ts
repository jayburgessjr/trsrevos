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
    label: 'Content',
    href: '/content',
    icon: 'FileText',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'Kanban',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: 'PiggyBank',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Agents',
    href: '/agents',
    icon: 'Bot',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Partners',
    href: '/partners',
    icon: 'Building2',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Resources',
    href: '/resources',
    icon: 'BookOpen',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
  {
    label: 'Mail & Calendar',
    href: '/mail-calendar',
    icon: 'CalendarClock',
    roles: ['SuperAdmin', 'Admin', 'Director', 'Member'],
  },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Pipeline', href: '/pipeline', icon: 'TrendingUp' },
  { label: 'Clients', href: '/clients', icon: 'Users' },
  { label: 'Projects', href: '/projects', icon: 'Kanban' },
  { label: 'Partners', href: '/partners', icon: 'Building2' },
]

export const APP_TITLE = 'TRS Internal SaaS'
