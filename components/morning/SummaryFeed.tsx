"use client";

export default function SummaryFeed({ items }:{ items:string[] }){
  return (
    <div className="space-y-2">
      {items.map((m,i)=>(
        <div key={i} className="rounded-md border border-gray-200 bg-white p-2 text-[13px] text-gray-700">{m}</div>
      ))}
    </div>
  );
}
