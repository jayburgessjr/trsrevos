"use client";
import { cn } from "@/lib/utils";
import type React from "react";

export function Card(
  { title, subtitle, action, className, children }:
  { title?: string; subtitle?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }
) {
  return (
    <section className={cn("rounded-xl border bg-white border-gray-200 overflow-hidden", className)}>
      {(title || action) && (
        <div className="h-11 px-3 flex items-center justify-between border-b border-gray-200">
          <div>
            <div className="text-sm font-medium leading-none text-black">{title}</div>
            {subtitle ? <div className="text-[11px] text-gray-500">{subtitle}</div> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
