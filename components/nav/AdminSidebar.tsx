"use client";
import { PieChart, ListChecks, Users, Layers, BarChart2, Settings } from "lucide-react";
import type React from "react";

export default function AdminSidebar() {
  const Item = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
    <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-gray-50">
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border text-gray-600">{icon}</span>
      <span className="text-black">{label}</span>
    </button>
  );
  return (
    <aside className="hidden md:flex flex-col shrink-0" style={{ width: 232, borderRightWidth: 1, borderRightColor: "#e5e7eb" }}>
      <nav className="p-2 text-sm">
        <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-gray-500">General</div>
        <div className="space-y-1">
          <Item label="Dashboard" icon={<PieChart size={14} />} />
          <Item label="Tasks" icon={<ListChecks size={14} />} />
          <Item label="Users" icon={<Users size={14} />} />
        </div>
        <div className="px-2 py-1 mt-3 text-[11px] uppercase tracking-wide text-gray-500">Pages</div>
        <div className="space-y-1">
          <Item label="Auth" icon={<Layers size={14} />} />
          <Item label="Errors" icon={<BarChart2 size={14} />} />
        </div>
        <div className="px-2 py-1 mt-3 text-[11px] uppercase tracking-wide text-gray-500">Other</div>
        <div className="space-y-1">
          <Item label="Settings" icon={<Settings size={14} />} />
          <Item label="Developers" icon={<Layers size={14} />} />
        </div>
      </nav>
    </aside>
  );
}
