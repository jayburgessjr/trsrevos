"use client";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const DEFAULTS = ["Overview", "Analytics", "Reports", "Notifications"] as const;
export type TabName = (typeof DEFAULTS)[number];

export function TopTabs({ tabs = DEFAULTS }: { tabs?: readonly string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const active = (sp.get("tab") || tabs[0]) as string;

  const setTab = useCallback(
    (t: string) => {
      const next = new URLSearchParams(sp.toString());
      next.set("tab", t);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
  );

  return (
    <div className="h-[44px] flex items-center gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          aria-pressed={active === t}
          className={cn(
            "px-3 h-8 rounded-md text-sm border",
            active === t
              ? "bg-black text-white border-black"
              : "text-gray-700 bg-white hover:bg-gray-100 border-gray-300",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
