import { getExecDashboard, exportBoardDeck } from "@/core/exec/actions";
import ScopeBar from "@/components/exec/ScopeBar";
import KpiCard from "@/components/exec/KpiCard";
import AlertList from "@/components/exec/AlertList";
import { SmallSpark } from "@/components/exec/SmallSpark";
import { Card } from "@/components/kit/Card";
import { AreaChart, BarChart } from "@/components/kit/Charts";
import Link from "next/link";

export default async function DashboardPage() {
  const d = await getExecDashboard();

  return (
    <div className="w-full p-3">
      {/* Scope controls & command bar */}
      <div className="mb-3 flex items-center justify-between">
        <ScopeBar initial={d.scope}/>
        <form action={exportBoardDeck}>
          <button className="text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">Export board deck</button>
        </form>
      </div>

      {/* GRID: 12 columns x 3 rows; keep heights to fit one screen */}
      <div className="grid gap-3" style={{gridTemplateColumns:"repeat(12,minmax(0,1fr))", gridTemplateRows:"110px 220px 230px"}}>
        {/* Row 1: Health Ribbon */}
        <Card className="col-span-3">
          <div className="p-3 grid grid-cols-2 gap-3">
            <KpiCard label="North Star Run-rate" value={`$${Math.round(d.ribbon.northStarRunRate/1000)}K`} hint={`${d.ribbon.northStarDeltaVsPlanPct}% vs plan`} />
            <KpiCard label="Cash on Hand" value={`$${Math.round(d.ribbon.cashOnHand/1000)}K`} hint={`${d.ribbon.runwayDays}d runway`}/>
            <KpiCard label="TRS Score" value={`${d.ribbon.trsScore}`} hint="0–100"/>
            <KpiCard label="Risk Index" value={`${d.ribbon.riskIndexPct}%`} hint="Prob. downside"/>
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200"><div className="text-sm font-medium">Sales</div></div>
          <div className="p-3 grid grid-cols-2 gap-3">
            <KpiCard label="Coverage (x)" value={d.sales.pipelineCoverageX.toFixed(1)} hint="vs target" />
            <KpiCard label="Win Rate 7d" value={`${d.sales.winRate7dPct}%`} />
            <KpiCard label="Win Rate 30d" value={`${d.sales.winRate30dPct}%`} />
            <KpiCard label="Cycle Time" value={`${d.sales.cycleTimeDaysMedian}d`} />
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200"><div className="text-sm font-medium">Finance</div></div>
          <div className="p-3 grid grid-cols-2 gap-3">
            <KpiCard label="AR Total" value={`$${Math.round(d.finance.arTotal/1000)}K`} />
            <KpiCard label="DSO" value={`${d.finance.dsoDays}d`} />
            <KpiCard label="Collected (7d)" value={`$${Math.round(d.finance.cashCollected7d/1000)}K`} />
            <KpiCard label="Price Realization" value={`${d.finance.priceRealizationPct}%`} />
          </div>
        </Card>
        <Card className="col-span-3">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200"><div className="text-sm font-medium">Total Revenue</div></div>
          <div className="p-2"><SmallSpark/></div>
        </Card>

        {/* Row 2: Forecast cone (wide) + Subscriptions bars */}
        <Card className="col-span-8">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200">
            <div className="text-sm font-medium">Forecast Cone</div>
            <Link href="/pipeline?tab=Analytics&action=commit" className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">
              Create Commit Set
            </Link>
          </div>
          <div className="h-[176px] p-2"><AreaChart/></div>
          <div className="px-3 pb-3 text-[11px] text-gray-500">p10 / p50 / p90 weekly bookings cone (stubbed)</div>
        </Card>
        <Card className="col-span-4">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200">
            <div className="text-sm font-medium">Subscriptions</div>
            <div className="text-[11px] text-gray-500">+180% MoM</div>
          </div>
          <div className="h-[176px] p-2"><BarChart/></div>
        </Card>

        {/* Row 3: Cash control + Pricing + Content + Alerts */}
        <Card className="col-span-4">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200">
            <div className="text-sm font-medium">Cash Control</div>
            <Link href="/finance?tab=Analytics#collections" className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">
              Accelerate +5d
            </Link>
          </div>
          <div className="p-3 grid grid-cols-2 gap-3">
            <KpiCard label="Due Today" value={`$${Math.round(d.cashPanel.dueToday/1000)}K`}/>
            <KpiCard label="Due This Week" value={`$${Math.round(d.cashPanel.dueThisWeek/1000)}K`}/>
            <KpiCard label="At Risk" value={`$${Math.round(d.cashPanel.atRisk/1000)}K`}/>
            <KpiCard label="Scenario DSO" value={`-${d.cashPanel.scenarioDSOdaysSaved}d`}/>
          </div>
        </Card>

        <Card className="col-span-4">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200">
            <div className="text-sm font-medium">Pricing Power & Deal Desk</div>
            <Link href="/pipeline?tab=Reports#deal-desk" className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 bg-white">
              Open Deal Desk
            </Link>
          </div>
          <div className="p-3 text-sm">
            <div className="mb-2 text-[11px] text-gray-500">Discount vs Win vs Margin (stub chart)</div>
            <div className="h-[80px] rounded-md border border-gray-200 flex items-center justify-center text-xs text-gray-500 bg-gray-50">Curve</div>
            <div className="mt-3">
              <div className="text-[12px] font-medium mb-1">Guardrail Breaches</div>
              <ul className="text-[12px] space-y-1">
                {d.pricing.guardrailBreaches.map(b => (
                  <li key={b.id} className="flex items-center justify-between">
                    <span>{b.account} • {b.discountPct}% • {b.owner}</span>
                    <Link className="text-xs px-2 py-0.5 rounded-md border border-gray-300 hover:bg-gray-100" href={`/pipeline?tab=Reports#deal-${b.id}`}>Review</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="col-span-4">
          <div className="h-[44px] px-3 flex items-center justify-between border-b border-gray-200">
            <div className="text-sm font-medium">Content Influence</div>
            <Link className="text-xs px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100" href="/content?tab=Analytics">Open Content</Link>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <KpiCard label="Influenced $" value={`$${Math.round(d.content.influenced/1000)}K`}/>
              <KpiCard label="Closed-Won $" value={`$${Math.round(d.content.closedWon/1000)}K`}/>
              <KpiCard label="Usage Rate" value={`${d.content.usageRatePct}%`}/>
              <KpiCard label="Advanced $" value={`$${Math.round(d.content.advanced/1000)}K`}/>
            </div>
            <div>
              <div className="text-[11px] font-medium mb-2 text-gray-700">Alerts</div>
              <AlertList items={d.alerts.slice(0,2)}/>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
