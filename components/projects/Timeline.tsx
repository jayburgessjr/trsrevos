"use client";

import { useMemo } from "react";

export type TimelineItem = {
  id: string;
  projectName: string;
  clientName: string | null;
  startDate: string | null;
  endDate: string | null;
};

type TimelinePoint = TimelineItem & {
  startValue: number;
  endValue: number;
};

export function ProjectTimeline({ items }: { items: TimelineItem[] }) {
  const processed = useMemo(() => {
    return items
      .map<TimelinePoint | null>((item) => {
        if (!item.startDate || !item.endDate) {
          return null;
        }
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return null;
        }
        return {
          ...item,
          startValue: start.getTime(),
          endValue: end.getTime(),
        };
      })
      .filter((entry): entry is TimelinePoint => Boolean(entry));
  }, [items]);

  if (!processed.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600">
        No project timelines recorded yet.
      </div>
    );
  }

  const minStart = Math.min(...processed.map((item) => item.startValue));
  const maxEnd = Math.max(...processed.map((item) => item.endValue));
  const span = Math.max(maxEnd - minStart, 1);
  const labelWidth = 160;
  const barHeight = 18;
  const gap = 12;
  const chartWidth = 640;
  const viewWidth = labelWidth + chartWidth + 16;
  const viewHeight = processed.length * (barHeight + gap) + gap;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-sm font-medium text-black">Timeline</div>
      <div className="mt-2 overflow-x-auto">
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="h-full w-full min-w-[320px]"
          role="img"
          aria-label="Project schedule overview"
        >
          {processed.map((item, index) => {
            const y = gap / 2 + index * (barHeight + gap);
            const offset = ((item.startValue - minStart) / span) * chartWidth;
            const width = Math.max(((item.endValue - item.startValue) / span) * chartWidth, 6);
            return (
              <g key={item.id}>
                <text x={8} y={y + barHeight / 1.5} fill="#6b7280" fontSize="11">
                  {item.projectName}
                  {item.clientName ? ` • ${item.clientName}` : ""}
                </text>
                <rect
                  x={labelWidth + offset}
                  y={y}
                  width={width}
                  height={barHeight}
                  rx={4}
                  fill="#111827"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
