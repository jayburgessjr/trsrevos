const footerLinks = [
  {
    label: "TRS Webpage",
    href: "https://www.therevenuesource.com",
    external: true,
  },
  {
    label: "LinkedIn Page",
    href: "https://www.linkedin.com/company/the-revenue-source/",
    external: true,
  },
  {
    label: "Contact",
    href: "mailto:hello@therevenuesource.com",
    external: false,
  },
]

export function AppFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-center sm:text-left">© {new Date().getFullYear()} TRS RevenueOS. All rights reserved.</p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-gray-700">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-gray-900 hover:underline"
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default AppFooter
