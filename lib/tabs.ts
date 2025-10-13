export const PAGE_TABS: Record<string, string[]> = {
  "/": ["Today", "This Week", "Focus Blocks", "Risks", "Morning Brief"],
  "/dashboard": ["Overview", "Analytics", "Reports", "Notifications"],
  "/pipeline": ["Overview", "Deals", "Commit", "Forecast", "Health"],
  "/partners": ["Overview", "Directory", "Introductions", "Enablement"],
  "/morning": ["Today", "This Week", "Focus Blocks", "Risks", "Morning Brief"],
  "/projects": ["Overview", "Active", "Forecast", "Agent"],
  "/content": ["Overview", "Pipeline", "Ideas", "Scheduled", "Performance", "Create", "Advertising"],
  "/agents": ["All", "Projects", "Content", "Clients", "GPT Agents"],
  "/mail-calendar": ["Inbox", "Calendar", "Integrations"],
  "/resources": [
    "Core Revenue",
    "Pricing",
    "Retention & LTV",
    "Growth & Demand",
    "Profitability & Margin",
    "Strategic Value",
    "Specialized Industry",
    "Advisory Layer",
  ],
  "/settings": ["Agents", "Appearance", "Integrations", "Feature Flags", "Behavior"],
  "/clients": ["Overview", "Accounts", "Engagement", "Renewals", "Signals"],
  "/clients/[id]": [
    "Overview",
    "Projects",
    "RevenueOS",
    "Content",
    "Data",
    "Strategy",
    "Results",
    "Deliverables",
    "Finance",
  ],
  "/partners/[id]": ["Overview", "Introductions", "Initiatives", "Notes", "Resources"],
  "/finance": ["Overview", "Equity", "Billing", "Subscriptions", "Expenses", "Cash Flow"],
};

export function resolveTabs(pathname: string): string[] {
  if (PAGE_TABS[pathname]) {
    return PAGE_TABS[pathname];
  }

  const dynamicMatch = Object.entries(PAGE_TABS).find(([pattern]) => {
    if (!pattern.includes("[")) {
      return false;
    }

    const regex = new RegExp(
      `^${pattern
        .split("/")
        .map((segment) =>
          segment.startsWith("[") && segment.endsWith("]") ? "[^/]+" : segment,
        )
        .join("/")}$`,
    );

    return regex.test(pathname);
  });

  if (dynamicMatch) {
    return dynamicMatch[1];
  }

  const prefixMatch = Object.entries(PAGE_TABS).find(([pattern]) =>
    pathname.startsWith(`${pattern}/`),
  );

  if (prefixMatch) {
    return prefixMatch[1];
  }

  return ["Overview"];
}
