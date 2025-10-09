export const PAGE_TABS: Record<string, string[]> = {
  "/": ["Today", "This Week", "Focus Blocks", "Risks"],
  "/dashboard": ["Overview", "Analytics", "Reports", "Notifications"],
  "/pipeline": ["Overview", "Deals", "Commit", "Forecast", "Health"],
  "/morning": ["Today", "This Week", "Focus Blocks", "Risks"],
  "/projects": ["Overview", "Active", "Forecast", "Agent"],
  "/content": ["Pipeline", "Ideas", "Scheduled", "Performance"],
  "/agents": ["All", "Projects", "Content", "Clients", "GPT Agents"],
  "/clients": ["Accounts", "Health", "Churn", "QBR", "History"],
  "/clients/[id]": ["Overview", "Projects", "RevenueOS", "Data", "Strategy", "Results"],
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
