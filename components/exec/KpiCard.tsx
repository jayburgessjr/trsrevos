"use client";

export default function KpiCard({ label, value, hint, onClick }: { label:string; value:string; hint?:string; onClick?:()=>void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50 transition-colors space-y-2"
    >
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
      {hint ? <div className="text-xs text-gray-600">{hint}</div> : null}
    </button>
  );
}
