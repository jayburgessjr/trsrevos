'use client';

import type { ReactNode } from 'react';

export default function CommandCard({
  title,
  desc,
  action,
  state,
}: {
  title: string;
  desc: string;
  action: ReactNode;
  state?: 'ready' | 'running' | 'locked';
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-black">{title}</div>
          <div className="text-[12px] text-gray-500">{desc}</div>
        </div>
        <div className="text-[11px] text-gray-600">{state}</div>
      </div>
      <div className="mt-2">{action}</div>
    </section>
  );
}
