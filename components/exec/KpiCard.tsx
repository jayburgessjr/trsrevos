"use client";

export default function KpiCard({ label, value, hint, onClick }: { label:string; value:string; hint?:string; onClick?:()=>void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-white px-4 py-5 text-center hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
    >
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-[22px] font-semibold leading-tight mt-1 text-black">{value}</div>
      {hint ? <div className="text-[11px] text-gray-500 mt-1">{hint}</div> : null}
    </button>
  );
}
