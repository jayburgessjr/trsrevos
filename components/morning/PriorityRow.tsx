'use client';

export default function PriorityRow({
  title,
  why,
  roi,
  effort,
  status,
  onCheck,
  onDefer,
}: {
  title: string;
  why: string;
  roi: number;
  effort: string;
  status: string;
  onCheck: () => void;
  onDefer: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2 py-2">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-black">{title}</div>
        <div className="truncate text-[11px] text-gray-500">
          {why} • ROI ${roi.toLocaleString()} • Effort {effort} • Status {status}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onCheck} className="rounded-md border px-2 py-1 text-xs">
          Mark done
        </button>
        <button onClick={onDefer} className="rounded-md border px-2 py-1 text-xs">
          Defer
        </button>
      </div>
    </div>
  );
}
