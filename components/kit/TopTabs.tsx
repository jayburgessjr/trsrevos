"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { resolveTabs } from "@/lib/tabs";

export function TopTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pathname = usePathname();
  const tabs = resolveTabs(pathname);
  const active = tabs.includes(value) ? value : tabs[0];

  return (
    <div className="h-[44px] flex items-center gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-3 h-8 rounded-md text-sm border transition-colors",
            active === t
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
