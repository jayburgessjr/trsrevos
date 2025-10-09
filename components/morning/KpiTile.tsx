"use client";

export default function KpiTile(
  { label, value, hint, onExpand }:
  { label:string; value:string; hint?:string; onExpand?:()=>void }
){
  return (
    <button onClick={onExpand} className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 space-y-2 transition-colors">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
      {hint ? <div className="flex items-center gap-2 text-xs text-gray-600"><span className="font-medium text-gray-700">↑ 0%</span><span>{hint}</span></div> : null}
    </button>
  );
}
