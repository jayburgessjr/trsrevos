export type NavItem = {
  label: string
  href: string
  icon?: string
  flag?: string
  roles?: Array<'SuperAdmin' | 'Admin' | 'Director' | 'Member' | 'Client'>
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Morning briefing', href: '/', icon: 'Sun', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'Pipeline', href: '/pipeline', icon: 'TrendingUp', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'Projects', href: '/projects', icon: 'Kanban', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'AI Agents', href: '/agents', icon: 'Bot', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'Content', href: '/content', icon: 'FileText', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'Finance', href: '/finance', icon: 'Wallet', roles: ['SuperAdmin', 'Admin', 'Director'] },
  { label: 'Partners', href: '/partners', icon: 'Handshake', roles: ['SuperAdmin', 'Admin', 'Director', 'Member'] },
  { label: 'Clients', href: '/clients', icon: 'Users', roles: ['SuperAdmin', 'Admin', 'Director', 'Member', 'Client'] },
]

export const AUX_NAV: NavItem[] = [
  { label: 'Feature flags', href: '/admin/flags', icon: 'Sliders', flag: 'ops', roles: ['SuperAdmin', 'Admin'] },
]
