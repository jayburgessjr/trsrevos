"use client";

export default function KpiTile(
  { label, value, hint, onExpand }:
  { label:string; value:string; hint?:string; onExpand?:()=>void }
){
  return (
    <button onClick={onExpand} className="rounded-xl border border-gray-200 bg-white p-3 text-left hover:bg-gray-50">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-[22px] font-semibold leading-tight mt-1 text-black">{value}</div>
      {hint ? <div className="text-[11px] text-gray-500 mt-1">{hint}</div> : null}
    </button>
  );
}
