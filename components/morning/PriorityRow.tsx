"use client";

export default function PriorityRow(
  { title, why, roi, effort, status, onCheck, onDefer }:
  { title:string; why:string; roi:number; effort:string; status:string; onCheck:()=>void; onDefer:()=>void }
){
  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-2 py-2">
      <div className="min-w-0">
        <div className="text-sm font-medium text-black truncate">{title}</div>
        <div className="text-[11px] text-gray-500 truncate">{why} • ROI ${roi.toLocaleString()} • Effort {effort}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onCheck} className="text-xs px-2 py-1 rounded-md border">Mark done</button>
        <button onClick={onDefer} className="text-xs px-2 py-1 rounded-md border">Defer</button>
      </div>
    </div>
  );
}
