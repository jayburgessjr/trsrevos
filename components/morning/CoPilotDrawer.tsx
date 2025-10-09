"use client";

import { useState } from "react";

export default function CoPilotDrawer(){
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="text-xs px-2 py-1 rounded-md border">Ask Morning Agent</button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={()=>setOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Morning Agent</div>
              <button className="text-xs" onClick={()=>setOpen(false)}>Close</button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Ask things like: &ldquo;What moved ARR yesterday?&rdquo;, &ldquo;What&apos;s the fastest way to lift win rate 10% this week?&rdquo;
            </div>
            <textarea className="mt-3 w-full h-24 border rounded-md p-2 text-sm" placeholder="Type your question…" />
            <div className="mt-2">
              <button className="text-xs px-2 py-1 rounded-md border">Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
