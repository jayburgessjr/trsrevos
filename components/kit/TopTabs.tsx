"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { resolveTabs } from "@/lib/tabs";

export function TopTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pathname = usePathname();
  const tabs = resolveTabs(pathname);
  const active = tabs.includes(value) ? value : tabs[0];

  return (
    <div className="flex h-[44px] items-center gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "h-8 rounded-md border px-3 text-sm transition-colors",
            active === t
              ? "border-gray-900 bg-white font-semibold text-black"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-black",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
