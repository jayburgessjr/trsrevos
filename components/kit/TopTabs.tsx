"use client";
import { cn } from "@/lib/utils";

export function TopTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tabs = ["Overview", "Analytics", "Reports", "Notifications"];
  return (
    <div className="h-[44px] flex items-center gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "px-3 h-8 rounded-md text-sm border",
            value === t ? "bg-black text-white border-black" : "text-gray-700 bg-white hover:bg-gray-100 border-gray-300",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
