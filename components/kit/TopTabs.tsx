"use client";

import { usePathname } from "next/navigation";

import { PageTabs } from "@/components/layout/PageTabs";
import { resolveTabs } from "@/lib/tabs";

export function TopTabs({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const pathname = usePathname();
  const tabs = resolveTabs(pathname);
  const active = tabs.includes(value) ? value : tabs[0];

  return (
    <PageTabs
      tabs={tabs}
      activeTab={active}
      onTabChange={onChange}
      className="h-[44px] items-end gap-3 border-b-0 pb-0"
    />
  );
}
