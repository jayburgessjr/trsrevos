export type Role = "SuperAdmin" | "Admin" | "Director" | "Member" | "Client"

export type NavItem = {
  label: string
  href: string
  icon: string
  roles?: Role[]
  flag?: string
}

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Pipeline", href: "/pipeline", icon: "TrendingUp", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Clients", href: "/clients", icon: "Users", roles: ["SuperAdmin", "Admin", "Director", "Member", "Client"] },
  { label: "Content", href: "/content", icon: "FileText", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Projects", href: "/projects", icon: "Kanban", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
]

export const APP_TITLE = "TRS Internal SaaS"
