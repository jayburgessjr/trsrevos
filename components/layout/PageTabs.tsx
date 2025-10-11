"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type PageTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange?: (tab: string) => void;
  hrefForTab?: (tab: string) => string;
  className?: string;
};

export function PageTabs({
  tabs,
  activeTab,
  onTabChange,
  hrefForTab,
  className,
}: PageTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-gray-200 pb-2",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        const tabClasses = cn(
          "border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "border-black text-black"
            : "text-gray-600 hover:text-black",
        );

        if (hrefForTab) {
          const href = hrefForTab(tab);
          return (
            <Link
              key={tab}
              href={href}
              className={tabClasses}
              aria-current={isActive ? "page" : undefined}
            >
              {tab}
            </Link>
          );
        }

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange?.(tab)}
            className={tabClasses}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
