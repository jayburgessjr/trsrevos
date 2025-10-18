export type NavItem = {
  label: string
  href: string
  icon: string
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Clients', href: '/clients-revos', icon: 'Building2' },
  { label: 'Projects', href: '/projects', icon: 'Kanban' },
  { label: 'Documents', href: '/documents', icon: 'Files' },
  { label: 'Agents', href: '/agents', icon: 'Bot' },
  { label: 'TRS Brain', href: '/brain', icon: 'Brain' },
  { label: 'Calculators', href: '/calculators', icon: 'Calculator' },
  { label: 'Content', href: '/content', icon: 'FileText' },
  { label: 'Resources', href: '/resources', icon: 'BookOpen' },
  { label: 'Integrations', href: '/settings/integrations', icon: 'Cable' },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Projects', href: '/projects', icon: 'Kanban' },
  { label: 'Documents', href: '/documents', icon: 'Files' },
  { label: 'Agents', href: '/agents', icon: 'Bot' },
  { label: 'Content', href: '/content', icon: 'FileText' },
]

export const APP_TITLE = 'TRS-RevOS'
