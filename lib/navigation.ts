export type Role = "SuperAdmin" | "Admin" | "Director" | "Member" | "Client"

export type NavItem = {
  label: string
  href: string
  icon: string
  roles?: Role[]
  flag?: string
}

export const MAIN_NAV: NavItem[] = [
  { label: "Morning briefing", href: "/", icon: "Sun", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Pipeline", href: "/pipeline", icon: "TrendingUp", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Projects", href: "/projects", icon: "Kanban", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Content", href: "/content", icon: "FileText", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Agents", href: "/agents", icon: "Bot", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Finance", href: "/finance", icon: "Wallet", roles: ["SuperAdmin", "Admin", "Director"] },
  { label: "Partners", href: "/partners", icon: "Handshake", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
  { label: "Clients", href: "/clients", icon: "Users", roles: ["SuperAdmin", "Admin", "Director", "Member", "Client"] },
  { label: "Feature flags", href: "/admin/flags", icon: "Sliders", roles: ["SuperAdmin", "Admin"], flag: "ops" },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ["SuperAdmin", "Admin", "Director", "Member"] },
]

export const APP_TITLE = "TRS Internal SaaS"
