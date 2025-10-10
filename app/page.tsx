"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { TRS_CARD } from "@/lib/style";
import CommandCard from "@/components/morning/CommandCard";
import KpiTile from "@/components/morning/KpiTile";
import PriorityRow from "@/components/morning/PriorityRow";
import SummaryFeed from "@/components/morning/SummaryFeed";
import CoPilotDrawer from "@/components/morning/CoPilotDrawer";
import NewsTicker from "@/components/morning/NewsTicker";
import NewsFeed from "@/components/morning/NewsFeed";
import { computePlan, lockPlan, startFocusBlock, completeFocusBlock, downloadIcal, generateRecap, getMorningState } from "@/core/morning/actions";

type S = Awaited<ReturnType<typeof getMorningState>>;

export default function MorningPage(){
  const [s, setS] = useState<S|null>(null);
  const [pending, start] = useTransition();

  useEffect(() => { (async()=> setS(await getMorningState()))(); }, []);

  const refresh = async () => setS(await getMorningState());

  if(!s) return <div className="p-3 text-sm text-gray-600">Loading…</div>;

  const greeting = new Date().toLocaleDateString(undefined, { weekday:"long", month:"short", day:"numeric" });

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
        {/* Header / Context */}
        <section className={cn(TRS_CARD, "p-3")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-black">Good morning</div>
              <div className="text-[12px] text-gray-500">{greeting} • Momentum: {s.momentum} • {s.note}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>start(async()=>{ await computePlan(); await refresh(); })} disabled={pending} className="text-xs px-2 py-1 rounded-md border">Compute Plan</button>
              <button onClick={()=>start(async()=>{ await lockPlan(); await refresh(); })} disabled={pending} className="text-xs px-2 py-1 rounded-md border">{s.planLocked ? "Locked" : "Lock Plan"}</button>
              <button onClick={()=>start(async()=>{ await downloadIcal(); })} className="text-xs px-2 py-1 rounded-md border">Download iCal</button>
              <CoPilotDrawer/>
            </div>
          </div>
        </section>

        {/* Section 1: KPI Cards */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <KpiTile label="Pipeline Dollars" value={`${s.kpis.pipelineDollars.toLocaleString()}`} hint="vs yesterday" />
          <KpiTile label="Win Rate" value={`${s.kpis.winRatePct}%`} />
          <KpiTile label="Price Realization" value={`${s.kpis.priceRealizationPct}%`} />
          <KpiTile label="Focus Sessions" value={`${s.kpis.focusSessionsToday}`} hint="Completed today" />
        </section>

        {/* Section 2: Focus & Task Related */}
        <section className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <CommandCard
              title="Start Focus Block (90m)"
              desc="Run a deep work sprint on your top priority."
              state="ready"
              action={
                <div className="flex items-center gap-2">
                  <button onClick={()=>start(async()=>{ await startFocusBlock(); })} className="text-xs px-2 py-1 rounded-md border">Start</button>
                  <button onClick={()=>start(async()=>{ await completeFocusBlock(); await refresh(); })} className="text-xs px-2 py-1 rounded-md border">Complete</button>
                </div>
              }
            />
          </div>
          <div className="col-span-2">
            <div className={cn(TRS_CARD, "p-3")}>
              <div className="text-sm font-semibold text-black mb-2">Today&apos;s Priorities</div>
              <div className="space-y-2">
                {s.priorities.length === 0 ? (
                  <div className="text-[13px] text-gray-600">No priorities yet. Compute your plan to get curated actions.</div>
                ) : s.priorities.map(p => (
                  <PriorityRow key={p.id}
                    title={p.title} why={p.why} roi={p.roi$} effort={p.effort} status={p.status}
                    onCheck={()=>{/* stub */}} onDefer={()=>{/* stub */}} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Recaps & Revenue Digest */}
        <section className="grid grid-cols-2 gap-3">
          <CommandCard
            title="Generate EOD Recap"
            desc="Summarize dollars advanced, shipped items, risks, first action tomorrow."
            state="ready"
            action={
              <button onClick={()=>start(async()=>{ await generateRecap(); })} className="text-xs px-2 py-1 rounded-md border">Generate</button>
            }
          />
          <div className={cn(TRS_CARD, "p-3")}>
            <div className="text-sm font-semibold text-black mb-2">Revenue Digest</div>
            <SummaryFeed items={[
              "Pipeline confidence improved +4.2% overnight; education vertical slow approvals.",
              "Pricing changes lifted margin forecast by +3.2% M/M.",
              "Two invoices delayed; collections outreach recommended."
            ]}/>
          </div>
        </section>

        {/* Section 4: Feeds (Learning Feed + News Feed) */}
        <section className="grid grid-cols-2 gap-3">
          <NewsTicker />
          <NewsFeed />
        </section>

        {/* Footer link */}
        <section className="text-right pb-6">
          <a href="/dashboard" className="text-xs px-2 py-1 rounded-md border">Open Executive Dashboard</a>
        </section>
    </div>
  );
}
