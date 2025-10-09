"use client";
import Link from "next/link";
import { AlertItem } from "@/core/exec/types";

export default function AlertList({ items }:{ items: AlertItem[] }) {
  return (
    <div className="space-y-2">
      {items.map(a => (
        <div key={a.id} className="rounded-md border border-gray-200 text-sm p-2 flex items-center justify-between bg-white hover:bg-gray-50">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${a.severity==="high"?"bg-red-600":a.severity==="med"?"bg-yellow-500":"bg-gray-400"}`}/>
            <div className="text-gray-900">{a.message}</div>
          </div>
          <Link className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100" href={a.href}>{a.actionLabel}</Link>
        </div>
      ))}
    </div>
  );
}
