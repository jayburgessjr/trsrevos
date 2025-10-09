"use client";
import { useTransition, useState } from "react";
import { setExecScope } from "@/core/exec/actions";
import { cn } from "@/lib/utils";

const TIMES = ["TODAY","7D","MTD","QTD","YTD"] as const;

export default function ScopeBar({ initial = { time:"QTD", segment:{} } }: any) {
  const [pending, start] = useTransition();
  const [time, setTime] = useState<string>(initial.time);
  const [segment] = useState<any>(initial.segment);

  const apply = (t: string) => start(async () => {
    setTime(t);
    await setExecScope({ time: t as any, segment });
  });

  return (
    <div className="flex items-center gap-2">
      {TIMES.map(t => (
        <button key={t}
          onClick={()=>apply(t)}
          className={cn("px-2.5 h-8 rounded-md border text-xs",
          time===t? "bg-black text-white border-black":"bg-white text-gray-700 hover:bg-gray-100 border-gray-300")}
          disabled={pending}
        >{t}</button>
      ))}
      <div className="ml-2 text-xs text-gray-500">Segment:</div>
      <button className="px-2 h-8 rounded-md border text-xs bg-white text-gray-700 hover:bg-gray-100 border-gray-300">All</button>
    </div>
  );
}
